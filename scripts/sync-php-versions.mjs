#!/usr/bin/env node
/**
 * 同步 hub.docker.com/_/php 的最新 patch 版本到本仓库。
 *
 * 用法:
 *   node scripts/sync-php-versions.mjs            # dry-run，只打印计划
 *   node scripts/sync-php-versions.mjs --write    # 写回 versions.json / Dockerfile / README.md
 *   node scripts/sync-php-versions.mjs --check    # 只做离线一致性校验，不联网（用于 PR 门禁）
 *
 * 判定规则:
 *   1. 只认 `8.5.11-alpine` / `8.5.12RC1-alpine` 这类纯 alpine tag（与 Dockerfile 的 FROM 一致）
 *   2. 同一分支取 patch 最大者，正式版优先于 RC（8.5.12 > 8.5.12RC1）
 *   3. 目标 tag 必须真实存在，且包含 amd64 + arm64（packages.yml 会推这两个平台）
 *   4. versions.json 中 `tags` 数组里等于旧版本号的元素替换为新版本号，`latest` / `stable` 等别名永不动
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const MODE = resolveMode(process.argv);
const QUIET = process.argv.includes('--quiet');

const HUB = 'https://hub.docker.com/v2/repositories/library/php/tags';
const REQUIRED_PLATFORMS = ['amd64', 'arm64'];
const PLAIN_TAG = /^(\d+)\.(\d+)\.(\d+)(?:RC(\d+))?-alpine$/;
const IS_RC = /RC\d+$/i;
const ALIAS_TAG = /^(?:latest|stable|\d+\.\d+)$/;
const ALPINE_SUFFIX = '-alpine';

const log = (...args) => QUIET || console.log(...args);
const warn = (msg) => console.warn(`⚠️  ${msg}`);

// ---------------------------------------------------------------- 工具函数

function compareRank(a, b) {
  if (a[0] !== b[0]) return a[0] - b[0];
  if (a[1] === b[1]) return 0;
  return a[1] > b[1] ? 1 : -1;
}

function dockerfilePath(dir) {
  return join(ROOT, dir, 'Dockerfile');
}

function renderDockerfile(entry, nextVersion) {
  const path = dockerfilePath(entry.dir);
  const source = readFileSync(path, 'utf8');
  if (!/^FROM php:\S*-alpine\s*$/m.test(source)) {
    throw new Error(`${entry.dir}/Dockerfile 的 FROM 行不是 *-alpine，脚本不做自动改写`);
  }
  return { path, before: source, after: source.replace(/^FROM php:\S+-alpine\s*$/m, `FROM php:${nextVersion}-alpine`) };
}

function renderReadme(readme, entry, nextVersion) {
  const from = entry.version;
  let replaced = false;

  // 表格行形如 `| 8.5.11 | 8.5.11 | amd64/arm64 | ✅ Everything |`，
  // 只认「第一列 = 第二列 = 旧版本号」的行，避免误伤示例命令里的 tag。
  const lines = readme.split('\n').map((line) => {
    if (replaced) return line;

    const cells = line.split('|');
    if (cells.length < 4) return line;
    if (cells[1].trim() !== from || cells[2].trim() !== from) return line;

    replaced = true;
    cells[1] = padCell(cells[1], nextVersion);
    cells[2] = padCell(cells[2], nextVersion);
    return cells.join('|');
  });

  if (!replaced) {
    throw new Error(`README.md 中找不到「| ${from} | ${from} |」这样的表格行`);
  }
  return lines.join('\n');
}

/** 保持原有单元格宽度写入新版本号，新版本更长时自动撑宽 */
function padCell(rawCell, value) {
  const body = ` ${value} `;
  return body.length >= rawCell.length ? body : body + ' '.repeat(rawCell.length - body.length);
}

function readJson(path) {
  const raw = readFileSync(path, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`${path} 不是合法 JSON（${error.message}）`);
  }
}

function resolveMode(argv) {
  if (argv.includes('--check')) return 'check';
  if (argv.includes('--write')) return 'write';
  return 'dry-run';
}

/** 是否带 latest/stable 别名（这两个别名必须指向正式版） */
function keepsStableAlias(entry) {
  return entry.tags.some((tag) => tag === 'latest' || tag === 'stable');
}

/**
 * 决定某个分支要升到哪个版本。
 * - trackRc: true 的分支：任何新版本都跟
 * - trackRc: false 的分支：只跟正式版
 * - 未管理分支：仅在出现正式版时报告，提醒人工新建目录
 */
function planForBranch(entry, candidates) {
  if (!entry) {
    const stable = candidates.find((candidate) => !IS_RC.test(candidate.version));
    return stable ? { unmanaged: stable.version } : null;
  }

  // 是否跟随 RC：优先读显式配置，历史上带 latest/stable 别名的分支默认只跟正式版
  const keepsStableAlias = entry.tags.some((tag) => tag === 'latest' || tag === 'stable');
  const trackRc = entry.trackRc ?? !keepsStableAlias;
  const target = candidates.find((candidate) => trackRc || !IS_RC.test(candidate.version));
  if (!target || target.version === entry.version) return null;
  return { entry, nextVersion: target.version };
}

// ---------------------------------------------------------------- Docker Hub

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function hub(query, tries = 3) {
  let lastError;
  for (let attempt = 1; attempt <= tries; attempt += 1) {
    try {
      const response = await fetch(`${HUB}?${query}`, { headers: { Accept: 'application/json' } });
      if (response.ok) return await response.json();
      lastError = new Error(`Docker Hub 返回 ${response.status}`);
      if (response.status !== 429 && response.status < 500) break;
    } catch (error) {
      lastError = error;
    }
    await sleep(800 * attempt * attempt);
  }
  throw lastError ?? new Error('Docker Hub 请求失败');
}

/** 一次请求拿到最近推送的所有纯 alpine tag，按分支降序排出候选版本 */
async function latestPerBranch() {
  const data = await hub(`page_size=100&name=${ALPINE_SUFFIX}&ordering=last_updated`);
  const branches = new Map();

  for (const tag of data.results ?? []) {
    const matched = tag.name.match(PLAIN_TAG);
    if (!matched) continue;

    const [, major, minor, patch, , rc] = matched;
    const branch = `${major}.${minor}`;
    const candidate = {
      version: tag.name.slice(0, -ALPINE_SUFFIX.length),
      rank: [Number(patch), rc ? Number(rc) : Infinity],
    };

    if (!branches.has(branch)) branches.set(branch, []);
    branches.get(branch).push(candidate);
  }

  for (const candidates of branches.values()) {
    candidates.sort((a, b) => compareRank(b.rank, a.rank)); // 降序：最优候选在前
  }
  return branches;
}

/** 精确校验 tag 存在，并返回其支持平台（Docker Hub tag 列表是模糊匹配，必须二次确认） */
async function inspectTag(version) {
  const name = `${version}${ALPINE_SUFFIX}`;
  const data = await hub(`page_size=10&name=${encodeURIComponent(name)}`);
  const hit = (data.results ?? []).find((tag) => tag.name === name);
  if (!hit) return null;

  const platforms = new Set((hit.images ?? []).map((image) => image.architecture));
  return {
    missing: REQUIRED_PLATFORMS.filter((platform) => !platforms.has(platform)),
  };
}

// ---------------------------------------------------------------- --check

async function runCheck() {
  const entries = readJson(join(ROOT, 'versions.json'));
  const problems = [];
  let readme = readFileSync(join(ROOT, 'README.md'), 'utf8');

  for (const entry of entries) {
    const path = dockerfilePath(entry.dir);
    if (!existsSync(path)) {
      problems.push(`${entry.dir}/Dockerfile 不存在`);
      continue;
    }

    const source = readFileSync(path, 'utf8');
    const matched = source.match(/^FROM php:(\S+?)(-alpine)?\s*$/m);
    if (!matched) {
      problems.push(`${entry.dir}/Dockerfile 缺少可识别的 FROM 行`);
    } else if (matched[1] !== entry.version) {
      problems.push(`${entry.dir}/Dockerfile 是 ${matched[1]}，versions.json 是 ${entry.version}`);
    }

    if (!entry.tags.includes(entry.version)) {
      problems.push(`${entry.php} 的 tags 中没有当前版本号 ${entry.version}`);
    }
    for (const tag of entry.tags) {
      if (tag !== entry.version && !ALIAS_TAG.test(tag)) {
        problems.push(`${entry.php} 含未知 tag 别名 "${tag}"（应为 latest/stable/主版本.次版本）`);
      }
    }
    if (typeof entry.trackRc !== 'boolean') {
      problems.push(`${entry.php} 缺少布尔字段 trackRc（是否跟随 RC 版本）`);
    }
    if (entry.trackRc === false && IS_RC.test(entry.version)) {
      problems.push(`${entry.php} 声明不跟随 RC，但当前版本是 ${entry.version}`);
    }
    if (!entry.tags.some((tag) => tag === 'latest' || tag === 'stable')) {
      log(`ℹ️  ${entry.php} 只提供版本 tag，无 latest/stable 别名`);
    }
    if (keepsStableAlias(entry) && IS_RC.test(entry.version)) {
      problems.push(`${entry.php} 的 stable/latest 别名指向预发布版 ${entry.version}`);
    }

    try {
      readme = renderReadme(readme, entry, entry.version);
    } catch {
      problems.push(`README.md 缺少「| ${entry.version} | ${entry.version} |」行`);
    }
  }

  if (problems.length) {
    for (const problem of problems) console.error(`❌ ${problem}`);
    console.error(`\n共 ${problems.length} 处不一致，请运行 --write 修复，或手工对齐。`);
    process.exitCode = 1;
    return;
  }
  log(`✅ ${entries.length} 个分支的 versions.json / Dockerfile / README.md 一致`);
}

// ---------------------------------------------------------------- dry-run / write

async function runSync() {
  const entriesPath = join(ROOT, 'versions.json');
  const entries = readJson(entriesPath);
  const readmePath = join(ROOT, 'README.md');
  let readme = readFileSync(readmePath, 'utf8');

  const branches = await latestPerBranch();
  const entriesByBranch = new Map(entries.map((entry) => [entry.php, entry]));
  const plans = [];
  const unmanaged = [];

  // 1) 逐个分支决定是否升版（含上游新增分支的提醒）
  for (const [branch, candidates] of branches) {
    const plan = planForBranch(entriesByBranch.get(branch), candidates);
    if (!plan) continue;

    if (plan.unmanaged) {
      unmanaged.push(`${branch}（最新正式版 ${plan.unmanaged}）`);
      continue;
    }

    const { entry, nextVersion } = plan;
    let info;
    try {
      info = await inspectTag(nextVersion);
    } catch (error) {
      warn(`校验 ${nextVersion}${ALPINE_SUFFIX} 失败：${error.message}，本轮跳过 ${branch}`);
      continue;
    }
    if (!info) {
      warn(`${nextVersion}${ALPINE_SUFFIX} 在 Docker Hub 未确认，本轮跳过 ${branch}`);
      continue;
    }
    if (info.missing.length) {
      warn(`${nextVersion}${ALPINE_SUFFIX} 缺平台 ${info.missing.join(', ')}，本轮跳过 ${branch}`);
      continue;
    }

    plans.push({ entry, from: entry.version, nextVersion });
  }

  if (!plans.length) {
    log('✅ 所有分支已是最新');
  }

  // 2) 渲染
  for (const { entry, nextVersion } of plans) {
    const dockerfile = renderDockerfile(entry, nextVersion);
    const nextReadme = renderReadme(readme, entry, nextVersion);

    if (MODE === 'write') {
      writeFileSync(dockerfile.path, dockerfile.after);
      readme = nextReadme;
      entry.tags = entry.tags.map((tag) => (tag === entry.version ? nextVersion : tag));
      entry.version = nextVersion;
    } else {
      log(`[dry-run] ${entry.dir}: ${entry.version} → ${nextVersion}`);
    }
  }

  if (MODE === 'write' && plans.length) {
    writeFileSync(readmePath, readme);
    writeFileSync(entriesPath, `${JSON.stringify(entries, null, 2)}\n`);
    log(`✅ 已更新 ${plans.map(({ entry, nextVersion }) => `${entry.php} → ${nextVersion}`).join(', ')}`);
  }

  // 3) 输出到 Actions 摘要与警告
  const summary = [
    plans.length
      ? `### 已同步\n${plans
          .map(
            ({ entry, from, nextVersion }) =>
              `- PHP ${entry.php}: \`${from}\` → \`${nextVersion}\`（${entry.dir}/Dockerfile、README.md、versions.json）`,
          )
          .join('\n')}`
      : '### 无版本变化',
    unmanaged.length
      ? `\n### 需要人工添加目录\n上游已发布正式版但本仓库未添加目录：${unmanaged
          .map((item) => `\`${item}\``)
          .join('、')}\n请新增对应目录 + Dockerfile，并在 \`versions.json\` 补一条记录。`
      : '',
  ].join('\n');

  if (process.env.GITHUB_STEP_SUMMARY) {
    writeFileSync(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`, { flag: 'a' });
  }
  for (const item of unmanaged) {
    console.warn(`::warning::上游已有正式版但本仓库未管理：${item}，需要人工添加目录`);
  }

  if (!QUIET) console.log(`\n${summary}`);
}

// ---------------------------------------------------------------- 入口

try {
  if (MODE === 'check') await runCheck();
  else await runSync();
} catch (error) {
  console.error(`❌ ${error.message}`);
  process.exitCode = 2;
}

# Project conventions: laravel-docker

This is a fork of `lorisleiva/laravel-docker` that builds generic Laravel Docker images
and publishes them to Docker Hub, GHCR and Aliyun.

## Commit messages: English only

**Commit subjects and PR titles must be written in English.**

Prefixes, single-line format and the "no body" rule follow the global `AGENTS.md`;
**the language rule is defined here and takes precedence** over the global
"always use Simplified Chinese" instruction (the global file also states that
project rules win when they conflict with global ones).

| Context | Example |
|---------|---------|
| Global `AGENTS.md` | `fix(http): 修复缓存 key 串扰` |
| This project | `fix(http): fix cache key collision` |

A PR title becomes a commit subject on `master` after squash merge, so it follows
the same rule. PR **descriptions**, code comments and documentation are exempt and
may stay in Chinese.

### Rationale

- The release bots (dependabot, `sync-php.yml`) assume ASCII when handling subjects
- Keeping `master` single-language makes `git log --oneline` scannable
- `.github/workflows/ci.yml` enforces this via `Lint commit subject language` on both
  `pull_request` and `push` events

### Note for AI assistants

Never emit Chinese in commit messages or `gh pr create --title`, even when the
conversation itself is in Simplified Chinese:

```bash
# Correct
git commit -m "ci(verify): extend commit language gate to pushes"
gh pr create --title "ci(verify): extend commit language gate to pushes"

# Wrong — CI will reject this
git commit -m "ci(verify): 把提交语言门禁扩展到 push"
```

Talk to the user in Simplified Chinese; write commit messages in English.

## Version matrix

`versions.json` is the single source of truth for image versions (PHP version,
directory, published tags).

- Active directories: `8.3/`, `8.4/`, `8.5/`; EOL versions live under `eol/`
- To bump versions use `yarn sync:write`, which updates `versions.json`, the `FROM`
  line of every `Dockerfile` and the `README.md` table
- `yarn sync:check` runs the offline consistency check; always run it locally after edits

## Dependencies and image size

Images are Alpine-based and `apk add` intentionally does not pin versions
(DL3018 is ignored in `.hadolint.yaml`). Adding a package to the base image is a
cost paid by every user — for example `autoconf` / `automake` pull in `m4` and
`perl`, taking the Alpine layer from 21.3 MiB to 64.7 MiB. Confirm the package is
genuinely needed **at runtime** before adding it.

## CI gates

Branch protection only requires the single aggregate `verify` check
(see `.github/workflows/ci.yml`). Adding or removing matrix entries and renaming
jobs cannot silently break protection — this is deliberate; do not bypass it.

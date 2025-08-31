# laravel-docker

🐳 Generic docker image for Laravel Applications

[![Build and publish packages](https://github.com/curder/laravel-docker/actions/workflows/packages.yml/badge.svg?branch=master)](https://github.com/curder/laravel-docker/actions/workflows/packages.yml)

[![Docker Badge](https://img.shields.io/docker/pulls/curder/laravel-docker)](https://hub.docker.com/r/curder/laravel-docker/)

| Tags        | PHP version | Architecture | Features                                                                                                 |
|-------------|-------------|:-------------|----------------------------------------------------------------------------------------------------------|
| 8.1.33      | 8.1.33      | amd64/arm64  | ✅ Everything                                                                                             |
| 8.2.29      | 8.2.29      | amd64/arm64  | ✅ Everything                                                                                             |
| 8.3.24      | 8.3.24      | amd64/arm64  | ✅ Everything                                                                                             |
| 8.4.11      | 8.4.11      | amd64/arm64  | ✅ Everything                                                                                             |
| 8.5.0alpha2 | 8.5.0alpha2 | amd64/arm64  | ❌ Missing xdebug extension                                                                               |
| stable      | **8.4**     | amd64/arm64  | 🔗 Aliases the stable version of PHP that supports all features of this docker image.                    |
| latest      | **8.4**     | amd64/arm64  | 🔗 Aliases the latest version of PHP available (even if that version does not support all features yet). |

<details>
<summary>More EOL versions</summary>

| Tags   | PHP version | Architecture | Features     |
|--------|-------------|:-------------|--------------|
| 5.6.40 | 5.6.40      | amd64        | ✅ Everything |
| 7.0.33 | 7.0.33      | amd64        | ✅ Everything |
| 7.1.33 | 7.1.33      | amd64/arm64  | ✅ Everything |
| 7.2.34 | 7.2.34      | amd64/arm64  | ✅ Everything |
| 7.3.33 | 7.3.33      | amd64/arm64  | ✅ Everything |
| 7.4.33 | 7.4.33      | amd64/arm64  | ✅ Everything |
| 8.0.30 | 8.0.30      | amd64/arm64  | ✅ Everything |

</details>

> All PHP images use composer version 2, if you want to use version 1, please run `composer self-update --1` command.

## Usage

```bash
docker run --rm curder/laravel-docker:8.4.11 php -v
```

## Mirrors

- GitHub Mirror

    ```bash
    docker run --rm ghcr.io/curder/laravel-docker:8.4.11 php -v
    ```

- Ali Mirror

    ```bash
    docker run --rm registry.cn-hangzhou.aliyuncs.com/curder/laravel-docker:8.4.11 php -v
    ```

For Apple Silicon or other arm-based CPUs, use the `--platform linux/arm64` option.

### Use within your GitLab's pipelines

- [Run test suite and check code style](http://lorisleiva.com/using-gitlabs-pipeline-with-laravel/)
- [Build, test and deploy your Laravel application](http://lorisleiva.com/laravel-deployment-using-gitlab-pipelines/)

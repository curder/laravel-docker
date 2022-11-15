# laravel-docker
🐳 Generic docker image for Laravel Applications

[![Docker Badge](https://img.shields.io/docker/pulls/curder/laravel-docker)](https://hub.docker.com/r/curder/laravel-docker/)

| Tags | PHP version | Features |
| - | - | - |
| 5.6.40 | 5.6.40 | ✅ Everything |
| 7.0.33 | 7.0.33 | ✅ Everything |
| 7.1.33 | 7.1.33 | ✅ Everything |
| 7.2.34 | 7.2.34 | ✅ Everything |
| 7.3.33 | 7.3.33 | ✅ Everything |
| 7.4.32 | 7.4.32 | ✅ Everything |
| 8.0.25 | 8.0.25 | ✅ Everything |
| 8.1.12  | 8.1.12  | ✅ Everything |
| 8.2.0rc6  | 8.2.0rc6  | 🚧 Waiting for `php:8.2.0-alpine`. Currently using `php:8.2.0RC5-alpine3.16`. Extension `xdebug` missing. |
| stable | **7.4** | 🔗 Aliases the stable version of PHP that supports all features of this docker image.  |
| latest | **7.4** | 🔗 Aliases the latest version of PHP available (even if that version does not support all features yet). |

> All php image use Composer version is v2, if you want use v1, you can run `composer self-update --1`

## Usage

```bash
docker run --rm curder/laravel-docker:8.1.12 php -v
```

#### Use within your GitLab's pipelines.
* [Run test suite and check codestyle](http://lorisleiva.com/using-gitlabs-pipeline-with-laravel/)
* [Build, test and deploy your Laravel application](http://lorisleiva.com/laravel-deployment-using-gitlab-pipelines/)

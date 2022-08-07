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
| 7.4.30 | 7.4.30 | ✅ Everything |
| 8.0.20 | 8.0.20 | ✅ Everything |
| 8.1.7  | 8.1.7  | ✅ Everything |
| 8.2.0alpha2  | 8.2.0alpha2  | 🚧 Waiting for `php:8.2.0-alpine`. Currently using `php:8.2.0-alpha2`. Extension `xdebug` missing. |
| stable | **7.4** | 🔗 Aliases the stable version of PHP that supports all features of this docker image.  |
| latest | **7.4** | 🔗 Aliases the latest version of PHP available (even if that version does not support all features yet). |

> All php image use Composer version is v2, if you want use v1, you can run `composer self-update --1`

## Usage

```bash
docker run --rm curder/laravel-docker:8.1.7 php -v
```

#### Use within your GitLab's pipelines.
* [Run test suite and check codestyle](http://lorisleiva.com/using-gitlabs-pipeline-with-laravel/)
* [Build, test and deploy your Laravel application](http://lorisleiva.com/laravel-deployment-using-gitlab-pipelines/)

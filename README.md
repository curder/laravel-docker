# laravel-docker
🐳 Generic docker image for Laravel Applications

[![Docker Badge](https://img.shields.io/docker/pulls/curder/laravel-docker)](https://hub.docker.com/r/curder/laravel-docker/)

| Tags | PHP version | Features |
| - | - | - |
| 7.1 | 7.1 | ✅ Everything |
| 7.2 | 7.2 | ✅ Everything |
| 7.3 | 7.3 | ✅ Everything |
| 7.4 | 7.4 | ✅ Everything |
| 8.0 | 8.0 | ✅ Everything |
| 8.1 | 8.1 | ✅ Everything |
| stable | **7.3** | 🔗 Aliases the stable version of PHP that supports all features of this docker image.  |
| latest | **7.3** | 🔗 Aliases the latest version of PHP available (even if that version does not support all features yet). |

> All php image use Composer version is v2, if you want use v1, you can run `composer self-update --1`

## Usage

```bash
docker run --rm curder/laravel-docker:8.1 php -v
```

#### Use within your GitLab's pipelines.
* [Run test suite and check codestyle](http://lorisleiva.com/using-gitlabs-pipeline-with-laravel/)
* [Build, test and deploy your Laravel application](http://lorisleiva.com/laravel-deployment-using-gitlab-pipelines/)

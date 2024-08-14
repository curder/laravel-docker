# laravel-docker

🐳 Generic docker image for Laravel Applications

[![Build and publish packages](https://github.com/curder/laravel-docker/actions/workflows/packages.yml/badge.svg?branch=master)](https://github.com/curder/laravel-docker/actions/workflows/packages.yml)

[![Docker Badge](https://img.shields.io/docker/pulls/curder/laravel-docker)](https://hub.docker.com/r/curder/laravel-docker/)

| Tags        | PHP version  | Features                                                                                                               |
|-------------|--------------|------------------------------------------------------------------------------------------------------------------------|
| 5.6.40      | 5.6.40       | ✅ Everything                                                                                                           |
| 7.0.33      | 7.0.33       | ✅ Everything                                                                                                           |
| 7.1.33      | 7.1.33       | ✅ Everything                                                                                                           |
| 7.2.34      | 7.2.34       | ✅ Everything                                                                                                           |
| 7.3.33      | 7.3.33       | ✅ Everything                                                                                                           |
| 7.4.33      | 7.4.33       | ✅ Everything                                                                                                           |
| 8.0.30      | 8.0.30       | ✅ Everything                                                                                                           |
| 8.1.29      | 8.1.29       | ✅ Everything                                                                                                           |
| 8.2.22      | 8.2.22       | ✅ Everything                                                                                                           |
| 8.3.10      | 8.3.10       | ✅ Everything                                                                                                           |
| 8.4.0alpha3 | 8.4.0 Alpha3 | 🚧 Waiting for `php:8.4.0-alpine`. Currently using `php:8.4.0alpha3-alpine`. Extension `imagick` and `xdebug` missing. |
| stable      | **8.3**      | 🔗 Aliases the stable version of PHP that supports all features of this docker image.                                  |
| latest      | **8.3**      | 🔗 Aliases the latest version of PHP available (even if that version does not support all features yet).               |                            

> All PHP images use composer version 2, if you want to use version 1, please run `composer self-update --1` command.

## Usage

```bash
docker run --rm curder/laravel-docker:8.2.22 php -v
```

#### Use within your GitLab's pipelines.

* [Run test suite and check codestyle](http://lorisleiva.com/using-gitlabs-pipeline-with-laravel/)
* [Build, test and deploy your Laravel application](http://lorisleiva.com/laravel-deployment-using-gitlab-pipelines/)

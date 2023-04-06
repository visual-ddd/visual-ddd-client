#!/usr/bin/env bash

# Zadig 中构建
# 和Jenkins 的区别
#  zadig 接管了 docker 的构建和发布，不需要登录，直接使用 $IMAGE 构建即可
#  默认不在项目目录下，需要手动切换

set -e
set -x

# 不进行登录
export DOCKER_SKIP_LOGIN=true

# 切换到项目目录
cd $WORKSPACE/$REPONAME_0

env
node -v

npm i -g @wakeadmin/docker-build

# 构建镜像
node ./scripts/docker-build-in-zadig.js

docker push $IMAGE

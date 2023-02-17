#!/usr/bin/env bash

# Zadig 中构建
# 和Jenkins 的区别
#  zadig 接管了 docker 的构建和发布，不需要登录，直接使用 $IMAGE 构建即可

set -e
set -x

env
node -v

npm i -g pnpm
pnpm install

# 构建静态资源
pnpm build

# 构建镜像
node ./scripts/docker-build-in-zadig.js

docker push $IMAGE

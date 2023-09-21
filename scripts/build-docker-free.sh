#!/usr/bin/env bash

set -e
set -x

# 容器构建
# 需要提供以下参数

# DOCKER_USER docker 用户
# DOCKER_PASSWORD docker 用户密码


env
node -v


cd ./scripts && npm i && cd -

# 构建镜像
node ./scripts/docker-build.js

# 发布
node ./scripts/docker-publish.js

# 触发 Rancher 更新
node ./scripts/rancher-update.js


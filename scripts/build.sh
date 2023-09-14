#!/usr/bin/env bash

set -e
set -x

# 容器构建
# 需要提供以下参数
# DOCKER_USER docker 用户
# DOCKER_PASSWORD docker 用户密码

if [ -n "$DOCKER_SERVER" ]; then
  # defined
  echo image will push to $DOCKER_SERVER 
elif [ "$STAGE" = 'PRODUCTION' ]; then
  export DOCKER_SERVER=ccr.ccs.tencentyun.com
else
  export DOCKER_SERVER=zh-harbor.wakedata.net
fi

env
node -v


cd ./scripts && npm i && cd -

# 构建镜像
node ./scripts/docker-build.js

# 发布
node ./scripts/docker-publish.js

# 触发 Rancher 更新
node ./scripts/rancher-update.js

cd ./collab-server
node ../scripts/build-publish-collab-server.js
cd -

cd ./signaling
node ../scripts/build-publish-signaling.js
cd -
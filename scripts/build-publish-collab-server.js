const { build, publish } = require('@wakeadmin/docker-build');
const { DOCKER_IMAGE_PREFIX, DOCKER_VERSION, DOCKER_PUBLISH_LATEST } = require('./shared');

const imageName = `${DOCKER_IMAGE_PREFIX}/collab-server`;

if (process.cwd().endsWith('collab-server')) {
  build(imageName, {}, '--progress plain');
  publish(imageName, DOCKER_VERSION, DOCKER_PUBLISH_LATEST);
} else {
  console.log(`构建 ${imageName} 失败 -> 路径不正确（${process.cwd()}）`);
}

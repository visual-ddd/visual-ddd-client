const { build, publish } = require('@wakeadmin/docker-build');
const { DOCKER_IMAGE_PREFIX, PKG_VERSION } = require('./shared');

const imageName = `${DOCKER_IMAGE_PREFIX}/signaling`;

if (process.cwd().endsWith('signaling')) {
  build(imageName, {}, '--progress plain');
  publish(imageName, PKG_VERSION, true);
} else {
  console.log(`构建 ${imageName} 失败 -> 路径不正确（${process.cwd()}）`);
}

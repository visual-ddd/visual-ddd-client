const pkg = require('../package.json');

const IS_PRE = process.env.IS_PRE;
const NOW = new Date();
const BUILD_ID =
  process.env.BUILD_ID ??
  `${NOW.getFullYear()}${NOW.getMonth() + 1}${NOW.getDate()}${NOW.getHours()}${NOW.getMinutes()}`;

// 镜像名称
const DOCKER_IMAGE_NAME = pkg.imageName;

// 镜像版本
let DOCKER_VERSION = pkg.version;

if (IS_PRE) {
  DOCKER_VERSION = DOCKER_VERSION + `-pre`;
}

const WORKLOAD = pkg.workload;

const DOCKER_PUBLISH_LATEST = !IS_PRE;

const DOCKER_IMAGE_PREFIX = `visual-ddd`;

module.exports = {
  DOCKER_IMAGE_NAME,
  DOCKER_VERSION,
  PRODUCTION: !DOCKER_PUBLISH_LATEST,
  WORKLOAD,
  DOCKER_PUBLISH_LATEST,
  DOCKER_IMAGE_PREFIX,
};

const { build } = require('@wakeadmin/docker-build');

build(
  process.env.IMAGE,
  {
    SENTRY_DSN: process.env.SENTRY_DSN,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
    PRODUCTION_SOURCE_MAP: process.env.PRODUCTION_SOURCE_MAP,
  },
  '--progress plain'
);

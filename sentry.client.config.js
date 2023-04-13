// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN || 'https://315ef22933e242d0bd938e6ff8b7a093@o4504801077559296.ingest.sentry.io/4504801258307584',
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,
  release: process.env.VERSION,
  // ...
  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps
  enabled: process.env.NODE_ENV === 'production',
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    /attempted to hard navigate to the same URL/i,
    /The user aborted a request/i,
    /Failed to fetch/i,
    'network error',
    '请登录后重试',
  ],
});

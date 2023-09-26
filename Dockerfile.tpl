<%
const ENV = {}
if (typeof PRODUCTION_SOURCE_MAP !== 'undefined') {
	ENV.PRODUCTION_SOURCE_MAP = PRODUCTION_SOURCE_MAP
} 

if (typeof SENTRY_DSN !== 'undefined') {
	ENV.SENTRY_DSN = SENTRY_DSN
}

if (typeof SENTRY_AUTH_TOKEN !== 'undefined') {
	ENV.SENTRY_AUTH_TOKEN = SENTRY_AUTH_TOKEN
}

if (typeof SENTRY_ORG !== 'undefined') {
	ENV.SENTRY_ORG = SENTRY_ORG
}

if (typeof SENTRY_PROJECT !== 'undefined') {
	ENV.SENTRY_PROJECT = SENTRY_PROJECT
}

if (typeof BD_ANALYZE_KEY !== 'undefined') {
	ENV.BD_ANALYZE_KEY = BD_ANALYZE_KEY
}

const ENVInString = Object.keys(ENV).filter(k => ENV[k]).map(k => `ENV ${k} ${ENV[k]}`).join('\n')

%>

FROM node:19-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"


# 0. 构建依赖, 为什么要分开一步构建依赖呢，这是为了利用 Docker 的构建缓存
FROM base AS deps
RUN apk add --no-cache libc6-compat
RUN npm i -g pnpm
WORKDIR /app
COPY package.json .npmrc pnpm-lock.yaml* ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store,sharing=locked pnpm install --frozen-lockfile



# 1. 第一步构建编译
FROM base AS builder
WORKDIR /app

# COPY 依赖
COPY --from=deps /app/node_modules /app/node_modules
# COPY 源代码
COPY . .

<%= ENVInString %>

# COPY .env.production.sample .env.production
# RUN env && ls -a && npm run build
RUN --mount=type=cache,target=/app/dist,id=app_dist,sharing=locked npm run build 




# 2. 第二步，运行
FROM base AS runner

ENV NODE_ENV production

<%= ENVInString %>

# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

WORKDIR /app

COPY --from=builder --chown=nextjs:nodejs app/public /app/public
COPY --from=builder --chown=nextjs:nodejs app/.next/standalone /app
COPY --from=builder --chown=nextjs:nodejs app/.next/static /app/.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
FROM node:19-alpine AS base

# 第一步 安装依赖
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json .npmrc pnpm-lock.yaml* ./
RUN npm i -g pnpm@7 && pnpm install  && ls


# 第二步运行
FROM base as runner 

ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

WORKDIR /app

COPY --from=deps --chown=nextjs:nodejs /app/ ./
COPY --chown=nextjs:nodejs ./index.mjs .

USER nextjs

EXPOSE 9090

CMD ["node", "index.mjs"]

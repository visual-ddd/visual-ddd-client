FROM node:19-alpine

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

WORKDIR /app

COPY --chown=nextjs:nodejs ./public /app/public
COPY --chown=nextjs:nodejs ./.next/standalone /app
COPY --chown=nextjs:nodejs ./.next/static /app/.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]

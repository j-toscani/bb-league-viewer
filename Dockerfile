# --- Build Stage ---
FROM node:22-alpine AS build

RUN apk add --no-cache libc6-compat
RUN corepack enable pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm run build

# --- Production Stage ---
FROM node:22-alpine AS production

RUN apk add --no-cache libc6-compat
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

RUN mkdir -p /data && chown nextjs:nodejs /data

USER nextjs

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1

CMD ["node", "server.js"]

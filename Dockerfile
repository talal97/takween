# syntax=docker/dockerfile:1
FROM node:20-slim AS base
WORKDIR /app

# --- deps ---
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# --- builder ---
FROM base AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_SITE_URL=https://takween.com
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ARG AUTH_SECRET=build-time-only-placeholder-not-a-real-secret
ENV AUTH_SECRET=$AUTH_SECRET
ARG DATABASE_URL=postgresql://takween:changeme@localhost:5432/takween?schema=public
ENV DATABASE_URL=$DATABASE_URL
RUN npx prisma generate \
    && npm run build

# --- runner ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ARG NEXT_PUBLIC_SITE_URL=https://takween.com
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ARG AUTH_SECRET=build-time-only-placeholder-not-a-real-secret
ENV AUTH_SECRET=$AUTH_SECRET

RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/* \
    && addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Full node_modules (not just cherry-picked prisma/@prisma/.prisma folders) so the
# Prisma CLI has all of its own transitive runtime dependencies (e.g. @prisma/config
# pulls in effect/c12/deepmerge-ts/empathic) available to run migrations/seed at boot.
# Next's own traced "standalone" output below still takes precedence for the app itself.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

COPY --from=builder /app/scripts ./scripts
RUN chmod +x ./scripts/start.sh \
    && mkdir -p data

# Standalone Next.js runtime
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Own everything (incl. .next overwritten by the COPYs above) so the
# prerender cache and upload dir are writable by the nextjs user.
RUN chown -R nextjs:nodejs /app

USER nextjs
EXPOSE 3000
CMD ["sh", "scripts/start.sh"]
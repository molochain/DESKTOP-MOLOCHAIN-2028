FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

FROM base AS deps
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

FROM base AS builder
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=7020
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 comms
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
USER comms
EXPOSE 7020
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:7020/health || exit 1
CMD ["node", "dist/index.js"]

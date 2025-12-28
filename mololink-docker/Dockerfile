# Mololink Service - Production Dockerfile
# Multi-stage build for optimized Node.js application

# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev && npm cache clean --force

# ============================================
# Stage 2: Production
# ============================================
FROM node:20-alpine AS production

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S mololink -u 1001

RUN apk add --no-cache dumb-init

COPY --from=deps /app/node_modules ./node_modules

COPY --chown=mololink:nodejs . .

RUN mkdir -p public/uploads/profiles && \
    chown -R mololink:nodejs public/uploads

ENV NODE_ENV=production
ENV PORT=5001

EXPOSE 5001

USER mololink

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5001/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]

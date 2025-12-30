FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

FROM node:20-alpine AS runner

RUN apk add --no-cache curl && \
    addgroup -g 1001 -S nodejs && \
    adduser -S gateway -u 1001

WORKDIR /app

COPY --from=builder /app/package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY --from=builder /app/dist ./dist

USER gateway

ENV NODE_ENV=production
ENV GATEWAY_PORT=4000
ENV GATEWAY_HOST=0.0.0.0

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:4000/health/live || exit 1

CMD ["node", "dist/index.js"]

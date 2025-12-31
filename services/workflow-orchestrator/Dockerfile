FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache curl

COPY package.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache curl postgresql-client

COPY package.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 5003

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5003/health || exit 1

USER node

CMD ["node", "dist/index.js"]

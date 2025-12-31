FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache curl postgresql-client redis

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5003

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5003/health || exit 1

USER node

CMD ["node", "dist/index.js"]

FROM node:18-alpine

RUN apk add --no-cache postgresql-client gzip

WORKDIR /app

COPY package.json ./
RUN npm install --production

COPY index.js ./

RUN mkdir -p /var/backups/postgres

EXPOSE 7003

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -q --spider http://localhost:7003/health || exit 1

CMD ["node", "index.js"]

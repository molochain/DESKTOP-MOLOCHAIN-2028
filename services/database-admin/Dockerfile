FROM node:18-alpine

RUN apk add --no-cache postgresql-client gzip

WORKDIR /app

COPY package.json ./
RUN npm install --production

COPY index.js ./

RUN mkdir -p /var/backups/postgres

EXPOSE 7003

CMD ["node", "index.js"]

FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --production

COPY index.js ./

EXPOSE 7002

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -q --spider http://localhost:7002/health || exit 1

CMD ["node", "index.js"]

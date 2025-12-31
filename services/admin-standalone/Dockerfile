# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage - Nginx
FROM nginx:alpine AS production

# Copy custom nginx config template
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Create entrypoint script to substitute env vars
RUN echo '#!/bin/sh' > /docker-entrypoint.d/20-envsubst-custom.sh && \
    echo 'envsubst "\$INTERNAL_API_KEY" < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.d/20-envsubst-custom.sh && \
    chmod +x /docker-entrypoint.d/20-envsubst-custom.sh

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/health || exit 1

# Expose port
EXPOSE 80

# Start nginx (uses default entrypoint which runs envsubst scripts)
CMD ["nginx", "-g", "daemon off;"]

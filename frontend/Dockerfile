# GROUPE YAMA+ Frontend Dockerfile
# Utilise Node 16 pour compatibilité avec react-scripts 5.0.1

FROM node:16-alpine as build

WORKDIR /app

# Build arguments for environment variables
ARG REACT_APP_BACKEND_URL=https://groupeyamaplus.com
ARG REACT_APP_VAPID_PUBLIC_KEY

# Set environment variables for build
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL
ENV REACT_APP_VAPID_PUBLIC_KEY=$REACT_APP_VAPID_PUBLIC_KEY
ENV CI=false
ENV GENERATE_SOURCEMAP=false
ENV SKIP_PREFLIGHT_CHECK=true

# Copy package files first (for better caching)
COPY package.json ./
COPY craco.config.js ./

# Install dependencies
RUN npm install --legacy-peer-deps --no-audit --no-fund

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine

# Remove default nginx config
RUN rm -rf /etc/nginx/conf.d/*

# Copy build files
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

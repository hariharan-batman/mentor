# Multi-stage Dockerfile for FounderDock
# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/client

# Copy frontend package files
COPY client/package*.json ./

# Install frontend dependencies
RUN npm install

# Copy frontend source
COPY client/ ./

# Build frontend
RUN npm run build

# Stage 2: Build Backend
FROM node:18-alpine AS backend-builder

WORKDIR /app/server

# Copy backend package files
COPY server/package*.json ./

# Install backend dependencies
RUN npm install --production

# Copy backend source
COPY server/ ./

# Stage 3: Production - Backend with Frontend
FROM node:18-alpine

WORKDIR /app

# Install nginx to serve frontend
RUN apk add --no-cache nginx supervisor

# Copy backend from builder
COPY --from=backend-builder /app/server ./server

# Copy built frontend from builder
COPY --from=frontend-builder /app/client/dist ./client/dist

# Create nginx config for frontend
RUN mkdir -p /run/nginx && \
    mkdir -p /etc/nginx/conf.d

# Nginx configuration
COPY <<EOF /etc/nginx/http.d/default.conf
server {
    listen 80;
    server_name _;
    root /app/client/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # Handle SPA routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Supervisor configuration to run both nginx and node
COPY <<EOF /etc/supervisord.conf
[supervisord]
nodaemon=true
user=root
logfile=/dev/stdout
logfile_maxbytes=0
loglevel=info

[program:nginx]
command=nginx -g 'daemon off;'
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
autorestart=true

[program:backend]
command=node /app/server/index.js
directory=/app/server
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
autorestart=true
environment=NODE_ENV=production
EOF

# Expose port 80 for the application
EXPOSE 80

# Start supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]

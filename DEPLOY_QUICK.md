# Quick Deployment to Coolify

## Files Created
✅ `docker-compose.yml` - Main orchestration file
✅ `server/Dockerfile` - Backend container configuration
✅ `client/Dockerfile` - Frontend container configuration
✅ `client/nginx.conf` - Nginx web server configuration
✅ `.env` - Environment variables
✅ `.dockerignore` files - Optimize Docker builds
✅ `COOLIFY_DEPLOYMENT.md` - Complete deployment guide

## Quick Start (3 Steps)

### 1. Push to GitHub
```bash
git add .
git commit -m "Add Coolify deployment configuration"
git push origin main
```

### 2. Setup Coolify
- Login to Coolify at `http://your-vps-ip:8000`
- Create new project → Add repository
- Select "Docker Compose" as build pack
- Add environment variable: `GEMINI_API_KEY`

### 3. Deploy
- Click "Deploy" button
- Wait 3-5 minutes
- Access at your domain or VPS IP

## Alternative: Manual Docker Deployment

```bash
# SSH to your VPS
ssh root@your-vps-ip

# Clone repository
git clone https://github.com/yourusername/your-repo.git
cd your-repo

# Build and start
docker-compose up -d --build

# Check status
docker-compose ps
docker-compose logs -f
```

## Verify Deployment
✅ Frontend: `http://your-domain.com`
✅ API Health: `http://your-domain.com/api/health`

## Useful Commands
```bash
# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Update after changes
git pull && docker-compose up -d --build

# Stop everything
docker-compose down
```

For detailed instructions, see [COOLIFY_DEPLOYMENT.md](COOLIFY_DEPLOYMENT.md)

# Coolify Configuration for FounderDock

## Build Settings for Coolify Dashboard

When deploying to Coolify, use these settings:

### General Settings
- **Build Pack**: Dockerfile
- **Dockerfile Location**: `./Dockerfile` (root)
- **Port**: 80
- **Base Directory**: `/` (leave empty or root)

### Environment Variables
Add these in Coolify's Environment Variables section:
```
GEMINI_API_KEY=your_actual_gemini_api_key_here
PORT=5001
NODE_ENV=production
```

### Domain Configuration
- **Port Exposes**: 80
- **Port Publish**: 80 (or let Coolify auto-assign)

### Health Check
- **Health Check Path**: `/api/health`
- **Health Check Port**: 80
- **Health Check Method**: GET

## Deployment Process

1. **Connect Repository**:
   - Go to Coolify Dashboard
   - Create New Resource
   - Connect GitHub repository: `kbprashant/mentor`
   - Branch: `main`

2. **Configure Build**:
   - Select "Dockerfile" as build pack
   - Dockerfile path: `Dockerfile` (root)
   - No need to specify docker-compose.yml

3. **Set Environment Variables**:
   - Add `GEMINI_API_KEY` with your API key
   - Mark it as "Secret"

4. **Deploy**:
   - Click "Deploy" button
   - Monitor logs for any errors
   - Deployment typically takes 3-5 minutes

5. **Verify**:
   - Access your domain
   - Check `/api/health` endpoint
   - Test AI chat functionality

## Architecture

The Dockerfile uses a multi-stage build:
- **Stage 1**: Builds React frontend (Vite)
- **Stage 2**: Prepares Node.js backend
- **Stage 3**: Combines both with Nginx + Supervisor
  - Nginx serves frontend on port 80
  - Nginx proxies `/api/*` to backend on port 5001
  - Supervisor manages both processes

## Troubleshooting

### If deployment fails:
1. Check Coolify build logs
2. Verify all files are committed and pushed
3. Ensure Dockerfile is at root level
4. Check environment variables are set

### Common Issues:

**Issue**: "Dockerfile not found"
- **Solution**: Make sure you selected "Dockerfile" (not Docker Compose) in build pack

**Issue**: "API not responding"
- **Solution**: Check environment variables, ensure GEMINI_API_KEY is set

**Issue**: "502 Bad Gateway"
- **Solution**: Backend may be starting, wait 30 seconds and retry

## Manual Testing (Optional)

Test the Docker image locally before deploying:
```bash
docker build -t founderdock:test .
docker run -p 80:80 -e GEMINI_API_KEY=your_key founderdock:test
```

Access at `http://localhost`

## Notes
- Frontend and backend run in a single container
- Data persists in `/app/server/data` (consider adding volume mount in Coolify)
- Logs are sent to stdout/stderr for Coolify to capture

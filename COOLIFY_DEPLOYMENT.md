# Deployment Guide: Coolify on Hostinger VPS

This guide will help you deploy the FounderDock application to Coolify running on your Hostinger VPS.

## Prerequisites

1. **Hostinger VPS** with:
   - Ubuntu 20.04+ or Debian 11+
   - At least 2GB RAM
   - Docker and Docker Compose installed
   - Coolify installed and running

2. **Domain Name** (optional but recommended):
   - Point your domain to your VPS IP address
   - Configure A record in your DNS settings

## Step 1: Install Coolify on Your VPS

If you haven't installed Coolify yet:

```bash
# SSH into your Hostinger VPS
ssh root@your-vps-ip

# Install Coolify (one-line installation)
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

After installation, access Coolify at `http://your-vps-ip:8000`

## Step 2: Prepare Your Repository

1. **Commit and push all changes** to your Git repository:
   ```bash
   git add .
   git commit -m "Add Docker configuration for Coolify deployment"
   git push origin main
   ```

2. **Create .env file** in the root directory:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your actual Gemini API key:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

## Step 3: Deploy Using Coolify Dashboard

### Method A: Deploy via GitHub/GitLab (Recommended)

1. **Login to Coolify** at `http://your-vps-ip:8000`

2. **Create a New Project**:
   - Click "New Project"
   - Name it "FounderDock" or your preferred name

3. **Add a New Resource**:
   - Click "New Resource"
   - Select "Public Repository" or connect your GitHub/GitLab account
   - Enter your repository URL
   - Select branch: `main`

4. **Configure Build Settings**:
   - Build Pack: Select "Docker Compose"
   - Docker Compose File: `docker-compose.yml`
   - Base Directory: `/` (root)

5. **Set Environment Variables**:
   - Click on "Environment Variables"
   - Add: `GEMINI_API_KEY` with your API key value
   - Make sure it's marked as secret

6. **Configure Domain** (optional):
   - Go to "Domains" tab
   - Add your custom domain or use Coolify's provided domain
   - Enable "Generate SSL Certificate" for HTTPS

7. **Deploy**:
   - Click "Deploy" button
   - Monitor the build logs
   - Wait for deployment to complete (usually 3-5 minutes)

### Method B: Deploy via Docker Compose (Alternative)

1. **SSH into your VPS**:
   ```bash
   ssh root@your-vps-ip
   ```

2. **Clone your repository**:
   ```bash
   git clone https://github.com/yourusername/your-repo.git
   cd your-repo
   ```

3. **Create .env file**:
   ```bash
   nano .env
   ```
   Add:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

4. **Build and start the containers**:
   ```bash
   docker-compose up -d --build
   ```

5. **Check status**:
   ```bash
   docker-compose ps
   docker-compose logs -f
   ```

## Step 4: Configure Nginx Reverse Proxy (If using Method B)

If you deployed manually (Method B), set up Nginx as a reverse proxy:

1. **Install Nginx** (if not already installed):
   ```bash
   apt update
   apt install nginx -y
   ```

2. **Create Nginx configuration**:
   ```bash
   nano /etc/nginx/sites-available/founderdock
   ```

   Add this configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;  # Replace with your domain

       location / {
           proxy_pass http://localhost:80;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **Enable the site**:
   ```bash
   ln -s /etc/nginx/sites-available/founderdock /etc/nginx/sites-enabled/
   nginx -t
   systemctl reload nginx
   ```

4. **Install SSL certificate** (optional but recommended):
   ```bash
   apt install certbot python3-certbot-nginx -y
   certbot --nginx -d your-domain.com
   ```

## Step 5: Verify Deployment

1. **Access your application**:
   - Open browser and navigate to `http://your-vps-ip` or `http://your-domain.com`
   - You should see the FounderDock landing page

2. **Check API health**:
   - Navigate to `http://your-domain.com/api/health`
   - Should return: `{"status":"ok","message":"FounderDock AI Server Running"}`

3. **Test functionality**:
   - Try the AI Chat feature
   - Check if diagnostics load
   - Verify company profile updates

## Step 6: Maintenance Commands

### View Logs
```bash
# View all logs
docker-compose logs -f

# View backend logs only
docker-compose logs -f backend

# View frontend logs only
docker-compose logs -f frontend
```

### Restart Services
```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Update Application
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose up -d --build
```

### Stop Application
```bash
docker-compose down
```

### Stop and Remove Volumes
```bash
docker-compose down -v
```

## Troubleshooting

### Issue: Cannot connect to application
**Solution:**
- Check if containers are running: `docker-compose ps`
- Check firewall rules: `ufw status`
- Open port 80: `ufw allow 80/tcp`
- Check logs: `docker-compose logs -f`

### Issue: Backend API not responding
**Solution:**
- Check backend container: `docker-compose logs backend`
- Verify environment variables: `docker-compose exec backend env | grep GEMINI`
- Restart backend: `docker-compose restart backend`

### Issue: Frontend shows 502 Bad Gateway
**Solution:**
- Backend might not be ready
- Wait 30 seconds and refresh
- Check backend health: `docker-compose exec backend wget -qO- http://localhost:5001/api/health`

### Issue: Data not persisting
**Solution:**
- Check volume mounts in docker-compose.yml
- Ensure `./server/data` directory exists
- Check permissions: `chmod -R 755 ./server/data`

## Performance Optimization

1. **Enable HTTP/2** in Nginx configuration
2. **Configure CDN** (Cloudflare) for static assets
3. **Set up monitoring** with Coolify's built-in monitoring
4. **Enable auto-scaling** if traffic increases
5. **Regular backups** of the `./server/data` directory

## Security Best Practices

1. **Keep secrets secure**:
   - Never commit `.env` file to Git
   - Use Coolify's environment variable encryption

2. **Enable HTTPS**:
   - Use Coolify's built-in SSL certificate generation
   - Or manually configure Let's Encrypt

3. **Regular updates**:
   - Keep Docker images updated
   - Update dependencies regularly: `npm update`

4. **Configure firewall**:
   ```bash
   ufw enable
   ufw allow 22/tcp   # SSH
   ufw allow 80/tcp   # HTTP
   ufw allow 443/tcp  # HTTPS
   ufw allow 8000/tcp # Coolify (restrict to your IP)
   ```

5. **Limit Coolify access**:
   ```bash
   # Allow Coolify access only from your IP
   ufw allow from YOUR_IP to any port 8000
   ```

## Backup Strategy

### Automated Backup Script
Create a backup script:

```bash
nano /root/backup-founderdock.sh
```

Add:
```bash
#!/bin/bash
BACKUP_DIR="/root/backups/founderdock"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup data
tar -czf $BACKUP_DIR/data_$DATE.tar.gz /path/to/mentor/server/data

# Keep only last 7 days of backups
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: data_$DATE.tar.gz"
```

Make it executable and schedule:
```bash
chmod +x /root/backup-founderdock.sh
crontab -e
```

Add daily backup at 2 AM:
```
0 2 * * * /root/backup-founderdock.sh
```

## Support

If you encounter any issues:
1. Check Coolify logs in the dashboard
2. Review Docker container logs
3. Check the GitHub repository issues
4. Contact Coolify support: https://coolify.io/docs

## Useful Links

- Coolify Documentation: https://coolify.io/docs
- Docker Compose Reference: https://docs.docker.com/compose/
- Nginx Documentation: https://nginx.org/en/docs/
- Let's Encrypt: https://letsencrypt.org/

---

**Your application should now be successfully deployed on Coolify!** 🚀

Access it at: `http://your-domain.com` or `http://your-vps-ip`

# EC2 Deployment Guide

This guide explains how to deploy the Invite Ellie frontend to an EC2 server without any code changes.

## Prerequisites

- EC2 instance running Ubuntu/Debian (or similar Linux distribution)
- Nginx installed
- Node.js and npm installed (for building)
- Domain name pointing to your EC2 instance (optional but recommended)

## Deployment Steps

### 1. Build the Frontend

On your local machine or CI/CD pipeline:

```bash
npm install
npm run build
```

This creates a `dist` folder with the production build.

### 2. Transfer Files to EC2

Upload the `dist` folder to your EC2 instance:

```bash
# Using SCP
scp -r dist/ user@your-ec2-ip:/var/www/invite-ellie-frontend/

# Or using rsync (better for updates)
rsync -avz dist/ user@your-ec2-ip:/var/www/invite-ellie-frontend/dist/
```

### 3. Install and Configure Nginx

On your EC2 instance:

```bash
# Install Nginx (if not already installed)
sudo apt update
sudo apt install nginx -y

# Copy the nginx configuration
sudo cp nginx.conf.example /etc/nginx/sites-available/invite-ellie-frontend

# Edit the configuration file
sudo nano /etc/nginx/sites-available/invite-ellie-frontend
```

Update the following in the config file:
- `server_name`: Replace with your domain name or EC2 public IP
- `root`: Ensure the path matches where you uploaded the `dist` folder
- `proxy_pass`: Update if your backend URL is different

### 4. Enable the Site

```bash
# Create symbolic link to enable the site
sudo ln -s /etc/nginx/sites-available/invite-ellie-frontend /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 5. Configure Firewall

```bash
# Allow HTTP traffic
sudo ufw allow 'Nginx Full'
# Or specifically:
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### 6. (Optional) Set Up HTTPS with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Certbot will automatically configure HTTPS
```

## How It Works

The frontend code uses `/api` as the API base URL in production. Nginx intercepts these requests and proxies them to your backend:

```
Browser Request: https://your-domain.com/api/accounts/me/
         ↓
Nginx Proxy: https://api.stage.inviteellie.ai/api/accounts/me/
         ↓
Backend Response (via Nginx)
```

This approach:
- ✅ **No code changes needed** - Frontend already uses `/api` path
- ✅ **No CORS issues** - Requests appear same-origin to the browser
- ✅ **Works on Vercel** - Uses Vercel rewrites
- ✅ **Works on EC2** - Uses Nginx reverse proxy
- ✅ **Works in development** - Uses Vite dev proxy

## Updating the Frontend

When you need to update the frontend:

```bash
# 1. Build locally
npm run build

# 2. Upload to EC2
rsync -avz dist/ user@your-ec2-ip:/var/www/invite-ellie-frontend/dist/

# 3. No need to restart Nginx for static file updates
```

## Troubleshooting

### Check Nginx Status
```bash
sudo systemctl status nginx
```

### Check Nginx Error Logs
```bash
sudo tail -f /var/log/nginx/error.log
```

### Check Nginx Access Logs
```bash
sudo tail -f /var/log/nginx/access.log
```

### Test API Proxy
```bash
curl http://localhost/api/accounts/me/
```

### Verify Backend URL
Make sure `https://api.stage.inviteellie.ai` is accessible from your EC2 instance:
```bash
curl https://api.stage.inviteellie.ai/api/accounts/me/
```

## Alternative: Using Apache

If you prefer Apache over Nginx, you can use a similar setup with mod_proxy:

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    
    DocumentRoot /var/www/invite-ellie-frontend/dist
    
    # Proxy API requests
    ProxyPass /api/ https://api.stage.inviteellie.ai/api/
    ProxyPassReverse /api/ https://api.stage.inviteellie.ai/api/
    
    # Serve static files
    <Directory /var/www/invite-ellie-frontend/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```


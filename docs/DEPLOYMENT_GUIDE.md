# CampusConnect – Production Deployment Guide

## 1. Prerequisites
- Linux Server (Ubuntu 22.04 LTS recommended) or Windows Server
- Python 3.11+
- Node.js 18+ and npm
- MySQL 8.0+ Server (or Managed Cloud MySQL, e.g., AWS RDS, PlanetScale, DigitalOcean)
- Nginx Web Server

---

## 2. MySQL Database Setup

1. Log in to MySQL:
   ```bash
   mysql -u root -p
   ```
2. Create database and dedicated user:
   ```sql
   CREATE DATABASE campusconnect_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'campus_user'@'localhost' IDENTIFIED BY 'StrongSecurePassword123!';
   GRANT ALL PRIVILEGES ON campusconnect_db.* TO 'campus_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

---

## 3. Backend Deployment (Flask + Gunicorn + Systemd)

1. Clone repository to `/var/www/campusconnect`:
   ```bash
   git clone <repo-url> /var/www/campusconnect
   cd /var/www/campusconnect/backend
   ```
2. Create Python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install --upgrade pip
   pip install -r requirements.txt
   ```
3. Configure `.env`:
   ```ini
   FLASK_ENV=production
   SECRET_KEY=generate-a-64-character-random-hex-string
   JWT_SECRET_KEY=generate-another-random-hex-string
   JWT_ACCESS_TOKEN_EXPIRES_HOURS=24
   PORT=5000
   DATABASE_URL=mysql+pymysql://campus_user:StrongSecurePassword123!@localhost:3306/campusconnect_db
   UPLOAD_FOLDER=/var/www/campusconnect/backend/uploads
   CORS_ORIGINS=https://campusconnect.yourdomain.edu
   ```
4. Run Seed / Migrations:
   ```bash
   python seed.py
   ```
5. Configure Systemd service (`/etc/systemd/system/campusconnect-backend.service`):
   ```ini
   [Unit]
   Description=CampusConnect Gunicorn Backend
   After=network.target

   [Service]
   User=www-data
   Group=www-data
   WorkingDirectory=/var/www/campusconnect/backend
   Environment="PATH=/var/www/campusconnect/backend/venv/bin"
   ExecStart=/var/www/campusconnect/backend/venv/bin/gunicorn --workers 4 --bind 127.0.0.1:5000 wsgi:app

   [Install]
   WantedBy=multi-user.target
   ```
6. Start service:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl start campusconnect-backend
   sudo systemctl enable campusconnect-backend
   ```

---

## 4. Frontend Deployment (Vite + Nginx)

1. Build production static bundle:
   ```bash
   cd /var/www/campusconnect/frontend
   npm install
   npm run build
   ```
   This generates the optimized bundle in `/var/www/campusconnect/frontend/dist`.

2. Configure Nginx (`/etc/nginx/sites-available/campusconnect`):
   ```nginx
   server {
       listen 80;
       server_name campusconnect.yourdomain.edu;

       root /var/www/campusconnect/frontend/dist;
       index index.html;

       # SPA Routing
       location / {
           try_files $uri $uri/ /index.html;
       }

       # Backend API Reverse Proxy
       location /api/ {
           proxy_pass http://127.0.0.1:5000/api/;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }

       # Uploads Directory
       location /uploads/ {
           alias /var/www/campusconnect/backend/uploads/;
       }
   }
   ```
3. Enable site & SSL:
   ```bash
   sudo ln -s /etc/nginx/sites-available/campusconnect /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   sudo certbot --nginx -d campusconnect.yourdomain.edu
   ```

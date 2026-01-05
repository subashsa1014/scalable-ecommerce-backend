# Deployment Guide - E-Commerce Microservices Backend

## Overview
This guide provides step-by-step instructions for deploying the e-commerce microservices backend in various environments.

---

## Local Development Deployment

### Prerequisites
- Docker (20.10+) and Docker Compose (2.0+)
- 4GB+ RAM available for containers
- Git

### Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/subashsa1014/scalable-ecommerce-backend.git
   cd scalable-ecommerce-backend
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env if needed (default values work for local development)
   ```

3. **Build and Start Services**
   ```bash
   docker compose build
   docker compose up -d
   ```

4. **Verify Services**
   ```bash
   # Check all services are running
   docker compose ps
   
   # Check API Gateway health
   curl http://localhost:3000/health
   
   # View logs
   docker compose logs -f
   ```

5. **Test the Application**
   ```bash
   # Get API info
   curl http://localhost:3000/
   
   # Register a user
   curl -X POST http://localhost:3000/api/v1/users/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123","firstName":"John","lastName":"Doe"}'
   ```

6. **Stop Services**
   ```bash
   docker compose down
   
   # Stop and remove volumes (data)
   docker compose down -v
   ```

---

## Production Deployment

### On Cloud VM (AWS EC2, GCP, Azure, DigitalOcean)

#### Prerequisites
- Linux server (Ubuntu 20.04+ recommended)
- Docker and Docker Compose installed
- Domain name (optional, for SSL)
- Firewall configured (ports 3000, 27017, 6379)

#### Steps

1. **Connect to Server**
   ```bash
   ssh user@your-server-ip
   ```

2. **Install Docker**
   ```bash
   # Update packages
   sudo apt-get update
   
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   
   # Add user to docker group
   sudo usermod -aG docker $USER
   
   # Install Docker Compose
   sudo apt-get install docker-compose-plugin
   ```

3. **Clone and Configure**
   ```bash
   git clone https://github.com/subashsa1014/scalable-ecommerce-backend.git
   cd scalable-ecommerce-backend
   
   # Create production environment file
   cp .env.example .env
   nano .env
   ```

4. **Update Production Settings**
   Edit `.env`:
   ```env
   NODE_ENV=production
   
   # Change JWT secret to a strong random value
   JWT_SECRET=your_production_secret_key_minimum_32_characters
   
   # Update MongoDB credentials
   MONGODB_USER=admin
   MONGODB_PASSWORD=secure_password_here
   
   # Update CORS for your domain
   CORS_ORIGIN=https://yourdomain.com
   ```

5. **Deploy with Docker Compose**
   ```bash
   # Build and start
   docker compose -f docker-compose.yml up -d --build
   
   # Check status
   docker compose ps
   ```

6. **Set Up Reverse Proxy (Optional - Nginx)**
   ```bash
   # Install Nginx
   sudo apt-get install nginx
   
   # Create Nginx config
   sudo nano /etc/nginx/sites-available/ecommerce
   ```
   
   Nginx configuration:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
   
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   ```bash
   # Enable site
   sudo ln -s /etc/nginx/sites-available/ecommerce /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. **Set Up SSL with Let's Encrypt**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

8. **Configure Firewall**
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw allow 22/tcp
   sudo ufw enable
   ```

---

## Kubernetes Deployment

### Prerequisites
- Kubernetes cluster (EKS, GKE, AKS, or local with Minikube)
- kubectl configured
- Docker images pushed to container registry

### Steps

1. **Build and Push Docker Images**
   ```bash
   # Build images
   docker compose build
   
   # Tag and push to registry
   docker tag ecommerce-api-gateway:latest your-registry/api-gateway:latest
   docker push your-registry/api-gateway:latest
   
   # Repeat for each service
   ```

2. **Create Kubernetes Resources**
   Create deployment files (example for API Gateway):
   
   `k8s/api-gateway-deployment.yaml`:
   ```yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: api-gateway
   spec:
     replicas: 3
     selector:
       matchLabels:
         app: api-gateway
     template:
       metadata:
         labels:
           app: api-gateway
       spec:
         containers:
         - name: api-gateway
           image: your-registry/api-gateway:latest
           ports:
           - containerPort: 3000
           env:
           - name: NODE_ENV
             value: "production"
   ---
   apiVersion: v1
   kind: Service
   metadata:
     name: api-gateway
   spec:
     selector:
       app: api-gateway
     ports:
     - port: 3000
       targetPort: 3000
     type: LoadBalancer
   ```

3. **Deploy to Kubernetes**
   ```bash
   kubectl apply -f k8s/
   kubectl get pods
   kubectl get services
   ```

---

## Docker Swarm Deployment

1. **Initialize Swarm**
   ```bash
   docker swarm init
   ```

2. **Deploy Stack**
   ```bash
   docker stack deploy -c docker-compose.yml ecommerce
   ```

3. **Check Services**
   ```bash
   docker stack services ecommerce
   docker stack ps ecommerce
   ```

---

## Monitoring and Maintenance

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f user-service

# Last 100 lines
docker compose logs --tail=100 api-gateway
```

### Restart Services
```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart user-service
```

### Update Deployment
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker compose up -d --build
```

### Backup Database
```bash
# Backup MongoDB
docker exec ecommerce-mongodb mongodump --authenticationDatabase admin -u admin -p admin123 --out /tmp/backup

# Copy backup from container
docker cp ecommerce-mongodb:/tmp/backup ./mongodb-backup-$(date +%Y%m%d)
```

### Scale Services
```bash
# Scale product service to 3 instances
docker compose up -d --scale product-service=3
```

---

## Health Checks

All services have health endpoints:
- API Gateway: `http://localhost:3000/health`
- User Service: `http://localhost:3001/health`
- Product Service: `http://localhost:3002/health`
- Order Service: `http://localhost:3003/health`
- Payment Service: `http://localhost:3004/health`
- Cart Service: `http://localhost:3006/health`

---

## Troubleshooting

### Container won't start
```bash
# Check logs
docker compose logs service-name

# Check container status
docker compose ps

# Restart the service
docker compose restart service-name
```

### MongoDB connection issues
```bash
# Verify MongoDB is running
docker compose ps mongodb

# Check MongoDB logs
docker compose logs mongodb

# Test connection
docker exec -it ecommerce-mongodb mongosh -u admin -p admin123
```

### Port already in use
```bash
# Find process using port
sudo lsof -i :3000

# Kill process
sudo kill -9 PID

# Or change port in .env
```

### Services can't communicate
```bash
# Verify network
docker network ls
docker network inspect scalable-ecommerce-backend_ecommerce-network

# Restart all services
docker compose down && docker compose up -d
```

---

## Performance Optimization

1. **Enable Redis persistence**
   - Already configured in docker-compose.yml with AOF

2. **Set MongoDB indexes**
   ```javascript
   // Connect to MongoDB
   db.users.createIndex({ email: 1 }, { unique: true })
   db.products.createIndex({ category: 1 })
   db.products.createIndex({ name: "text" })
   db.orders.createIndex({ userId: 1 })
   ```

3. **Configure rate limiting**
   - Adjust in `.env`: `RATE_LIMIT_MAX_REQUESTS=100`

4. **Set appropriate resource limits**
   - Add to docker-compose.yml for each service:
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '0.5'
         memory: 512M
   ```

---

## Security Checklist

- [ ] Change default passwords in `.env`
- [ ] Use strong JWT secret (32+ characters)
- [ ] Enable HTTPS in production
- [ ] Configure firewall rules
- [ ] Restrict MongoDB/Redis access
- [ ] Keep Docker images updated
- [ ] Regular security audits
- [ ] Enable Docker content trust
- [ ] Use secrets management (Docker Secrets, Vault)

---

## Support

For issues or questions:
- GitHub Issues: https://github.com/subashsa1014/scalable-ecommerce-backend/issues
- Email: subashsa1014@gmail.com

---

## License

MIT License - See LICENSE file for details

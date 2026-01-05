# Quick Reference Guide

## Quick Commands

### Docker Operations
```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# View logs
docker compose logs -f

# Restart a service
docker compose restart user-service

# Rebuild and restart
docker compose up -d --build

# Check service status
docker compose ps
```

### Testing
```bash
# Run test script
./test-api.sh

# Manual API test
curl http://localhost:3000/health
```

### Database Operations
```bash
# Access MongoDB
docker exec -it ecommerce-mongodb mongosh -u admin -p admin123

# Access Redis
docker exec -it ecommerce-redis redis-cli
```

## Service Endpoints

| Service | Port | Health Check |
|---------|------|--------------|
| API Gateway | 3000 | http://localhost:3000/health |
| User Service | 3001 | http://localhost:3001/health |
| Product Service | 3002 | http://localhost:3002/health |
| Order Service | 3003 | http://localhost:3003/health |
| Payment Service | 3004 | http://localhost:3004/health |
| Cart Service | 3006 | http://localhost:3006/health |

## Common API Calls

### Register User
```bash
curl -X POST http://localhost:3000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Get Products
```bash
curl http://localhost:3000/api/v1/products
```

### Add to Cart (requires token)
```bash
curl -X POST http://localhost:3000/api/v1/cart \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "PRODUCT_ID",
    "name": "Product Name",
    "price": 99.99,
    "quantity": 1
  }'
```

### Create Order (requires token)
```bash
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{
      "productId": "PRODUCT_ID",
      "name": "Product Name",
      "price": 99.99,
      "quantity": 1
    }],
    "shippingAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    }
  }'
```

## Environment Variables

Key variables in `.env`:
```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://admin:admin123@mongodb:27017/ecommerce

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Security
JWT_SECRET=your_secret_key
JWT_EXPIRY=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Troubleshooting

### Port conflicts
```bash
# Find process using port
lsof -i :3000
# Kill process
kill -9 PID
```

### Container issues
```bash
# Remove all containers and volumes
docker compose down -v

# Rebuild from scratch
docker compose build --no-cache
docker compose up -d
```

### Database issues
```bash
# Check MongoDB connection
docker exec -it ecommerce-mongodb mongosh -u admin -p admin123

# Check Redis connection
docker exec -it ecommerce-redis redis-cli ping
```

## File Structure
```
scalable-ecommerce-backend/
├── api-gateway/              # API Gateway service
├── services/                 # Microservices
│   ├── user-service/
│   ├── product-service/
│   ├── order-service/
│   ├── payment-service/
│   └── cart-service/
├── shared/                   # Shared utilities
│   ├── utils/
│   ├── middleware/
│   └── constants/
├── docker-compose.yml        # Docker orchestration
├── .env.example              # Environment template
└── README.md                 # Main documentation
```

## Documentation Files
- `README.md` - Project overview
- `SETUP_GUIDE.md` - Detailed setup instructions
- `PROJECT_STRUCTURE.md` - Architecture details
- `API_DOCUMENTATION.md` - Complete API reference
- `DEPLOYMENT_GUIDE.md` - Production deployment
- `CONTRIBUTING.md` - Contribution guidelines
- `QUICK_REFERENCE.md` - This file

## Support
- GitHub: https://github.com/subashsa1014/scalable-ecommerce-backend
- Issues: https://github.com/subashsa1014/scalable-ecommerce-backend/issues
- Email: subashsa1014@gmail.com

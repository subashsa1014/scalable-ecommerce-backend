# Setup Guide - E-Commerce Microservices Backend

## Quick Start (Docker)

### Prerequisites
- Docker & Docker Compose (v2.0+)
- Git

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/subashsa1014/scalable-ecommerce-backend.git
   cd scalable-ecommerce-backend
   ```

2. **Copy environment file**
   ```bash
   cp .env.example .env
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Verify services are running**
   ```bash
   docker-compose ps
   ```

5. **Access the API**
   - API Gateway: `http://localhost:3000`
   - MongoDB: `mongodb://admin:admin123@localhost:27017`
   - Redis: `redis://localhost:6379`

---

## Local Development Setup

### Prerequisites
- Node.js 16+ and npm 8+
- MongoDB 6.0+
- Redis 7+

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

3. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=admin123 mongo:6.0
   ```

4. **Start Redis**
   ```bash
   # Using Docker
   docker run -d -p 6379:6379 redis:7-alpine
   ```

5. **Start the application**
   ```bash
   npm run dev
   ```

---

## Development Commands

```bash
# Run in development mode with hot reload
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Build Docker images
npm run docker:build

# View container logs
npm run docker:logs

# Stop all containers
npm run docker:down
```

---

## API Endpoints

### User Service
- `POST /api/v1/users/register` - Register new user
- `POST /api/v1/users/login` - User login
- `GET /api/v1/users/profile` - Get user profile (Auth required)

### Product Service
- `GET /api/v1/products` - List all products
- `GET /api/v1/products/:id` - Get product details
- `POST /api/v1/products` - Create product (Admin only)
- `PUT /api/v1/products/:id` - Update product (Admin only)
- `DELETE /api/v1/products/:id` - Delete product (Admin only)

### Cart Service
- `GET /api/v1/cart` - Get cart items (Auth required)
- `POST /api/v1/cart` - Add to cart (Auth required)
- `PUT /api/v1/cart/:itemId` - Update cart item (Auth required)
- `DELETE /api/v1/cart/:itemId` - Remove from cart (Auth required)

### Order Service
- `POST /api/v1/orders` - Create order (Auth required)
- `GET /api/v1/orders` - Get order history (Auth required)
- `GET /api/v1/orders/:id` - Get order details (Auth required)

### Payment Service
- `POST /api/v1/payments/process` - Process payment (Mock)
- `GET /api/v1/payments/:id` - Get payment status

---

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  role: String ("user", "admin"),
  createdAt: Date,
  updatedAt: Date
}
```

### Products Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  price: Number,
  quantity: Number,
  category: String,
  image: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Orders Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  items: Array,
  totalAmount: Number,
  status: String,
  paymentId: String,
  shippingAddress: Object,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Error Handling

All errors follow standard HTTP status codes:
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Rate Limited
- `500` - Server Error

Error response format:
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-05T12:00:00Z"
}
```

---

## Rate Limiting

API rate limiting is enabled:
- **Window**: 15 minutes
- **Max Requests**: 100 per window
- **Header**: `X-RateLimit-Remaining`

---

## Security Features

✅ JWT Authentication
✅ Password Hashing (bcryptjs)
✅ Rate Limiting
✅ CORS Configuration
✅ Helmet.js Headers
✅ Input Validation (Joi)
✅ Environment Variable Protection

---

## Deployment

### Docker Deployment
```bash
# Build and push Docker image
docker build -t your-registry/ecommerce-backend:latest .
docker push your-registry/ecommerce-backend:latest
```

### Kubernetes (Example)
```bash
kubectl apply -f kubernetes/
```

### GitHub Actions CI/CD
Automatic deployment triggers on push to `main` branch. See `.github/workflows/ci-cd.yml` for details.

---

## Monitoring & Logging

- **Logger**: Winston
- **HTTP Logger**: Morgan
- **Log Level**: Configurable via `LOG_LEVEL` env var
- **Logs Location**: `./logs` directory

---

## Troubleshooting

### MongoDB Connection Error
```bash
# Verify MongoDB is running
mongo --authenticationDatabase admin -u admin -p admin123 localhost:27017/ecommerce
```

### Redis Connection Error
```bash
# Test Redis connection
redis-cli ping
```

### Port Already in Use
```bash
# Change port in .env file
PORT=3001
```

---

## Contributing

1. Create a feature branch: `git checkout -b feature/feature-name`
2. Commit changes: `git commit -am 'Add feature'
3. Push to branch: `git push origin feature/feature-name`
4. Submit pull request

---

## License

MIT License - See LICENSE file for details

---

## Support

For issues and questions, please create an GitHub Issue or contact the maintainer.

# Scalable E-Commerce Backend

A production-ready, microservices-based e-commerce backend system built with Node.js, Express, MongoDB, and Redis.

## 🚀 Features

- **Microservices Architecture**: Independent, scalable services
- **API Gateway**: Centralized routing and load balancing
- **Authentication & Authorization**: JWT-based security
- **Caching**: Redis for improved performance
- **Containerization**: Docker & Docker Compose ready
- **Production Ready**: Error handling, logging, rate limiting

## 📦 Services

- **API Gateway** (Port 3000) - Request routing and rate limiting
- **User Service** (Port 3001) - Authentication and user management
- **Product Service** (Port 3002) - Product catalog with caching
- **Order Service** (Port 3003) - Order processing and tracking
- **Payment Service** (Port 3004) - Mock payment processing
- **Cart Service** (Port 3006) - Shopping cart management

## 🔧 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 16+ (for local development)

### Run with Docker

```bash
# Clone the repository
git clone https://github.com/subashsa1014/scalable-ecommerce-backend.git
cd scalable-ecommerce-backend

# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### Access the Application

- API Gateway: http://localhost:3000
- MongoDB: mongodb://admin:admin123@localhost:27017
- Redis: redis://localhost:6379

## 📖 Documentation

- [Setup Guide](SETUP_GUIDE.md) - Detailed installation and configuration
- [Project Structure](PROJECT_STRUCTURE.md) - Architecture overview

## 🧪 Testing the API

```bash
# Register a user
curl -X POST http://localhost:3000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"John","lastName":"Doe"}'

# Login
curl -X POST http://localhost:3000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🛠️ Development

```bash
# Install dependencies for a service
cd services/user-service
npm install

# Run in development mode
npm run dev
```

## 📄 License

MIT License - see LICENSE file for details

## 👤 Author

**Subash Velmurugan**

- GitHub: [@subashsa1014](https://github.com/subashsa1014)
- LinkedIn: [Connect on LinkedIn](https://www.linkedin.com/in/subashsa1014)

## ✅ Status

**Production Ready** - All services implemented and tested with Docker deployment.
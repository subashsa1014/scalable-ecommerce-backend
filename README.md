# Scalable E-Commerce Backend

A production-ready, microservices-based e-commerce backend system built with Node.js, Express, MongoDB, and Redis. Designed for high availability, independent scaling, and easy maintenance.

## 🚀 Features

- **Microservices Architecture**: Independent services for users, products, cart, orders, and payments
- **API Gateway**: Single entry point with routing and rate limiting
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Admin and user roles with different permissions
- **Docker Support**: Containerized services for easy deployment
- **Database**: MongoDB for data persistence
- **Caching**: Redis for improved performance
- **Error Handling**: Centralized error handling across all services
- **Input Validation**: Schema-based validation using Joi
- **Security**: Helmet.js, CORS, rate limiting, and password hashing
- **Logging**: Winston and Morgan for comprehensive logging

## 📋 Prerequisites

- Node.js 16+ and npm 8+
- Docker & Docker Compose (v2.0+)
- MongoDB 6.0+ (optional if using Docker)
- Redis 7+ (optional if using Docker)

## 🏗️ Architecture

The system consists of the following microservices:

1. **API Gateway** (Port 3000) - Routes requests to appropriate services
2. **User Service** (Port 3001) - Authentication and user management
3. **Product Service** (Port 3002) - Product catalog and inventory
4. **Order Service** (Port 3003) - Order processing and tracking
5. **Payment Service** (Port 3004) - Payment processing (mock)
6. **Cart Service** (Port 3005) - Shopping cart management

## 🚀 Quick Start

### Using Docker (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/subashsa1014/scalable-ecommerce-backend.git
cd scalable-ecommerce-backend
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Start all services:
```bash
docker-compose up -d
```

4. Verify services:
```bash
docker-compose ps
```

5. Access the API:
- API Gateway: http://localhost:3000
- Health check: http://localhost:3000/health

### Local Development

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed local development instructions.

## 📚 Documentation

- [Project Structure](PROJECT_STRUCTURE.md) - Detailed architecture and directory structure
- [Setup Guide](SETUP_GUIDE.md) - Installation and configuration guide
- API Documentation - Available at `/api/v1` when running

## 🧪 Testing

Run tests for individual services:

```bash
cd services/user-service
npm test
```

## 🔒 Security

- JWT-based authentication
- Password hashing with bcryptjs
- Rate limiting on API endpoints
- CORS configuration
- Helmet.js security headers
- Input validation with Joi

## 📝 License

MIT License - See LICENSE file for details.

## 👨‍💻 Author

**Subash Velmurugan**

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
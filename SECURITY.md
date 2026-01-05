# Security Architecture

## Overview
This document describes the security measures implemented in the e-commerce microservices backend.

## Security Layers

### 1. API Gateway Level Security

#### Rate Limiting
- **Location**: API Gateway (api-gateway/src/index.js)
- **Implementation**: Express rate limiter
- **Configuration**: 
  - Window: 15 minutes (configurable via `RATE_LIMIT_WINDOW_MS`)
  - Max requests: 100 per window (configurable via `RATE_LIMIT_MAX_REQUESTS`)
- **Scope**: Applied to all incoming requests to the API Gateway
- **Rationale**: Centralized rate limiting at the gateway prevents abuse before requests reach internal services

#### CORS Protection
- **Location**: API Gateway
- **Implementation**: CORS middleware
- **Configuration**: Configurable allowed origins via `CORS_ORIGIN` environment variable
- **Purpose**: Prevents unauthorized cross-origin requests

#### Helmet.js Security Headers
- **Location**: API Gateway
- **Purpose**: Sets various HTTP headers to protect against common vulnerabilities
  - XSS Protection
  - Content-Type sniffing prevention
  - Clickjacking protection
  - Strict Transport Security

### 2. Service Level Security

#### Authentication & Authorization
- **Method**: JWT (JSON Web Tokens)
- **Implementation**: 
  - JWT tokens generated on user login/registration
  - Tokens verified via middleware (shared/middleware/auth.js)
  - Role-based access control for admin endpoints
- **Token Expiry**: Configurable via `JWT_EXPIRY` (default: 7 days)
- **Secret Management**: JWT_SECRET must be set in environment variables (no hardcoded fallback)

#### Input Validation
- **Library**: Joi
- **Scope**: All user inputs validated before processing
- **Examples**:
  - Email format validation
  - Password strength requirements
  - Required field validation
  - Data type validation

#### Password Security
- **Library**: bcryptjs
- **Implementation**: 
  - Passwords hashed with salt before storage
  - Automatic hashing on user save (Mongoose middleware)
  - No plaintext passwords stored or logged

### 3. Database Security

#### MongoDB
- **Authentication**: Enabled with username/password
- **Connection**: Uses authenticated connection strings
- **Access Control**: Services connect with specific credentials
- **Network**: Isolated within Docker network (not exposed externally)

#### Redis
- **Network**: Isolated within Docker network
- **Access**: Only accessible by internal services

### 4. Microservices Internal Security

#### Design Decision: No Individual Service Rate Limiting
**Rationale**:
- Microservices (user, product, order, cart, payment) are **internal services** not directly exposed to the internet
- All external requests flow through the API Gateway, which applies rate limiting
- Adding rate limiting to each service would:
  - Create redundant overhead
  - Potentially block legitimate service-to-service communication
  - Complicate internal API calls
  - Not provide additional security since services aren't publicly accessible

**Network Architecture**:
```
Internet → API Gateway (Rate Limited, CORS, Helmet)
              ↓
         [Internal Network]
              ↓
    User, Product, Order, Cart, Payment Services
              ↓
         MongoDB, Redis
```

**Production Recommendation**:
In production, ensure:
1. Services are deployed in a private network/VPC
2. Only API Gateway has public exposure
3. Firewall rules prevent direct access to internal services
4. Use service mesh (like Istio) for additional service-to-service security if needed

### 5. Error Handling

#### Information Disclosure Prevention
- **Implementation**: Custom error handler (shared/utils/errorHandler.js)
- **Features**:
  - Generic error messages to clients
  - Detailed errors logged server-side only
  - No stack traces in production responses
  - Consistent error format

#### Operational vs Programming Errors
- **Operational Errors**: Expected errors (validation, not found, etc.) with user-friendly messages
- **Programming Errors**: Unexpected errors logged for debugging, generic message to client

### 6. Logging & Monitoring

#### Winston Logger
- **Location**: shared/utils/logger.js
- **Configuration**: Log level via `LOG_LEVEL` environment variable
- **Security Considerations**:
  - No sensitive data (passwords, tokens) in logs
  - Structured logging for easier security audits
  - Timestamp all log entries

### 7. Docker Security

#### Container Isolation
- **Network**: Services communicate via dedicated Docker network
- **Volumes**: Persistent data in named volumes
- **User**: Services run as non-root users (Node.js alpine base)

#### Image Security
- **Base Images**: Official Node.js Alpine images (minimal attack surface)
- **.dockerignore**: Excludes unnecessary files from images
- **Production Build**: `npm ci --only=production` to exclude dev dependencies

### 8. Environment Configuration

#### .env Security
- **Pattern**: .env files in .gitignore
- **Template**: .env.example provided (no secrets)
- **Production**: Recommend secrets management system (AWS Secrets Manager, Azure Key Vault, HashiCorp Vault)

#### Required Security Variables
```env
JWT_SECRET=<strong_random_string_min_32_chars>
MONGODB_PASSWORD=<strong_password>
NODE_ENV=production
```

## Security Best Practices Implemented

✅ **Authentication**: JWT-based with secure token handling
✅ **Authorization**: Role-based access control (user/admin)
✅ **Input Validation**: Joi schema validation on all inputs
✅ **Password Security**: Bcrypt hashing with automatic salting
✅ **Rate Limiting**: Gateway-level protection against abuse
✅ **CORS**: Configurable cross-origin protection
✅ **Security Headers**: Helmet.js for common vulnerabilities
✅ **Error Handling**: No information disclosure
✅ **Logging**: Structured logging without sensitive data
✅ **Database Security**: Authentication and network isolation
✅ **Container Security**: Minimal base images, non-root users
✅ **Secret Management**: No hardcoded secrets, environment-based configuration

## Security Checklist for Production

- [ ] Change all default passwords
- [ ] Generate strong JWT_SECRET (32+ characters)
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS/TLS
- [ ] Configure firewall rules (only API Gateway public)
- [ ] Set up secrets management (Vault, AWS Secrets Manager, etc.)
- [ ] Enable container scanning in CI/CD
- [ ] Set up security monitoring and alerting
- [ ] Regular dependency updates (npm audit)
- [ ] Configure proper CORS origins (no wildcards)
- [ ] Database access only from application network
- [ ] Regular security audits
- [ ] Backup encryption
- [ ] API versioning strategy

## Vulnerability Response

If you discover a security vulnerability:
1. **Do not** create a public issue
2. Email: subashsa1014@gmail.com
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Security Updates

- Dependencies are managed via npm
- Regular updates recommended: `npm audit fix`
- Monitor GitHub security advisories
- Subscribe to security mailing lists for Express, MongoDB, Redis

## Compliance Considerations

This application provides features that can help meet common compliance requirements:
- **Data Protection**: Password hashing, secure token handling
- **Audit Trail**: Logging of all operations
- **Access Control**: Authentication and authorization
- **Data Validation**: Input validation prevents injection attacks

## Additional Security Layers (Optional)

For enhanced security in production:
1. **Service Mesh**: Istio or Linkerd for service-to-service encryption
2. **WAF**: Web Application Firewall before API Gateway
3. **DDoS Protection**: CloudFlare or AWS Shield
4. **API Gateway**: Kong, AWS API Gateway, or Azure API Management
5. **Secrets Rotation**: Automated secrets rotation
6. **MFA**: Multi-factor authentication for admin users
7. **SIEM**: Security Information and Event Management system
8. **Penetration Testing**: Regular security assessments

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)

---

Last Updated: 2024-01-05
Version: 1.0.0

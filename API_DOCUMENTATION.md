# API Documentation

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## User Service

### Register User
**POST** `/users/register`

Request:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

Response:
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  }
}
```

### Login
**POST** `/users/login`

Request:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  }
}
```

### Get Profile
**GET** `/users/profile`

Headers: `Authorization: Bearer <token>`

Response:
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "createdAt": "2024-01-05T10:00:00.000Z"
  }
}
```

### Update Profile
**PUT** `/users/profile`

Headers: `Authorization: Bearer <token>`

Request:
```json
{
  "firstName": "Jane",
  "lastName": "Smith"
}
```

---

## Product Service

### Get All Products
**GET** `/products?page=1&limit=10&category=electronics&search=phone`

Query Parameters:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `category` (optional): Filter by category
- `search` (optional): Search in product name

Response:
```json
{
  "products": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Smartphone",
      "description": "Latest smartphone",
      "price": 599.99,
      "quantity": 50,
      "category": "electronics",
      "image": "https://example.com/image.jpg"
    }
  ],
  "totalPages": 5,
  "currentPage": 1,
  "total": 50
}
```

### Get Product by ID
**GET** `/products/:id`

Response:
```json
{
  "product": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Smartphone",
    "description": "Latest smartphone",
    "price": 599.99,
    "quantity": 50,
    "category": "electronics",
    "image": "https://example.com/image.jpg"
  }
}
```

### Create Product (Admin Only)
**POST** `/products`

Headers: `Authorization: Bearer <admin_token>`

Request:
```json
{
  "name": "Laptop",
  "description": "High-performance laptop",
  "price": 1299.99,
  "quantity": 25,
  "category": "electronics",
  "image": "https://example.com/laptop.jpg"
}
```

### Update Product (Admin Only)
**PUT** `/products/:id`

Headers: `Authorization: Bearer <admin_token>`

### Delete Product (Admin Only)
**DELETE** `/products/:id`

Headers: `Authorization: Bearer <admin_token>`

---

## Cart Service

### Get Cart
**GET** `/cart`

Headers: `Authorization: Bearer <token>`

Response:
```json
{
  "cart": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f191e810c19729de860ea",
    "items": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "productId": "507f1f77bcf86cd799439011",
        "name": "Smartphone",
        "price": 599.99,
        "quantity": 2,
        "image": "https://example.com/image.jpg"
      }
    ],
    "totalAmount": 1199.98
  }
}
```

### Add to Cart
**POST** `/cart`

Headers: `Authorization: Bearer <token>`

Request:
```json
{
  "productId": "507f1f77bcf86cd799439011",
  "name": "Smartphone",
  "price": 599.99,
  "quantity": 1,
  "image": "https://example.com/image.jpg"
}
```

### Update Cart Item
**PUT** `/cart/:itemId`

Headers: `Authorization: Bearer <token>`

Request:
```json
{
  "quantity": 3
}
```

### Remove from Cart
**DELETE** `/cart/:itemId`

Headers: `Authorization: Bearer <token>`

### Clear Cart
**DELETE** `/cart`

Headers: `Authorization: Bearer <token>`

---

## Order Service

### Create Order
**POST** `/orders`

Headers: `Authorization: Bearer <token>`

Request:
```json
{
  "items": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "name": "Smartphone",
      "price": 599.99,
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }
}
```

Response:
```json
{
  "message": "Order created successfully",
  "order": {
    "orderId": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "507f191e810c19729de860ea",
    "items": [...],
    "totalAmount": 1199.98,
    "status": "pending",
    "shippingAddress": {...}
  }
}
```

### Get User Orders
**GET** `/orders?page=1&limit=10`

Headers: `Authorization: Bearer <token>`

Response:
```json
{
  "orders": [
    {
      "orderId": "550e8400-e29b-41d4-a716-446655440000",
      "totalAmount": 1199.98,
      "status": "delivered",
      "createdAt": "2024-01-05T10:00:00.000Z"
    }
  ],
  "totalPages": 2,
  "currentPage": 1,
  "total": 15
}
```

### Get Order by ID
**GET** `/orders/:id`

Headers: `Authorization: Bearer <token>`

### Update Order Status
**PATCH** `/orders/:id/status`

Headers: `Authorization: Bearer <token>`

Request:
```json
{
  "status": "shipped"
}
```

Status values: `pending`, `processing`, `shipped`, `delivered`, `cancelled`

### Update Payment ID
**PATCH** `/orders/:id/payment`

Headers: `Authorization: Bearer <token>`

Request:
```json
{
  "paymentId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## Payment Service

### Process Payment
**POST** `/payments/process`

Headers: `Authorization: Bearer <token>`

Request:
```json
{
  "orderId": "507f1f77bcf86cd799439011",
  "amount": 1199.98,
  "paymentMethod": "card",
  "cardDetails": {
    "cardNumber": "4111111111111111",
    "cardHolder": "John Doe",
    "expiryDate": "12/25",
    "cvv": "123"
  }
}
```

Response:
```json
{
  "message": "Payment processed successfully",
  "payment": {
    "paymentId": "550e8400-e29b-41d4-a716-446655440000",
    "orderId": "507f1f77bcf86cd799439011",
    "amount": 1199.98,
    "status": "success",
    "transactionId": "TXN-1704452400000",
    "createdAt": "2024-01-05T10:00:00.000Z"
  }
}
```

### Get Payment Status
**GET** `/payments/:id`

Headers: `Authorization: Bearer <token>`

### Refund Payment
**POST** `/payments/:id/refund`

Headers: `Authorization: Bearer <token>`

Response:
```json
{
  "message": "Payment refunded successfully",
  "refundId": "REF-1704452400000",
  "paymentId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## Error Responses

All errors follow this format:
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-05T10:00:00.000Z"
}
```

Common HTTP Status Codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

---

## Rate Limiting

- Window: 15 minutes
- Max Requests: 100 per window
- Header: `X-RateLimit-Remaining`

When rate limited, you'll receive a 429 status with:
```json
{
  "error": "Too many requests from this IP, please try again later"
}
```

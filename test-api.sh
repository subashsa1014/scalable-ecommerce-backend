#!/bin/bash
# Quick test script to verify all services are working

BASE_URL="http://localhost:3000"
echo "Testing E-Commerce Backend API..."
echo "================================="
echo ""

# Test API Gateway
echo "1. Testing API Gateway..."
response=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/health)
if [ $response -eq 200 ]; then
    echo "   ✓ API Gateway is healthy"
else
    echo "   ✗ API Gateway failed (HTTP $response)"
fi

# Test User Registration
echo ""
echo "2. Testing User Registration..."
register_response=$(curl -s -X POST $BASE_URL/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}')

if echo $register_response | grep -q "token"; then
    echo "   ✓ User registration successful"
    TOKEN=$(echo $register_response | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    echo "   Token: ${TOKEN:0:20}..."
else
    echo "   ✗ User registration failed"
    echo "   Response: $register_response"
fi

# Test User Login
echo ""
echo "3. Testing User Login..."
login_response=$(curl -s -X POST $BASE_URL/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}')

if echo $login_response | grep -q "token"; then
    echo "   ✓ User login successful"
    TOKEN=$(echo $login_response | grep -o '"token":"[^"]*' | cut -d'"' -f4)
else
    echo "   ✗ User login failed"
fi

# Test Get Products (no auth required)
echo ""
echo "4. Testing Get Products..."
products_response=$(curl -s $BASE_URL/api/v1/products)
if echo $products_response | grep -q "products"; then
    echo "   ✓ Get products successful"
else
    echo "   ✗ Get products failed"
fi

# Test Get Cart (auth required)
if [ ! -z "$TOKEN" ]; then
    echo ""
    echo "5. Testing Get Cart..."
    cart_response=$(curl -s $BASE_URL/api/v1/cart \
      -H "Authorization: Bearer $TOKEN")
    if echo $cart_response | grep -q "cart"; then
        echo "   ✓ Get cart successful"
    else
        echo "   ✗ Get cart failed"
    fi
fi

echo ""
echo "================================="
echo "Testing complete!"

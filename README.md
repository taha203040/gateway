# Kong Gateway Configuration - API Gateway Setup

This repository contains a comprehensive Kong Gateway configuration for a microservices architecture with authentication, rate limiting, and monitoring capabilities.

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Services](#services)
- [Authentication & Authorization](#authentication--authorization)
- [Rate Limiting](#rate-limiting)
- [Plugins](#plugins)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Consumer Management](#consumer-management)
- [Monitoring](#monitoring)

##  Overview

This Kong Gateway configuration provides a unified entry point for multiple microservices with:
- **JWT-based Authentication** for protected routes
- **API Key Authentication** for specific internal services
- **Tier-based Rate Limiting** (Free & Paid tiers)
- **CORS Support** for web applications
- **Request/Response Transformation**
- **Prometheus Metrics** for monitoring
- **Correlation ID** for request tracing

##  Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Kong Gateway                            │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Auth Service │  │Inventory Svc │  │  Order Svc   │    │
│  │   (3000)     │  │   (4100)     │  │   (4000)     │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│         │                  │                  │            │
│  ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐    │
│  │ JWT Auth    │   │ JWT/Key Auth│   │ JWT Auth    │    │
│  │ Rate Limit  │   │ Rate Limit  │   │ Rate Limit  │    │
│  └─────────────┘   └─────────────┘   └─────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

##  Services

### 1. Authentication Service (`auth-service`)
**Base URL:** `http://host.docker.internal:3000`

| Route | Method | Protection | Description |
|-------|--------|------------|-------------|
| `/auth/signup` | POST, OPTIONS | Public | User registration |
| `/auth/login` | POST, OPTIONS | Public | User login |
| `/auth/refresh` | POST, OPTIONS | Public | Token refresh |
| `/auth/logout` | POST, OPTIONS | JWT Protected | User logout |
| `/auth/verify` | GET | JWT Protected | Token verification |

### 2. Inventory Service (`inventory-service`)
**Base URL:** `http://host.docker.internal:4100`

| Route | Method | Protection | Description |
|-------|--------|------------|-------------|
| `/items` | GET | JWT Protected | List all items |
| `/items` | POST, OPTIONS | JWT Protected | Create new item |
| `/items/[^/]+/stock` | PATCH, POST, DELETE | Key Auth + JWT | Update stock |
| `/items/[^/]+$` | GET | JWT Protected | Get specific item |

### 3. Order Service (`order-service`)
**Base URL:** `http://host.docker.internal:4000`

| Route | Method | Protection | Description |
|-------|--------|------------|-------------|
| `/api/orders` | POST, OPTIONS | JWT Protected | Create order |
| `/api/orders` | GET, OPTIONS | JWT Protected | List orders |
| `/api/orders/[^/]+$` | GET, DELETE, OPTIONS | JWT Protected | Get/Delete order |
| `/api/orders/[^/]+/pay$` | PATCH | JWT Protected | Pay order |
| `/api/orders/[^/]+/deliver$` | PATCH | JWT Protected | Deliver order |
| `/api/orders/[^/]+/cancel$` | PATCH | JWT Protected | Cancel order |

##  Authentication & Authorization

### JWT Configuration
All protected routes use JWT with the following configuration:
- **Algorithm:** HS256
- **Key Claim:** `iss` (Issuer)
- **Token Sources:** 
  - Authorization Header
  - Cookie: `access_token`
- **Claims Verified:** `exp` (Expiration)

### Consumer Credentials

#### Free Tier Consumer
```json
{
  "username": "free-tier",
  "jwt_secret": "r4nd0mH5-256-K3y!X9q7Lp2vB8wM4nC1jF5tY6zA3sD0eRgUkHo",
  "issuer": "free-tier-issuer"
}
```

#### Paid Tier Consumer
```json
{
  "username": "paid-tier",
  "jwt_secret": "r4nd0mH5-256-K3y!X9q7Lp2vB8wM4nC1jF5tY6zA3sD0eRgUkHo",
  "issuer": "paid-tier-issuer"
}
```

#### Internal Service Consumers
```json
{
  "username": "auth-service",
  "jwt_secret": "A3b7cD9eF1gH2iJ4kL6mN8oP0qR5sT7uV9wX2yZ4",
  "issuer": "auth-service"
}
```

**Note:** The `inventory-client` consumer uses API Key authentication with key: `werttt2345cdfhgghfghfghf`

##  Rate Limiting

| Consumer Tier | Requests/Minute | Policy |
|---------------|----------------|--------|
| Anonymous (IP-based) | 20 | Redis |
| Free Tier | 100 | Redis |
| Paid Tier | 500 | Redis |

Rate limiting is enforced via Redis backend for distributed consistency.

##  Plugins

### Core Plugins

| Plugin | Purpose | Configuration |
|--------|---------|---------------|
| **CORS** | Cross-origin resource sharing | Origins: `localhost:5173`, `host.docker.internal:5173` |
| **Correlation ID** | Request tracing | UUID generation, `X-Correlation-Id` header |
| **Prometheus** | Metrics collection | Status code metrics enabled |
| **Response Transformer** | Response modification | Adds gateway headers, removes server info |

### Authentication Plugins
- **JWT**: Applied to protected routes
- **Key-Auth**: Applied to inventory stock routes

### Transformation Plugins
- **Request Transformer**: Injects `X-Consumer-Role: admin` for inventory endpoints
- **Response Transformer**: Adds `X-Gateway: kong` and `X-API-Version: 1.0` headers

##  Getting Started

### Prerequisites
- Docker & Docker Compose
- Redis (for rate limiting)
- Kong Gateway 3.0+

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd kong-gateway-config
```

2. **Start Kong Gateway with Docker:**
```bash
docker-compose up -d
```

3. **Apply the configuration:**
```bash
# Using Kong's declarative configuration
curl -X POST http://localhost:8001/config \
  -H "Content-Type: application/json" \
  -d @kong-config.json
```

### Testing the Configuration

#### Public Routes (No Auth)
```bash
# Register a new user
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

#### Protected Routes (JWT Required)
```bash
# Access protected endpoint
curl -X GET http://localhost:8000/items \
  -H "Authorization: Bearer <your-jwt-token>"
```

#### Key-Auth Protected Routes
```bash
# Update inventory stock (requires API Key)
curl -X PATCH http://localhost:8000/items/123/stock \
  -H "X-API-Key: werttt2345cdfhgghfghfghf" \
  -H "Content-Type: application/json" \
  -d '{"quantity": 50}'
```

##  Consumer Management

### Creating a Consumer
```bash
curl -X POST http://localhost:8001/consumers \
  -H "Content-Type: application/json" \
  -d '{"username": "new-consumer"}'
```

### Managing JWT Secrets
```bash
curl -X POST http://localhost:8001/consumers/{consumer}/jwt \
  -H "Content-Type: application/json" \
  -d '{"secret": "your-secret", "algorithm": "HS256"}'
```

##  Monitoring

### Prometheus Metrics
Access metrics at: `http://localhost:8001/metrics`

Available metrics:
- Request count by status code
- Request latency
- Upstream health status
- Bandwidth metrics

### Correlation ID
All requests receive a unique `X-Correlation-Id` header for end-to-end tracing.

##  Common Issues & Troubleshooting

### JWT Validation Failures
- Ensure `iss` claim matches the consumer's `key`
- Check token hasn't expired (`exp` claim)
- Verify correct secret for the issuer

### Rate Limit Exceeded
- Wait for rate limit window to reset
- Check if you're using correct consumer tier
- Verify Redis connection

### 401 Unauthorized
- Include valid Bearer token in Authorization header
- For key-auth routes, include `X-API-Key` header
- Check if route is public or protected

<!-- ## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details. -->

##  Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

##  Support

For support, please:
- Open an issue in the repository
- Contact the development team
- Check Kong Gateway official documentation

---

**Note:** This configuration uses `host.docker.internal` to connect to services running on the host machine. In production, replace with actual service URLs.
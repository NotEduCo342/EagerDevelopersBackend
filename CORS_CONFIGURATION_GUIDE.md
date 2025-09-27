# 🌐 CORS Configuration Guide

## Architecture Overview:
```
Frontend Domain: https://eagerdevelopers.ir      (Your React/NextJS app)
API Domain:      https://api.eagerdevelopers.ir  (Your NestJS backend)
```

## How CORS Works:
- **Frontend** at `eagerdevelopers.ir` makes requests to **API** at `api.eagerdevelopers.ir`
- **API** needs to allow requests FROM the **frontend domain**
- **CORS origin** = domain that's MAKING the request (frontend)

## Current CORS Configuration (✅ Correct):
```typescript
origin: [
  'https://eagerdevelopers.ir',           // ✅ Frontend domain
  'https://www.eagerdevelopers.ir',       // ✅ Frontend with www
  'https://api.eagerdevelopers.ir',       // ✅ For API testing/docs
]
```

## Cloudflare DNS Setup:
```
A Record: eagerdevelopers.ir     → VPS_IP  (Frontend)
A Record: api.eagerdevelopers.ir → VPS_IP  (API)
```

## Nginx Configuration:
```nginx
# Frontend (Port 80/443)
server {
    server_name eagerdevelopers.ir www.eagerdevelopers.ir;
    # Serve React/NextJS static files or proxy to frontend server
}

# API (Port 80/443) 
server {
    server_name api.eagerdevelopers.ir;
    location / {
        proxy_pass http://localhost:3000;  # Your NestJS app
    }
}
```

## Frontend API Calls:
```javascript
// In your React/NextJS app
const API_BASE_URL = 'https://api.eagerdevelopers.ir/api';

// This request will be allowed by CORS
fetch(`${API_BASE_URL}/analytics/overview`, {
  credentials: 'include'  // Important for cookies/auth
});
```

## Environment Variables:
```bash
# Development
CORS_ORIGIN=http://localhost:5173

# Production  
CORS_ORIGIN=https://eagerdevelopers.ir
```

## Testing CORS:
```bash
# Test from command line (should work)
curl -H "Origin: https://eagerdevelopers.ir" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://api.eagerdevelopers.ir/api/analytics/overview

# Should return CORS headers
```

## Common CORS Issues:
❌ **Wrong**: Setting API domain as origin
✅ **Correct**: Setting frontend domain as origin

❌ **Wrong**: `CORS_ORIGIN=https://api.eagerdevelopers.ir`
✅ **Correct**: `CORS_ORIGIN=https://eagerdevelopers.ir`
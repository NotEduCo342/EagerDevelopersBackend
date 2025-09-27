# 🌍 Environment Configuration Guide

## File Structure:
```
.env                    # Default (development)
.env.development        # Development specific  
.env.production         # Production specific
.env.example            # Template (committed to git)
```

## How NestJS Loads Environment Files:

### Automatic Loading Priority:
1. `.env.${NODE_ENV}`     (e.g., .env.production)
2. `.env`                 (fallback)

### Examples:

**When NODE_ENV=development:**
- Loads `.env.development` first
- Falls back to `.env` if not found

**When NODE_ENV=production:**  
- Loads `.env.production` first
- Falls back to `.env` if not found

## Setting NODE_ENV by Environment:

### Development (Local):
```bash
# .env or .env.development
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

### Production (Server):
```bash  
# .env.production
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://eagerdevelopers.ir
```

## Runtime Methods:

### 1. Package Scripts:
```json
{
  "scripts": {
    "start:dev": "nest start --watch",
    "start:prod": "node dist/main"
  }
}
```

### 2. Direct Command:
```bash
# Development
npm run start:dev

# Production  
NODE_ENV=production npm run start:prod
```

### 3. PM2 (Production Server):
```bash
# Start with production environment
pm2 start ecosystem.config.js --env production
```

## Verification in Code:
```typescript
// In main.ts or any service
const isProduction = process.env.NODE_ENV === 'production';
// OR
const isProduction = configService.get<string>('NODE_ENV') === 'production';
```

## Environment Detection in Your App:
Your current code in `main.ts` correctly detects environment:
```typescript
const isProduction = configService.get<string>('NODE_ENV') === 'production';
```

## Best Practices:
✅ **DO**: Set in .env files
✅ **DO**: Use different files per environment  
✅ **DO**: Set via PM2 for production
❌ **DON'T**: Hardcode in main.ts
❌ **DON'T**: Commit .env.production to git
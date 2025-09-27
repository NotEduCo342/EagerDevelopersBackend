# 🚀 Single Core VPS Optimization Guide

## Your VPS Specs: 1 Core, 2GB RAM

### **Realistic Performance Expectations:**
- **Concurrent Users**: 100-150 with caching
- **Response Time**: <50ms (cached), <300ms (uncached)  
- **Peak Load**: 200 requests/second briefly

## Memory Distribution Recommendation:
```
PostgreSQL:     512MB (25%)
Redis:          256MB (12%) 
NestJS App:     1GB   (50%)
System/Nginx:   256MB (13%)
```

## PostgreSQL Optimization:
```sql
-- Add to postgresql.conf
shared_buffers = 128MB
effective_cache_size = 512MB
work_mem = 4MB
max_connections = 50
```

## Redis Optimization:
```redis
# redis.conf
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
```

## Nginx Optimization:
```nginx
# nginx.conf
worker_processes 1;
worker_connections 1024;
keepalive_timeout 30;

# Enable compression
gzip on;
gzip_types text/plain application/json application/javascript text/css;
```

## Monitoring Commands:
```bash
# Check memory usage
free -h
htop

# Check CPU usage
top -o %CPU

# Monitor your app
pm2 monit

# Database connections
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity;"
```

## Warning Signs to Watch:
- **Memory usage >90%**: Reduce max_connections
- **CPU usage >80%**: Add rate limiting  
- **Response times >1s**: Check database queries
- **Swap usage >0**: Increase RAM or optimize

## Scale-Up Triggers:
- Consistent >150 concurrent users
- Memory usage constantly >90% 
- CPU usage >80% for >5 minutes
- Response times >500ms regularly

## Quick Scale Solutions:
1. **Vertical**: Upgrade to 2 cores, 4GB RAM
2. **Horizontal**: Add load balancer + second VPS
3. **Caching**: Implement CDN for static assets
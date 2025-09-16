// src/auth/decorators/auth-throttle.decorator.ts
import { Throttle } from '@nestjs/throttler';

// Enhanced rate limiting for authentication endpoints

// Login attempts: 5 per 15 minutes (strict)
export const LoginThrottle = () => Throttle({ 
  default: { ttl: 900000, limit: 5 } // 15 minutes, 5 attempts
});

// Token refresh: 20 per hour (moderate)
export const RefreshThrottle = () => Throttle({ 
  default: { ttl: 3600000, limit: 20 } // 1 hour, 20 refreshes
});

// Registration: 3 per hour (strict)
export const RegisterThrottle = () => Throttle({ 
  default: { ttl: 3600000, limit: 3 } // 1 hour, 3 registrations
});

// Session management: 10 per minute (lenient for UX)
export const SessionThrottle = () => Throttle({ 
  default: { ttl: 60000, limit: 10 } // 1 minute, 10 requests
});

// Logout: No limit (user should always be able to logout)
export const LogoutThrottle = () => Throttle({ 
  default: { ttl: 60000, limit: 100 } // Effectively no limit
});
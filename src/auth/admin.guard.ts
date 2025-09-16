// src/auth/admin.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class AdminGuard extends JwtAuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First check if user is authenticated (using parent JWT guard)
    const isAuthenticated = await super.canActivate(context);
    
    if (!isAuthenticated) {
      return false;
    }

    // Then check if user has admin privileges
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    console.log('User in AdminGuard:', user); // Debug log

    if (!user || !user.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
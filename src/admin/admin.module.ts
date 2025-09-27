import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule, // Import for AdminGuard access
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService], // Export for use in other modules if needed
})
export class AdminModule {}
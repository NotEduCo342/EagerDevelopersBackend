// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module'; // <-- Import AuthModule

@Module({
  imports: [PrismaModule, AuthModule], // <-- Add PrismaModule and AuthModule
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
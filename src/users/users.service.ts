// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async updateUser(userId: string, data: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: data,
    });

    const { password, ...result } = user;
    return result;
  }
}
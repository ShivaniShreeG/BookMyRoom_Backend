import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class UserService {
  // 🔹 Get all users (selecting specific fields)
  async findAll() {
    return prisma.user.findMany({
      select: {
        user_id: true,
        lodge_id: true,
        role: true,
        is_active: true,
      },
    });
  }

  // 🔹 Get one user by ID (selecting specific fields)
  async findOne(user_id: bigint, lodge_id: number) {
    return prisma.user.findUnique({
      where: { user_id_lodge_id: { user_id, lodge_id } },
      select: {
        user_id: true,
        lodge_id: true,
        role: true,
        is_active: true,
      },
    });
  }

   async findByLodgeId(lodge_id: number) {
    return prisma.user.findMany({
      where: { lodge_id },
      select: {
        user_id: true,
        lodge_id: true,
        role: true,
        is_active: true,
      },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class AdministratorService {
  // 🔹 1️⃣ Get all administrators
  async findAll() {
    return prisma.administrator.findMany({
      select: {
        id: true,
        user_id: true,
        lodge_id: true,
        name: true,
        phone: true,
        email: true,
      },
    });
  }

  // 🔹 2️⃣ Get all administrators by lodge_id
  async findByLodgeId(lodge_id: number) {
    return prisma.administrator.findMany({
      where: { lodge_id },
      select: {
        id: true,
        user_id: true,
        lodge_id: true,
        name: true,
        phone: true,
        email: true,
      },
    });
  }

  // 🔹 3️⃣ Get one administrator by user_id + lodge_id
  async findOne(user_id: bigint, lodge_id: number) {
    return prisma.administrator.findUnique({
      where: { user_id_lodge_id: { user_id, lodge_id } },
      select: {
        id: true,
        user_id: true,
        lodge_id: true,
        name: true,
        phone: true,
        email: true,
      },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class DefaultValueService {
  // 🔹 1️⃣ Get all default values
  async findAll() {
    return prisma.defaultValue.findMany({
      select: {
        id: true,
        user_id: true,
        lodge_id: true,
        type: true,
        reason: true,
        amount: true,
      },
    });
  }

  // 🔹 2️⃣ Get all default values for a specific lodge
  async findByLodgeId(lodge_id: number) {
    return prisma.defaultValue.findMany({
      where: { lodge_id },
      select: {
        id: true,
        user_id: true,
        lodge_id: true,
        type: true,
        reason: true,
        amount: true,
      },
    });
  }

  // 🔹 3️⃣ Get a single default value by ID + lodge_id
  async findOne(id: number, lodge_id: number) {
    return prisma.defaultValue.findFirst({
      where: { id, lodge_id },
      select: {
        id: true,
        user_id: true,
        lodge_id: true,
        type: true,
        reason: true,
        amount: true,
      },
    });
  }
}

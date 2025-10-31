import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class IncomeService {
  // 🔹 1️⃣ Get all incomes
  async findAll() {
    return prisma.income.findMany({
      select: {
        id: true,
        lodge_id: true,
        user_id: true,
        reason: true,
        amount: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  // 🔹 2️⃣ Get all incomes for a specific lodge
  async findByLodgeId(lodge_id: number) {
    return prisma.income.findMany({
      where: { lodge_id },
      select: {
        id: true,
        lodge_id: true,
        user_id: true,
        reason: true,
        amount: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  // 🔹 3️⃣ Get one income by ID + lodge_id
  async findOne(id: number, lodge_id: number) {
    return prisma.income.findFirst({
      where: { id, lodge_id },
      select: {
        id: true,
        lodge_id: true,
        user_id: true,
        reason: true,
        amount: true,
        created_at: true,
        updated_at: true,
      },
    });
  }
}

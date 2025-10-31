import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class ExpenseService {
  // 🔹 1️⃣ Get all expenses
  async findAll() {
    return prisma.expense.findMany({
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

  // 🔹 2️⃣ Get all expenses for a specific lodge
  async findByLodgeId(lodge_id: number) {
    return prisma.expense.findMany({
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

  // 🔹 3️⃣ Get one expense by ID + lodge_id
  async findOne(id: number, lodge_id: number) {
    return prisma.expense.findFirst({
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

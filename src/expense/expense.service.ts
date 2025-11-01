import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/create-expense.dto';

const prisma = new PrismaClient();

@Injectable()
export class ExpenseService {
  // 1️⃣ All expenses for a lodge
  async findAllByLodge(lodgeId: number) {
    const expenses = await prisma.expense.findMany({
      where: { lodge_id: lodgeId },
      select: {
        id: true,
        lodge_id: true,
        user_id: true,
        reason: true,
        amount: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' },
    });

    if (!expenses.length)
      throw new NotFoundException(`No expenses found for lodge ID ${lodgeId}`);
    return expenses;
  }

  // 2️⃣ Single expense by lodge + ID
  async findOne(lodgeId: number, expenseId: number) {
    const expense = await prisma.expense.findFirst({
      where: { id: expenseId, lodge_id: lodgeId },
      select: {
        id: true,
        lodge_id: true,
        user_id: true,
        reason: true,
        amount: true,
        created_at: true,
      },
    });

    if (!expense)
      throw new NotFoundException(
        `Expense ID ${expenseId} not found for lodge ID ${lodgeId}`,
      );
    return expense;
  }

  // 3️⃣ Create expense
  async create(dto: CreateExpenseDto) {
    const expense = await prisma.expense.create({
      data: {
        user_id: dto.user_id,
        lodge_id: dto.lodge_id,
        reason: dto.reason,
        amount: dto.amount,
      },
      select: {
        id: true,
        lodge_id: true,
        user_id: true,
        reason: true,
        amount: true,
        created_at: true,
      },
    });
    return expense;
  }

  // 4️⃣ Update expense
  async update(expenseId: number, dto: UpdateExpenseDto) {
    const existing = await prisma.expense.findUnique({ where: { id: expenseId } });
    if (!existing)
      throw new NotFoundException(`Expense ID ${expenseId} not found`);

    const updated = await prisma.expense.update({
      where: { id: expenseId },
      data: {
        reason: dto.reason ?? existing.reason,
        amount: dto.amount ?? existing.amount,
      },
      select: {
        id: true,
        lodge_id: true,
        user_id: true,
        reason: true,
        amount: true,
        created_at: true,
      },
    });

    return updated;
  }

  // 5️⃣ Delete expense
  async remove(expenseId: number) {
    const existing = await prisma.expense.findUnique({ where: { id: expenseId } });
    if (!existing)
      throw new NotFoundException(`Expense ID ${expenseId} not found`);

    await prisma.expense.delete({ where: { id: expenseId } });
    return { message: `Expense ID ${expenseId} deleted successfully` };
  }
}

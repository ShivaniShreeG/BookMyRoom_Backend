import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class HomeService {
  /**
   * Get finance summary for a lodge
   * @param lodgeId Lodge ID
   */
  async getFinanceSummary(lodgeId: number) {
    // Check if lodge exists
    const lodge = await prisma.lodge.findUnique({ where: { lodge_id: lodgeId } });
    if (!lodge) {
      throw new NotFoundException(`Lodge with ID ${lodgeId} not found`);
    }

    // Total Income
    const totalIncomeResult = await prisma.income.aggregate({
      _sum: { amount: true },
      where: { lodge_id: lodgeId },
    });
    const totalIncome = totalIncomeResult._sum.amount ?? 0;

    // Total Expense
    const totalExpenseResult = await prisma.expense.aggregate({
      _sum: { amount: true },
      where: { lodge_id: lodgeId },
    });
    const totalExpense = totalExpenseResult._sum.amount ?? 0;

    // Total Drawing In
    const totalDrawingInResult = await prisma.drawing.aggregate({
      _sum: { amount: true },
      where: { lodge_id: lodgeId, type: 'in' },
    });
    const totalDrawingIn = totalDrawingInResult._sum.amount ?? 0;

    // Total Drawing Out
    const totalDrawingOutResult = await prisma.drawing.aggregate({
      _sum: { amount: true },
      where: { lodge_id: lodgeId, type: 'out' },
    });
    const totalDrawingOut = totalDrawingOutResult._sum.amount ?? 0;

    // Current Balance
    const currentBalance = totalIncome + totalDrawingIn - totalExpense - totalDrawingOut;

    return {
      totalIncome,
      totalExpense,
      totalDrawingIn,
      totalDrawingOut,
      currentBalance,
    };
  }
}

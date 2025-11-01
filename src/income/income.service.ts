import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';

const prisma = new PrismaClient();

@Injectable()
export class IncomeService {
  // 1️⃣ Create income
  async create(dto: CreateIncomeDto) {
    const { lodge_id, user_id, reason, amount } = dto;

    // Validate lodge and user existence
    const lodge = await prisma.lodge.findUnique({ where: { lodge_id } });
    if (!lodge) throw new NotFoundException(`Lodge with ID ${lodge_id} not found`);

    const user = await prisma.user.findUnique({
      where: { user_id_lodge_id: { user_id, lodge_id } },
    });
    if (!user) throw new NotFoundException(`User with ID ${user_id} not found in lodge ${lodge_id}`);

    return prisma.income.create({
      data: { lodge_id, user_id, reason, amount },
    });
  }

  // 2️⃣ Get all incomes for a lodge
  async findAllByLodge(lodge_id: number) {
    const incomes = await prisma.income.findMany({
      where: { lodge_id },
      orderBy: { created_at: 'desc' },
      include: {
        user: { select: { user_id: true, role: true, is_active: true } },
      },
    });

    if (!incomes.length)
      throw new NotFoundException(`No incomes found for lodge ID ${lodge_id}`);
    return incomes;
  }

  // 3️⃣ Get single income
  async findOne(id: number) {
    const income = await prisma.income.findUnique({
      where: { id },
      include: {
        lodge: { select: { name: true } },
        user: { select: { user_id: true, role: true } },
      },
    });
    if (!income) throw new NotFoundException(`Income with ID ${id} not found`);
    return income;
  }

  // 4️⃣ Update income
  async update(id: number, dto: UpdateIncomeDto) {
    await this.findOne(id); // ensure record exists
    return prisma.income.update({
      where: { id },
      data: dto,
    });
  }

  // 5️⃣ Delete income
  async remove(id: number) {
    await this.findOne(id); // ensure record exists
    return prisma.income.delete({ where: { id } });
  }
}

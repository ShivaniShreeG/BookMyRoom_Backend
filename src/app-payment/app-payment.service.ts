import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class AppPaymentService {
  // 🔹 1️⃣ Get all app payments
  async findAll() {
    return prisma.appPayment.findMany({
      select: {
        id: true,
        lodge_id: true,
        BaseAmount: true,
        gst: true,
        amount: true,
        paidAt: true,
        periodStart: true,
        periodEnd: true,
        transactionId: true,
        status: true,
        createdAt: true,
      },
    });
  }

  // 🔹 2️⃣ Get all payments for a specific lodge
  async findByLodgeId(lodge_id: number) {
    return prisma.appPayment.findMany({
      where: { lodge_id },
      select: {
        id: true,
        lodge_id: true,
        BaseAmount: true,
        gst: true,
        amount: true,
        paidAt: true,
        periodStart: true,
        periodEnd: true,
        transactionId: true,
        status: true,
        createdAt: true,
      },
    });
  }

  // 🔹 3️⃣ Get one payment by ID + lodge_id
  async findOne(id: number, lodge_id: number) {
    return prisma.appPayment.findFirst({
      where: { id, lodge_id },
      select: {
        id: true,
        lodge_id: true,
        BaseAmount: true,
        gst: true,
        amount: true,
        paidAt: true,
        periodStart: true,
        periodEnd: true,
        transactionId: true,
        status: true,
        createdAt: true,
      },
    });
  }
}

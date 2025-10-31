import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class BillingService {
  // 🔹 1️⃣ Get all billing records
  async findAll() {
    return prisma.billing.findMany({
      select: {
        id: true,
        booking_id: true,
        lodge_id: true,
        user_id: true,
        reason: true,
        total: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  // 🔹 2️⃣ Get all billings for a specific lodge
  async findByLodgeId(lodge_id: number) {
    return prisma.billing.findMany({
      where: { lodge_id },
      select: {
        id: true,
        booking_id: true,
        lodge_id: true,
        user_id: true,
        reason: true,
        total: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  // 🔹 3️⃣ Get one billing by booking_id + lodge_id
  async findOne(booking_id: number, lodge_id: number) {
    return prisma.billing.findUnique({
      where: { booking_id_lodge_id: { booking_id, lodge_id } },
      select: {
        id: true,
        booking_id: true,
        lodge_id: true,
        user_id: true,
        reason: true,
        total: true,
        created_at: true,
        updated_at: true,
      },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class CancelService {
  // 🔹 1️⃣ Get all cancel records
  async findAll() {
    return prisma.cancel.findMany({
      select: {
        id: true,
        booking_id: true,
        lodge_id: true,
        user_id: true,
        reason: true,
        amount_paid: true,
        cancel_charge: true,
        refund: true,
        created_at: true,
      },
    });
  }

  // 🔹 2️⃣ Get all cancellations for a specific lodge
  async findByLodgeId(lodge_id: number) {
    return prisma.cancel.findMany({
      where: { lodge_id },
      select: {
        id: true,
        booking_id: true,
        lodge_id: true,
        user_id: true,
        reason: true,
        amount_paid: true,
        cancel_charge: true,
        refund: true,
        created_at: true,
      },
    });
  }

  // 🔹 3️⃣ Get one cancellation by booking_id + lodge_id
  async findOne(booking_id: number, lodge_id: number) {
    return prisma.cancel.findUnique({
      where: { booking_id_lodge_id: { booking_id, lodge_id } },
      select: {
        id: true,
        booking_id: true,
        lodge_id: true,
        user_id: true,
        reason: true,
        amount_paid: true,
        cancel_charge: true,
        refund: true,
        created_at: true,
      },
    });
  }
}

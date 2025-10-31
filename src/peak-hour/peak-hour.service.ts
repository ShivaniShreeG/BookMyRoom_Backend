import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class PeakHoursService {
  // 🔹 1️⃣ Get all peak hours
  async findAll() {
    return prisma.peak_hours.findMany({
      select: {
        id: true,
        lodge_id: true,
        user_id: true,
        date: true,
        reason: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  // 🔹 2️⃣ Get all peak hours for a specific lodge
  async findByLodgeId(lodge_id: number) {
    return prisma.peak_hours.findMany({
      where: { lodge_id },
      select: {
        id: true,
        lodge_id: true,
        user_id: true,
        date: true,
        reason: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  // 🔹 3️⃣ Get a single peak hour record by ID + lodge_id
  async findOne(id: number, lodge_id: number) {
    return prisma.peak_hours.findFirst({
      where: { id, lodge_id },
      select: {
        id: true,
        lodge_id: true,
        user_id: true,
        date: true,
        reason: true,
        created_at: true,
        updated_at: true,
      },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class LodgeBlockService {
  // 🔹 1️⃣ Get all lodge blocks
  async findAll() {
    return prisma.lodgeBlock.findMany({
      select: {
        id: true,
        lodge_id: true,
        reason: true,
      },
    });
  }

  // 🔹 2️⃣ Get all lodge blocks for a specific lodge
  async findByLodgeId(lodge_id: number) {
    return prisma.lodgeBlock.findMany({
      where: { lodge_id },
      select: {
        id: true,
        lodge_id: true,
        reason: true,
      },
    });
  }

  // 🔹 3️⃣ Get a single lodge block by ID + lodge_id
  async findOne(id: number, lodge_id: number) {
    return prisma.lodgeBlock.findFirst({
      where: { id, lodge_id },
      select: {
        id: true,
        lodge_id: true,
        reason: true,
      },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class FacilitatorService {
  // 🔹 1️⃣ Get all facilitators
  async findAll() {
    return prisma.facilitator.findMany({
      select: {
        id: true,
        lodge_id: true,
        facility: true,
        name: true,
        phone: true,
        created_at: true,
      },
    });
  }

  // 🔹 2️⃣ Get all facilitators for a specific lodge
  async findByLodgeId(lodge_id: number) {
    return prisma.facilitator.findMany({
      where: { lodge_id },
      select: {
        id: true,
        lodge_id: true,
        facility: true,
        name: true,
        phone: true,
        created_at: true,
      },
    });
  }

  // 🔹 3️⃣ Get one facilitator by ID + lodge_id
  async findOne(id: number, lodge_id: number) {
    return prisma.facilitator.findFirst({
      where: { id, lodge_id },
      select: {
        id: true,
        lodge_id: true,
        facility: true,
        name: true,
        phone: true,
        created_at: true,
      },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class AdminService {
  // 🔹 Fetch all admins with selected fields
  async findAll() {
    return prisma.admin.findMany({
      select: {
        id: true,
        lodge_id: true,
        user_id: true,
        name: true,
        designation: true,
        phone: true,
        email: true,
      },
    });
  }

  // 🔹 Fetch single admin by ID
  async findOne(id: number) {
    return prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        lodge_id: true,
        user_id: true,
        name: true,
        designation: true,
        phone: true,
        email: true,
      },
    });
  }
  async findByLodgeId(lodge_id: number) {
    return prisma.admin.findMany({
      where: { lodge_id },
      select: {
        id: true,
        lodge_id: true,
        user_id: true,
        name: true,
        designation: true,
        phone: true,
        email: true,
      },
    });
  }
}

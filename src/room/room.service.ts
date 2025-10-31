import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class RoomsService {
  // 🔹 1️⃣ Get all rooms
  async findAll() {
    return prisma.rooms.findMany({
      select: {
        id: true,
        user_id: true,
        lodge_id: true,
        room_name: true,
        room_type: true,
        room_number: true,
      },
    });
  }

  // 🔹 2️⃣ Get all rooms for a specific lodge
  async findByLodgeId(lodge_id: number) {
    return prisma.rooms.findMany({
      where: { lodge_id },
      select: {
        id: true,
        user_id: true,
        lodge_id: true,
        room_name: true,
        room_type: true,
        room_number: true,
      },
    });
  }

  // 🔹 3️⃣ Get a single room by ID + lodge_id
  async findOne(id: number, lodge_id: number) {
    return prisma.rooms.findFirst({
      where: { id, lodge_id },
      select: {
        id: true,
        user_id: true,
        lodge_id: true,
        room_name: true,
        room_type: true,
        room_number: true,
      },
    });
  }
}

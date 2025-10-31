import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class BookingService {
  // 🔹 1️⃣ Get all bookings
  async findAll() {
    return prisma.booking.findMany({
      select: {
        booking_id: true,
        lodge_id: true,
        user_id: true,
        name: true,
        phone: true,
        alternate_phone: true,
        email: true,
        address: true,
        numberofguest: true,
        specification: true,
        check_in: true,
        check_out: true,
        baseamount: true,
        gst: true,
        amount: true,
        status: true,
        id_proof: true,
      },
    });
  }

  // 🔹 2️⃣ Get all bookings for a specific lodge
  async findByLodgeId(lodge_id: number) {
    return prisma.booking.findMany({
      where: { lodge_id },
      select: {
        booking_id: true,
        lodge_id: true,
        user_id: true,
        name: true,
        phone: true,
        alternate_phone: true,
        email: true,
        address: true,
        numberofguest: true,
        specification: true,
        check_in: true,
        check_out: true,
        baseamount: true,
        gst: true,
        amount: true,
        status: true,
        id_proof: true,
      },
    });
  }

  // 🔹 3️⃣ Get one booking by booking_id + lodge_id
  async findOne(booking_id: number, lodge_id: number) {
    return prisma.booking.findUnique({
      where: { booking_id_lodge_id: { booking_id, lodge_id } },
      select: {
        booking_id: true,
        lodge_id: true,
        user_id: true,
        name: true,
        phone: true,
        alternate_phone: true,
        email: true,
        address: true,
        numberofguest: true,
        specification: true,
        check_in: true,
        check_out: true,
        baseamount: true,
        gst: true,
        amount: true,
        status: true,
        id_proof: true,
      },
    });
  }
}

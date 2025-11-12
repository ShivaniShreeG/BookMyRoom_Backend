import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


@Injectable()
export class CalenderService {

   async getBookingsByRoom(
  lodgeId: number,
  roomType: string,
  roomName: string
) {
  // 1. Find all rooms matching type+name
  const rooms = await prisma.rooms.findMany({
    where: {
      lodge_id: lodgeId,
      room_type: roomType,
      room_name: roomName,
    },
    select: {
      room_number: true, // array of room numbers
    },
  });

  const allRoomNumbers = rooms.flatMap(r => r.room_number);

  // 2. Fetch bookings for these rooms (exclude cancelled)
  const bookings = await prisma.booking.findMany({
    where: {
      lodge_id: lodgeId,
      room_type: roomType,
      room_name: roomName,
      status: {
        in: ['BOOKED', 'BILLED'], // only include booked/billed
      },
    },
  });

  // 3. Fetch peak hours for this lodge
  const peakHours = await prisma.peak_hours.findMany({
    where: {
      lodge_id: lodgeId,
    },
  });

  // 4. Return bookings along with all room numbers and peak hours
  return {
    allRoomNumbers,
    bookings: bookings.map(b => ({
      booking_id: b.booking_id,
      room_number: b.room_number,
      check_in: b.check_in,
      check_out: b.check_out,
      status: b.status,
    })),
    peakHours: peakHours.map(p => ({
      id: p.id,
      date: p.date,
      reason: p.reason,
    })),
  };
}

  async getRoomsSummary(lodgeId: number) {

    const rooms = await prisma.rooms.findMany({
      where: { lodge_id: lodgeId },
      select: {
        id:true,
        room_type: true,
        room_name: true,
        room_number: true, // JSON array of room numbers
      },
    });

    // Group by room_type + room_name
    const summaryMap = new Map<string, { id:number,room_type: string; room_name: string; total: number; numbers: string }>();

    rooms.forEach(room => {
      const key = `${room.room_type}-${room.room_name}`;
      const numbersArray = Array.isArray(room.room_number) ? room.room_number : [room.room_number];

      if (summaryMap.has(key)) {
        const existing = summaryMap.get(key)!;
        existing.total += numbersArray.length; // sum total rooms
        existing.numbers += ',' + numbersArray.join(',');
      } else {
        summaryMap.set(key, {
          id:room.id,
          room_type: room.room_type,
          room_name: room.room_name,
          total: numbersArray.length,
          numbers: numbersArray.join(','),
        });
      }
    });

    return Array.from(summaryMap.values());
  }
}

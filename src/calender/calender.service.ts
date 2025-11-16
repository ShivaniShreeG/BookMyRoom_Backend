import { Injectable ,BadRequestException, NotFoundException} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class CalenderService {

async getAvailableRooms(
  lodgeId: number,
  checkIn: Date,
  checkOut: Date
) {
  // 1️⃣ Get all rooms for the lodge
  const rooms = await prisma.rooms.findMany({
    where: { lodge_id: lodgeId },
    select: {
      room_type: true,
      room_name: true,
      room_number: true, // JSON array
    },
  });

  // 2️⃣ Get overlapping bookings for the lodge
  const overlapping = await prisma.booking.findMany({
    where: {
      lodge_id: lodgeId,
      status: { in: ["BOOKED", "PREBOOKED", "BILLED"] },
      // interval overlap check
      check_in: { lt: checkOut },  // existing booking starts before requested checkOut
      check_out: { gt: checkIn },  // existing booking ends after requested checkIn
    },
    select: { room_number: true },
  });

  // 3️⃣ Flatten booked room numbers from JSON arrays
  const booked = new Set<string>();
  overlapping.forEach(b => {
    if (Array.isArray(b.room_number)) {
      b.room_number.forEach(n => booked.add(String(n)));
    } else if (b.room_number) {
      booked.add(String(b.room_number));
    }
  });

  // 4️⃣ Group rooms by type + name and calculate available rooms
  const result = new Map<string, {
    room_type: string;
    room_name: string;
    available_rooms: string[];
    total_rooms: number;
    all_room_numbers: string[];
  }>();

  rooms.forEach(room => {
    const key = `${room.room_type}-${room.room_name}`;
    const numbers: string[] = Array.isArray(room.room_number)
      ? room.room_number.map(String)
      : [String(room.room_number)];

    const available = numbers.filter(n => !booked.has(n));

    if (!result.has(key)) {
      result.set(key, {
        room_type: room.room_type,
        room_name: room.room_name,
        available_rooms: available,
        total_rooms: numbers.length,
        all_room_numbers: numbers,
      });
    } else {
      const grp = result.get(key)!;
      grp.available_rooms.push(...available);
      grp.total_rooms += numbers.length;
      grp.all_room_numbers.push(...numbers);
    }
  });

  return Array.from(result.values());
}



async calculateRoomPrice(dto: any) {
  const lodge_id = Number(dto.lodge_id);
  const room_name = dto.room_name;
  const room_type = dto.room_type;
  const check_in = new Date(dto.check_in);
  const check_out = new Date(dto.check_out);
  const room_count = Number(dto.room_count);

  const override_base_amount = dto.override_base_amount
    ? Number(dto.override_base_amount)
    : undefined;

  if (isNaN(room_count)) {
    throw new BadRequestException("room_count must be numeric");
  }

  // Calculate number of days (check-out - check-in)
  const oneDay = 1000 * 60 * 60 * 24;
  const numDays = Math.ceil((check_out.getTime() - check_in.getTime()) / oneDay);

  const reason = `Rent (${room_name} (${room_type}))`;

  let baseAmount = 0;
  if (override_base_amount) {
    baseAmount = override_base_amount;
  } else {
    const peak = await prisma.peak_hours.findFirst({
      where: {
        lodge_id,
        date: { gte: check_in, lte: check_out },
      },
    });

    const defaultValue = await prisma.defaultValue.findFirst({
      where: {
        lodge_id,
        reason,
        type: peak ? "Peak Hours" : "Default",
      },
    });

    if (!defaultValue) {
      throw new BadRequestException(
        `Default value missing for ${reason} (${peak ? "peak hour" : "normal"})`
      );
    }

    baseAmount = Number(defaultValue.amount);
  }

  // Total = baseAmount × number of rooms × number of days
  const totalBase = baseAmount * room_count * numDays;

  const GST_RATE = 18;
  const gstAmount = Number((totalBase * GST_RATE / 100).toFixed(2));
  const totalAmount = Number((totalBase + gstAmount).toFixed(2));

  return {
    status: override_base_amount ? "OVERRIDE" : "NORMAL",
    room_name,
    room_type,
    check_in,
    check_out,
    room_count,
    num_days: numDays, // send number of days to frontend

    base_amount_per_room: baseAmount,
    total_base_amount: totalBase,

    gst_rate: GST_RATE,
    gst_amount: gstAmount,
    total_amount: totalAmount,
  };
}

async updatePricing(dto: any) {
  const lodge_id = Number(dto.lodge_id);
  const room_name = dto.room_name;
  const room_type = dto.room_type;
  const pricing_type = dto.pricing_type; // "NORMAL" | "PEAK_HOUR"
  const room_count = Number(dto.room_count);
  const check_in = new Date(dto.check_in);
  const check_out = new Date(dto.check_out);

  if (!room_name || !room_type || !pricing_type) {
    throw new BadRequestException("room_name, room_type, and pricing_type are required");
  }

  if (isNaN(room_count) || room_count <= 0) {
    throw new BadRequestException("room_count must be a positive number");
  }

  const reason = `Rent (${room_name} (${room_type}))`;

  const defaultValue = await prisma.defaultValue.findFirst({
    where: {
      lodge_id,
      reason,
      type: pricing_type === "PEAK_HOUR" ? "Peak Hours" : "Default",
    },
  });

  if (!defaultValue) {
    throw new BadRequestException(`Default price missing for ${reason} (${pricing_type})`);
  }

  const baseAmount = Number(defaultValue.amount);

  const oneDay = 1000 * 60 * 60 * 24;
  const numDays = Math.ceil((check_out.getTime() - check_in.getTime()) / oneDay);

  const totalBase = baseAmount * room_count * numDays;
  const GST_RATE = 18;
  const gstAmount = Number((totalBase * GST_RATE / 100).toFixed(2));
  const totalAmount = Number((totalBase + gstAmount).toFixed(2));

  return {
    status: pricing_type,
    room_name,
    room_type,
    check_in,
    check_out,
    room_count,
    num_days: numDays, // send number of days to frontend

    base_amount_per_room: baseAmount,
    total_base_amount: totalBase,

    gst_rate: GST_RATE,
    gst_amount: gstAmount,
    total_amount: totalAmount,
  };
}





}

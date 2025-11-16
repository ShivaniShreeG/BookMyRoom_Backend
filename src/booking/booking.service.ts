import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaClient, BookingStatus } from '@prisma/client';
import { CreateBookingDto } from './dto/create-booking.dto';

const prisma = new PrismaClient();

@Injectable()
export class BookingService {

 async createBooking(dto: CreateBookingDto) {
  const {
    lodge_id,
    user_id,
    id_proofs,
    room_number,
    specification,
    balance,
    numberofguest,
    baseamount,
    gst,
    amount,
    advance,
    deposite,
    check_in,
    check_out,
    ...rest
  } = dto;

  if (!id_proofs || id_proofs.length === 0) {
    throw new BadRequestException('At least one ID proof is required');
  }

  // Convert numeric and date fields
  const numericBalance = Number(balance);
  const numericBaseAmount = Number(baseamount);
  const numericDeposite = Number(deposite);
  const numericGst = Number(gst);
  const numericAmount = Number(amount);
  const numericAdvance = Number(advance);
  const numericGuests = Number(numberofguest);
  const checkInDate = new Date(check_in);
  const checkOutDate = new Date(check_out);

  // Ensure room_numbers is an array
  const rooms = Array.isArray(room_number) ? room_number : [];

  // Parse specification if it's a string
  let specObj = {};
  if (specification) {
    if (typeof specification === 'string') {
      specObj = JSON.parse(specification);
    } else {
      specObj = { ...specification };
    }
  }

  // Auto-increment booking_id per lodge
  const lastBooking = await prisma.booking.findFirst({
    where: { lodge_id },
    orderBy: { booking_id: 'desc' },
    select: { booking_id: true },
  });
  const newBookingId = lastBooking ? lastBooking.booking_id + 1 : 1;

  const booking = await prisma.booking.create({
    data: {
      booking_id: newBookingId,
      lodge_id,
      user_id,
      ...rest,
      numberofguest: numericGuests,
      Balance: numericBalance,
      baseamount: numericBaseAmount,
      gst: numericGst,
      amount: numericAmount,
      advance: numericAdvance,
      deposite:numericDeposite,
      check_in: checkInDate,
      check_out: checkOutDate,
      status: 'BOOKED',
      room_number: rooms,
      id_proof: id_proofs,
      specification: specObj,
    },
  });

  if (numericAdvance > 0) {
    await prisma.income.create({
      data: {
        lodge_id,
        user_id,
        reason: `Advance for booking #${booking.booking_id}`,
        amount: numericAdvance,
        type: "BOOKING",
      },
    });
  }

  // Deposit income (ONLY IF > 0)
  if (numericDeposite > 0) {
    await prisma.income.create({
      data: {
        lodge_id,
        user_id,
        reason: `Deposit for booking #${booking.booking_id}`,
        amount: numericDeposite,
        type: "BOOKING",
      },
    });
  }
  
  return booking;
}
async getLatestBookingByPhone(lodgeId: number, phone: string) {
    if (!lodgeId || !phone) {
      throw new BadRequestException('lodgeId and phone are required');
    }

    // Fetch the latest booking for the given phone and lodge
    const latestBooking = await prisma.booking.findFirst({
      where: {
        lodge_id: lodgeId,
        phone: phone,
      },
      orderBy: {
        created_at: 'desc', // newest first
      },
      select: {
        name: true,
        phone: true,
        alternate_phone: true,
        email: true,
        address: true,
      },
    });

    if (!latestBooking) {
      throw new NotFoundException('No booking found for this phone number');
    }

    return latestBooking;
}
}

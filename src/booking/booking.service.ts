import { Injectable, BadRequestException, NotFoundException ,InternalServerErrorException} from '@nestjs/common';
import { PrismaClient, BookingStatus } from '@prisma/client';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreatePreBookingDto } from './dto/pre-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

const prisma = new PrismaClient();

@Injectable()
export class BookingService {

 async createBooking(dto: CreateBookingDto) {
  const {
    lodge_id,
    user_id,
    rooms,
    booked_rooms,
    id_proofs,
    specification,
    balance,
    numberofguest,
    baseamount,
    gst,
    aadhar_number,
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

  // Auto-increment booking_id per lodge
  const lastBooking = await prisma.booking.findFirst({
    where: { lodge_id },
    orderBy: { booking_id: 'desc' },
    select: { booking_id: true },
  });
  const newBookingId = lastBooking ? lastBooking.booking_id + 1 : 1;
const roomAmountJson = dto.rooms.map(room => ({
  room_name: room.room_name,
  room_type: room.room_type,
  room_count: room.room_count,
  base_amount_per_room: room.base_amount_per_room,
  group_total_base_amount: room.group_total_base_amount,
}));

  // Create booking
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
      deposite: numericDeposite,
      check_in: checkInDate,
      check_out: checkOutDate,
      status: 'BOOKED',
      room_amount: roomAmountJson,  // ✅ plain objects now
      booked_room:booked_rooms,   // nested array
      id_proof: id_proofs,
      aadhar_number: aadhar_number || [],
      specification,
    },
  });

  // Create income records for advance
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

  // Create income record for deposit
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


async updateBooking(
  lodgeId: number,
  bookingId: number,
  dto: UpdateBookingDto,
  aadhar_number: string[],
  newIdProofs: string[],
) {
  try {
    const existingBooking = await prisma.booking.findUnique({
      where: { booking_id_lodge_id: { booking_id: bookingId, lodge_id: lodgeId } },
    });

    if (!existingBooking) {
      throw new BadRequestException('Booking not found');
    }

    const existingProofs = Array.isArray(existingBooking.id_proof)
      ? existingBooking.id_proof
      : [];

    const updatedBooking = await prisma.booking.update({
      where: {
        booking_id_lodge_id: {
          booking_id: bookingId,
          lodge_id: lodgeId,
        },
      },
      data: {
        numberofguest:
          dto.numberofguest !== undefined
            ? Number(dto.numberofguest)
            : existingBooking.numberofguest,

        deposite:
          dto.deposite !== undefined
            ? Number(dto.deposite)
            : existingBooking.deposite,

        aadhar_number: aadhar_number ?? existingBooking.aadhar_number,

        id_proof: [...existingProofs, ...newIdProofs],

        status: 'BOOKED',
      },
    });

    return updatedBooking;
  } catch (err) {
    console.error('Error updating booking:', err);
    throw new InternalServerErrorException('Failed to update booking');
  }
}

async createPreBooking(dto: CreatePreBookingDto) {
  const {
    lodge_id,
    user_id,
    rooms,
    booked_rooms,
    specification,
    balance,
    payment_method,
    baseamount,
    gst,
    amount,
    advance,
    check_in,
    check_out,
    name,
    phone,
    address,
    numberofguest,
    email,
    alternate_phone,
  } = dto;

  try {
    // Convert numeric fields
    const numericBalance = Number(balance) || 0;
    const numericBaseAmount = Number(baseamount) || 0;
    const numericGst = Number(gst) || 0;
    const numericAmount = Number(amount) || 0;
    const numericAdvance = Number(advance) || 0;
    const numericGuests = Number(numberofguest) || 0;

    // Convert dates
    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      throw new BadRequestException('Invalid check_in or check_out date');
    }
    const lodgeIdNumber = Number(lodge_id);
if (isNaN(lodgeIdNumber)) {
  throw new BadRequestException('Invalid lodge_id. Must be a number.');
}

    // Parse specification safely
    const specObj = specification || {};

    // Auto-increment booking_id per lodge
    const lastBooking = await prisma.booking.findFirst({
  where: { lodge_id: lodgeIdNumber },
      orderBy: { booking_id: 'desc' },
      select: { booking_id: true },
    });
    const newBookingId = lastBooking ? lastBooking.booking_id + 1 : 1;

    // Prepare room_amount JSON from rooms array
    const roomAmountJson = Array.isArray(rooms)
      ? rooms.map(room => ({
          room_name: room.room_name,
          room_type: room.room_type,
          room_count: room.room_count,
          base_amount_per_room: room.base_amount_per_room,
          group_total_base_amount: room.group_total_base_amount,
        }))
      : [];

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        booking_id: newBookingId,
        lodge_id: lodgeIdNumber, // ✅ Use the number here
        user_id,
        name,
        phone,
        address,
        payment_method,
        email: email || '',
        alternate_phone: alternate_phone || '',
        room_amount: roomAmountJson,
        booked_room: booked_rooms || [],
        specification: specObj,
        Balance: numericBalance,
        baseamount: numericBaseAmount,
        gst: numericGst,
        amount: numericAmount,
        advance: numericAdvance,
        check_in: checkInDate,
        check_out: checkOutDate,
        status: 'PREBOOKED',
        numberofguest: numericGuests,
    
      },
    });

    // Record advance if any
    if (numericAdvance > 0) {
      await prisma.income.create({
        data: {
      lodge_id: lodgeIdNumber, // ✅ convert to number
          user_id,
          reason: `Advance for pre-booking #${booking.booking_id}`,
          amount: numericAdvance,
          type: 'PREBOOK',
        },
      });
    }

    return booking;
  } catch (error) {
    console.error('PreBooking creation failed:', error);
    throw new BadRequestException('Internal Server Error. Check server logs.');
  }
}

async getPreBookedData(lodgeId: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return prisma.booking.findMany({
    where: {
      lodge_id: lodgeId,
      status: "PREBOOKED",
      check_in: {
        gte: today,       
        lt: tomorrow,     
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });
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

import { Injectable, NotFoundException} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CalculateCancelDto } from './dto/calculate.dto';
import { CreateCancelDto } from './dto/create-cancel.dto';
import { PartialCancelDto } from './dto/partial-cancel.dto';

const prisma = new PrismaClient();

@Injectable()
export class CancelService {

   async createCancel(dto: CreateCancelDto) {
    const {
      bookingId,
      lodgeId,
      userId,
      reason,
      amountPaid,
      cancelCharge,
      refund,
    } = dto;

    return await prisma.$transaction(async (tx) => {

      // Check if booking exists
      const booking = await tx.booking.findUnique({
        where: {
          booking_id_lodge_id: { booking_id: bookingId, lodge_id: lodgeId },
        },
      });

      if (!booking) {
        throw new NotFoundException('Booking not found');
      }

      // 1️⃣ Insert into Cancel table
      const cancel = await tx.cancel.create({
        data: {
          booking_id: bookingId,
          lodge_id: lodgeId,
          user_id: userId ?? '',
          reason: reason ?? 'Cancelled by system',
          amount_paid: amountPaid ?? 0,
          cancel_charge: cancelCharge ?? 0,
          refund: refund ?? 0,
        },
      });

      // 2️⃣ Update Booking status
      await tx.booking.update({
        where: { booking_id_lodge_id: { booking_id: bookingId, lodge_id: lodgeId } },
        data: { status: 'CANCEL' },
      });
     if (refund && refund > 0) {
  await tx.expense.create({
    data: {
      lodge_id: lodgeId,
      user_id: userId,
      reason: `Refund for Cancellation #${booking.booking_id}`,
      amount: refund,
      type: "CANCEL",
    },
  });
}

      // 3️⃣ Insert into Expense if refund > 0
      // if (refund && refund > 0) 
      // {
      //   await tx.expense.create({
      //     data: {
      //       lodge_id: lodgeId,
      //       user_id:userId,
      //       type: 'cancel',
      //       reason: `Refund for booking ${bookingId}`,
      //       amount: refund,
      //     },
      //   });
      // }

      return cancel;
    });
  }

  async getPreBookedData(lodgeId: number) {
  return prisma.booking.findMany({
    where: {
      lodge_id: lodgeId,
      status: "PREBOOKED",
    },
    orderBy: {
      created_at: "asc",
    },
  });
}

async calculateCancelCharge(dto: CalculateCancelDto) {
    const { bookingId, baseAmount, checkInDate, lodgeId } = dto;
    const checkIn = new Date(checkInDate);

    // Fetch booking
    const booking = await prisma.booking.findUnique({
      where: { booking_id_lodge_id: { booking_id: bookingId, lodge_id: lodgeId } },
    });

    if (!booking) throw new NotFoundException('Booking not found');

    // Check if peak hour exists
    const peakHour = await prisma.peak_hours.findFirst({
      where: {
        lodge_id: lodgeId,
        date: checkIn,
      },
    });

    // Fetch cancel percentage
    const cancelType = peakHour ? 'PEAK_HOUR' : 'DEFAULT';
    const defaultCancel = await prisma.defaultValue.findFirst({
      where: {
        lodge_id: lodgeId,
        type: cancelType,
        reason: 'CANCEL',
      },
    });

    const cancelPercentage = defaultCancel?.amount ?? 0;
    const cancellationCharge = (baseAmount * cancelPercentage) / 100;
    const refund = baseAmount - cancellationCharge;

    return {
      bookingId,
      baseAmount,
      cancelPercentage,
      cancellationCharge,
      refund,
    };
  }

  // 🔹 1️⃣ Get all cancel records
  async findAll() {
    return prisma.cancel.findMany({
      select: {
        id: true,
        booking_id: true,
        lodge_id: true,
        user_id: true,
        reason: true,
        amount_paid: true,
        cancel_charge: true,
        refund: true,
        created_at: true,
      },
    });
  }

  // 🔹 2️⃣ Get all cancellations for a specific lodge
  async findByLodgeId(lodge_id: number) {
    return prisma.cancel.findMany({
      where: { lodge_id },
      select: {
        id: true,
        booking_id: true,
        lodge_id: true,
        user_id: true,
        reason: true,
        amount_paid: true,
        cancel_charge: true,
        refund: true,
        created_at: true,
      },
    });
  }

  async partialCancel(dto: PartialCancelDto) {
  const {
    bookingId,
    lodgeId,
    userId,
    roomNumbers,
    reason,
    amountPaid,
    cancelCharge,
    refund,
  } = dto;

  return await prisma.$transaction(async (tx) => {

    // 1️⃣ Fetch booking
    const booking = await tx.booking.findUnique({
      where: {
        booking_id_lodge_id: { booking_id: bookingId, lodge_id: lodgeId },
      },
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    // 2️⃣ Remove the cancelled room numbers from existing booking
    const existingRooms = booking.room_number as any[];
    const updatedRooms = existingRooms.filter(
      (room) => !roomNumbers.includes(room)
    );

    // 3️⃣ Update Booking
    const updatedBooking = await tx.booking.update({
      where: { booking_id_lodge_id: { booking_id: bookingId, lodge_id: lodgeId } },
      data: {
        room_number: updatedRooms,
       notes: {
  ...(typeof booking.notes === "object" && booking.notes !== null ? booking.notes : {}),
  partial_cancel: {
    removedRooms: roomNumbers,
    reason,
    cancelledAt: new Date(),
  },
},
      },
    });

    // 4️⃣ Insert into Cancel table
    const cancel = await tx.partialCancel.create({
      data: {
        booking_id: bookingId,
        lodge_id: lodgeId,
        user_id: userId,
        reason: reason ?? "Partially cancelled rooms",
        room_number:roomNumbers,
        amount_paid: amountPaid ?? 0,
        cancel_charge: cancelCharge ?? 0,
        refund: refund ?? 0,
      },
    });

    // 5️⃣ Insert into Expense table for refund
    if (refund && refund > 0) {
      await tx.expense.create({
        data: {
          lodge_id: lodgeId,
          user_id: userId,
          reason: `Refund for partially cancellation #${bookingId}`,
          type: "PARTIAL_CANCEL",
          amount: refund,
        },
      });
    }

    return {
      message: "Partial cancellation successful",
      booking: updatedBooking,
      cancel,
    };
  });
}

  // 🔹 3️⃣ Get one cancellation by booking_id + lodge_id
  // async findOne(id: number, lodge_id: number) {
  //   return prisma.cancel.findUnique({
  //           where: { id  },

  //     // where: { booking_id_lodge_id: { booking_id, lodge_id } },
  //     select: {
  //       id: true,
  //       booking_id: true,
  //       lodge_id: true,
  //       user_id: true,
  //       reason: true,
  //       amount_paid: true,
  //       cancel_charge: true,
  //       refund: true,
  //       created_at: true,
  //     },
  //   });
  // }
}

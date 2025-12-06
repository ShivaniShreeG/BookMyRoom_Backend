import { Injectable } from '@nestjs/common';
import { PrismaClient,Billing } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class BillingService {

async createBillingAndUpdateStatus(
  lodge_id: number,
  user_id: string,
  booking_id: number,
  reason: any,
  total: number | null,
  balancePayment: number | null,
  payment_method: string | null,
) {
  balancePayment = Number(balancePayment) || 0;

  const hasBilling =
    (reason && Object.keys(reason).length > 0) ||
    (total !== null && total !== 0);

  return prisma.$transaction(async (tx) => {
    let billing: Billing | null = null;

    // ⛔ 1. Fetch booking to check checkout time
    const booking = await tx.booking.findUnique({
      where: {
        booking_id_lodge_id: { booking_id, lodge_id },
      },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    // ⏱ 2. Compare now() with existing checkout
    const now = new Date();
    let updatedCheckOut = booking.check_out;
    let oldCheckOut = booking.old_check_out ?? null;

    if (now < booking.check_out) {
      // Billing BEFORE checkout → early checkout
      oldCheckOut = booking.check_out;
      updatedCheckOut = now;
    }

    // 🧾 3. Create billing only if needed
    if (hasBilling) {
      billing = await tx.billing.create({
        data: {
          lodge_id,
          user_id,
          booking_id,
          reason: reason ?? null,
          total: total ?? 0,
          payment_method,
        },
      });
    }

    // 💰 4. Income (positive balance)
    if (balancePayment > 0) {
      await tx.income.create({
        data: {
          lodge_id,
          user_id,
          reason: `Billing for booking ${booking_id}`,
          amount: balancePayment,
          type: "BILLING",
        },
      });
    }

    // 💸 5. Expense (refund)
    if (balancePayment < 0) {
      await tx.expense.create({
        data: {
          lodge_id,
          user_id,
          reason: `Refund for booking ${booking_id}`,
          amount: Math.abs(balancePayment),
          type: "BILLING",
        },
      });
    }

    // 📌 6. Update booking: status, checkout, old checkout
    await tx.booking.update({
      where: {
        booking_id_lodge_id: { booking_id, lodge_id },
      },
      data: {
        status: "BILLED",
        check_out: updatedCheckOut,
        old_check_out: oldCheckOut,
      },
    });

    return {
      success: true,
      message: "Booking and billing completed successfully",
      billing,
      booking_id,
      balancePayment,
      old_check_out: oldCheckOut,
      new_check_out: updatedCheckOut,
    };
  });
}


  async findAll() {
    return prisma.billing.findMany({
      select: {
        id: true,
        booking_id: true,
        lodge_id: true,
        user_id: true,
        reason: true,
        total: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async findByLodgeId(lodge_id: number) {
    return prisma.billing.findMany({
      where: { lodge_id },
      select: {
        id: true,
        booking_id: true,
        lodge_id: true,
        user_id: true,
        reason: true,
        total: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async findOne(booking_id: number, lodge_id: number) {
    return prisma.billing.findUnique({
      where: { booking_id_lodge_id: { booking_id, lodge_id } },
      select: {
        id: true,
        booking_id: true,
        lodge_id: true,
        user_id: true,
        reason: true,
        total: true,
        created_at: true,
        updated_at: true,
      },
    });

  }
  
  async getChargesByBookingId(bookingId: number) {
    try {
      const charges = await prisma.charges.findMany({
        where: { booking_id: bookingId },
        select: {
          reason: true,
          amount: true,
        },
      });
      return charges;
    } catch (error) {
      throw new Error('Failed to fetch charges');
    }
  }

  async getBookedData(lodgeId: number) {

  return prisma.booking.findMany({
    where: {
      lodge_id: lodgeId,
      status: "BOOKED",
    },
    orderBy: {
      created_at: "asc",
    },
  });
}
}

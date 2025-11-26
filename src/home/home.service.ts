import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
function extractRoomNumbersFromBookedRoomEntry(entry: any): string[] {
  if (Array.isArray(entry)) {
    const maybeNums = entry.length >= 3 ? entry[2] : undefined;

    if (Array.isArray(maybeNums)) {
      return maybeNums.map((n: any) => String(n)).filter(Boolean);
    }

    if (typeof maybeNums === "string" || typeof maybeNums === "number") {
      return String(maybeNums)
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);
    }

    return [];
  }

  if (typeof entry === "string" || typeof entry === "number") {
    return String(entry)
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);
  }

  return [];
}
@Injectable()
export class HomeService {
  

 async getRoomCountsForNext7Days(lodgeId: number) {

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // FIX: days was inferred as never[]
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push(d);
    }

    // FIX: use prisma not this.prisma
    const rooms = await prisma.rooms.findMany({
      where: { lodge_id: lodgeId },
      select: {
        room_type: true,
        room_name: true,
        room_number: true,
      },
    });

    // FIX: define proper map type
    interface RoomGroup {
      room_type: string;
      room_name: string;
      all_rooms: string[];
      total: number;
    }

    const groups = new Map<string, RoomGroup>();

    // Grouping logic
    rooms.forEach(r => {
      const key = `${r.room_type}-${r.room_name}`;
      const numbers = Array.isArray(r.room_number)
        ? r.room_number.map(String)
        : [String(r.room_number)];

      if (!groups.has(key)) {
        groups.set(key, {
          room_type: r.room_type,
          room_name: r.room_name,
          all_rooms: numbers,
          total: numbers.length,
        });
      } else {
        const g = groups.get(key)!;
        g.all_rooms.push(...numbers);
        g.total += numbers.length;
      }
    });

    // FIX: use prisma not this.prisma
    const bookings = await prisma.booking.findMany({
      where: {
        lodge_id: lodgeId,
        status: { in: ['BOOKED', 'PREBOOKED', 'BILLED'] },
        check_in: { lt: new Date(today.getTime() + 7 * 86400000) },
        check_out: { gt: today },
      },
      select: {
        room_number: true,
        check_in: true,
        check_out: true,
      },
    });

    const bookedPerDay: Record<string, Set<string>> = {};

    days.forEach(d => {
      bookedPerDay[d.toISOString().slice(0, 10)] = new Set();
    });

    bookings.forEach(b => {
      const bookedRooms = Array.isArray(b.room_number)
        ? b.room_number.map(String)
        : [String(b.room_number)];

      days.forEach(d => {
        const key = d.toISOString().slice(0, 10);
        if (d >= new Date(b.check_in) && d < new Date(b.check_out)) {
          bookedRooms.forEach(r => bookedPerDay[key].add(r));
        }
      });
    });

    const result: any[] = [];

    groups.forEach(g => {
      const dayCounts = days.map(d => {
        const dateKey = d.toISOString().slice(0, 10);
        const bookedToday = bookedPerDay[dateKey];

        const unavailable = g.all_rooms.filter(r => bookedToday.has(r)).length;
        const available = g.total - unavailable;

        return {
          date: dateKey,
          available_count: available,
          unavailable_count: unavailable,
        };
      });

      result.push({
        room_type: g.room_type,
        room_name: g.room_name,
        total_count: g.total,
        days: dayCounts,
      });
    });

    return result;
  }

async getCurrentRoomAvailability(lodgeId: number) {

  // 🔹 Define today range
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);


  // 🔹 Fetch all rooms
  const rooms = await prisma.rooms.findMany({
    where: { lodge_id: lodgeId },
    select: {
      room_name: true,
      room_type: true,
      room_number: true,
    }
  });


  // 🔹 Group rooms by (room_name + room_type)
  interface RoomGroup {
    room_name: string;
    room_type: string;
    total_rooms: string[];
  }

  const groups = new Map<string, RoomGroup>();

  rooms.forEach(r => {
    const key = `${r.room_name}-${r.room_type}`;
    const nums = Array.isArray(r.room_number)
      ? r.room_number.map(String)
      : [String(r.room_number)];

    if (!groups.has(key)) {
      groups.set(key, {
        room_name: r.room_name,
        room_type: r.room_type,
        total_rooms: nums,
      });
    } else {
      groups.get(key)!.total_rooms.push(...nums);
    }
  });



  // 🔹 Fetch bookings overlapping today
  const now = new Date();

const bookings = await prisma.booking.findMany({
  where: {
    lodge_id: lodgeId,
    status: { in: ["BOOKED", "PREBOOKED", "BILLED"] },
    check_in: { lt: endOfToday },   // booking started before end of today
    check_out: { gt: now }          // booking has not yet checked out
  },
  select: { booked_room: true },
});


  // 🔹 Track booked rooms today
  const bookedToday = new Set<string>();

  bookings.forEach(b => {
    if (!Array.isArray(b.booked_room)) return;

    b.booked_room.forEach(entry => {
      const roomNumbers = extractRoomNumbersFromBookedRoomEntry(entry);
      roomNumbers.forEach(n => bookedToday.add(n));
    });
  });



  // 🔹 Prepare final result
  const result: any[] = [];

  groups.forEach(g => {
    const bookedCount = g.total_rooms.filter(n => bookedToday.has(n)).length;

    result.push({
      room_name: g.room_name,
      room_type: g.room_type,
      total: g.total_rooms.length,
      booked: bookedCount,
      available: g.total_rooms.length - bookedCount,
    });
  });

  return result;
}



  async getFinanceSummary(lodgeId: number) {
    // Check if lodge exists
    const lodge = await prisma.lodge.findUnique({ where: { lodge_id: lodgeId } });
    if (!lodge) {
      throw new NotFoundException(`Lodge with ID ${lodgeId} not found`);
    }

    // Total Income
    const totalIncomeResult = await prisma.income.aggregate({
      _sum: { amount: true },
      where: { lodge_id: lodgeId },
    });
    const totalIncome = totalIncomeResult._sum.amount ?? 0;

    // Total Expense
    const totalExpenseResult = await prisma.expense.aggregate({
      _sum: { amount: true },
      where: { lodge_id: lodgeId },
    });
    const totalExpense = totalExpenseResult._sum.amount ?? 0;

    // Total Drawing In
    const totalDrawingInResult = await prisma.drawing.aggregate({
      _sum: { amount: true },
      where: { lodge_id: lodgeId, type: 'in' },
    });
    const totalDrawingIn = totalDrawingInResult._sum.amount ?? 0;

    // Total Drawing Out
    const totalDrawingOutResult = await prisma.drawing.aggregate({
      _sum: { amount: true },
      where: { lodge_id: lodgeId, type: 'out' },
    });
    const totalDrawingOut = totalDrawingOutResult._sum.amount ?? 0;

    // Current Balance
    const currentBalance = totalIncome + totalDrawingIn - totalExpense - totalDrawingOut;

    return {
      totalIncome,
      totalExpense,
      totalDrawingIn,
      totalDrawingOut,
      currentBalance,
    };
  }

}

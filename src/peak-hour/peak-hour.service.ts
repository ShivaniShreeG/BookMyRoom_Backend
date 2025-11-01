import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreatePeakHourDto } from './dto/create-peak-hour.dto';

const prisma = new PrismaClient();

@Injectable()
export class PeakHoursService {
  // 🟢 Get all peaks for a lodge
  async findAllByLodge(lodgeId: number) {
    const peaks = await prisma.peak_hours.findMany({
      where: { lodge_id: lodgeId },
      select: {
        id: true,
        lodge_id: true,
        user_id: true,
        date: true,
        reason: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: { date: 'asc' },
    });

    if (!peaks.length)
      throw new NotFoundException(`No peak hours found for lodge ID ${lodgeId}`);
    return peaks;
  }

  // 🟡 Get a specific peak by lodge and date
  async findByLodgeAndDate(lodgeId: number, dateStr: string) {
    const date = new Date(dateStr);

    const peak = await prisma.peak_hours.findUnique({
      where: {
        lodge_id_date: { lodge_id: lodgeId, date },
      },
      select: {
        id: true,
        lodge_id: true,
        user_id: true,
        date: true,
        reason: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!peak)
      throw new NotFoundException(`No peak hour found for lodge ID ${lodgeId} on ${dateStr}`);
    return peak;
  }

  // 🟢 Create a new peak hour
  async create(dto: CreatePeakHourDto) {
    const { lodge_id, user_id, date, reason, rent } = dto;

    // Verify lodge & user exist
    const lodge = await prisma.lodge.findUnique({ where: { lodge_id } });
    if (!lodge) throw new NotFoundException(`Lodge ${lodge_id} not found`);

    const user = await prisma.user.findUnique({
      where: { user_id_lodge_id: { user_id, lodge_id } },
    });
    if (!user)
      throw new NotFoundException(`User ${user_id} not found in lodge ${lodge_id}`);

    return prisma.peak_hours.create({
      data: {
        lodge_id,
        user_id,
        date: new Date(date),
        reason: reason ?? '',
      },
      select: {
        id: true,
        lodge_id: true,
        user_id: true,
        date: true,
        reason: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  // 🔴 Delete a peak hour
  async delete(lodgeId: number, id: number) {
    const peak = await prisma.peak_hours.findUnique({ where: { id } });

    if (!peak || peak.lodge_id !== lodgeId)
      throw new NotFoundException(`Peak hour ${id} not found for lodge ${lodgeId}`);

    await prisma.peak_hours.delete({ where: { id } });

    return { message: `Peak hour ${id} deleted successfully` };
  }
}

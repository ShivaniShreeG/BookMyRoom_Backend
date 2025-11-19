import { Injectable, BadRequestException, NotFoundException ,InternalServerErrorException} from '@nestjs/common';
import { PrismaClient, BookingStatus } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class HistoryService {

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

}

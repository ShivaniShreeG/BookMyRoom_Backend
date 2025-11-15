import { Controller, Post, Body, UploadedFiles, UseInterceptors, BadRequestException, Req } from '@nestjs/common';
import { BookingService } from './booking.service';
import { FilesInterceptor  } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join, extname } from 'path';
import * as fs from 'fs';
import { CreateBookingDto } from './dto/create-booking.dto';
import type { Request } from 'express';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('create')
@UseInterceptors(FilesInterceptor('id_proofs', 10, { /* storage config */ }))
async createBooking(
  @UploadedFiles() files: Express.Multer.File[],
  @Body() body: any, // <-- use `any` because class-validator won't parse arrays in multipart
  @Req() req: Request
) {
  const lodgeId = Number(body.lodge_id);

  if (!files || files.length === 0) throw new BadRequestException('At least one ID proof required');

  const protocol = req.protocol;
  const host = req.get('host');

  // Parse room_number and specification if they are strings
  let roomNumbers: string[] = [];
  if (typeof body.room_number === 'string') {
    try {
      roomNumbers = JSON.parse(body.room_number);
    } catch (err) {
      throw new BadRequestException('Invalid room_number format');
    }
  } else if (Array.isArray(body.room_number)) {
    roomNumbers = body.room_number;
  }

  let specObj: any = {};
  if (body.specification) {
    if (typeof body.specification === 'string') {
      specObj = JSON.parse(body.specification);
    } else {
      specObj = body.specification;
    }
  }

  const idProofUrls = files.map(
    f => `${protocol}://${host}/lodge_image/${lodgeId}/idproof/${f.filename}`
  );

  // Pass parsed fields to service
  return this.bookingService.createBooking({
    ...body,
    lodge_id: lodgeId,
    room_number: roomNumbers,
    specification: specObj,
    id_proofs: idProofUrls,
  });
}
}


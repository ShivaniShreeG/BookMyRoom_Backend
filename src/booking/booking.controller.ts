import { Controller, Post, Body, UploadedFiles, UseInterceptors, BadRequestException, Req, Param, ParseIntPipe, Get, Put} from '@nestjs/common';
import { BookingService } from './booking.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join, extname } from 'path';
import * as fs from 'fs';
import type { Request } from 'express';
import { CreateBookingDto } from './dto/create-booking.dto';
import { PreBookingDto } from './dto/pre-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('create')
  @UseInterceptors(
    FilesInterceptor('id_proofs', 100, {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const lodgeId = req.body.lodge_id;
          if (!lodgeId) return cb(new BadRequestException('lodge_id is required'), '');
          const uploadPath = join('/var/www/lodge_image', lodgeId.toString(), 'idproof');
          if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueName + extname(file.originalname));
        },
      }),
    }),
  )
  async createBooking(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: CreateBookingDto, // use any to parse JSON strings in multipart
    @Req() req: Request
  ) {
    if (!files || files.length === 0) throw new BadRequestException('At least one ID proof is required');

    const lodgeId = Number(body.lodge_id);
    if (isNaN(lodgeId)) throw new BadRequestException('lodge_id must be a number');

    const protocol = req.protocol;
    const host = req.get('host');

    // Parse room_number safely
    let roomNumbers: string[] = [];
    if (typeof body.room_number === 'string') {
      try {
        roomNumbers = JSON.parse(body.room_number);
      } catch {
        throw new BadRequestException('Invalid room_number format');
      }
    } else if (Array.isArray(body.room_number)) {
      roomNumbers = body.room_number;
    }

    // Parse specification safely
    let specObj: any = {};
    if (body.specification) {
      if (typeof body.specification === 'string') {
        try {
          specObj = JSON.parse(body.specification);
        } catch {
          throw new BadRequestException('Invalid specification format');
        }
      } else {
        specObj = body.specification;
      }
    }

    // Generate URLs for uploaded files
    const idProofUrls = files.map(
      f => `${protocol}://${host}/lodge_image/${lodgeId}/idproof/${f.filename}`
    );

    // Send to BookingService
    const booking = await this.bookingService.createBooking({
      ...body,
      lodge_id: lodgeId,
      room_number: roomNumbers,
      specification: specObj,
      id_proofs: idProofUrls,
    });

    return { message: 'Booking created successfully', booking };
  }

   @Put(':lodgeId/:bookingId')
  @UseInterceptors(
    FilesInterceptor('id_proofs', 100, {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const lodgeId = req.params.lodgeId;
          if (!lodgeId) return cb(new BadRequestException('lodgeId is required'), '');
          const uploadPath = join('/var/www/lodge_image', lodgeId.toString(), 'idproof');
          if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueName + extname(file.originalname));
        },
      }),
    }),
  )
  
  async updateBooking(
    @Param('lodgeId') lodgeId: string,
    @Param('bookingId') bookingId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: UpdateBookingDto,
    @Req() req: Request,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one ID proof is required');
    }

    const protocol = req.protocol;
    const host = req.get('host');

    // Convert uploaded files to URLs
    const idProofUrls = files.map(
      f => `${protocol}://${host}/lodge_image/${lodgeId}/idproof/${f.filename}`,
    );

    const updatedBooking = await this.bookingService.updateBooking(
      Number(lodgeId),
      Number(bookingId),
      body,
      idProofUrls,
    );

    return { message: 'Booking updated successfully', booking: updatedBooking };
  }

     @Post('pre-book')
 async createPreBooking(@Body() body: PreBookingDto) {
  if (!body) {
    throw new BadRequestException('Request body is required');
  }

  if (!body.room_number) {
    throw new BadRequestException('room_number is required');
  }

  // Ensure room_number is array
  let roomNumbers: string[] = [];
  if (typeof body.room_number === 'string') {
    try {
      roomNumbers = JSON.parse(body.room_number);
    } catch {
      throw new BadRequestException('Invalid room_number format');
    }
  } else if (Array.isArray(body.room_number)) {
    roomNumbers = body.room_number;
  } else {
    throw new BadRequestException('room_number must be an array');
  }

  // Parse specification safely
  let specObj: any = {};
  if (body.specification) {
    if (typeof body.specification === 'string') {
      try {
        specObj = JSON.parse(body.specification);
      } catch {
        throw new BadRequestException('Invalid specification format');
      }
    } else {
      specObj = body.specification;
    }
  }

  const booking = await this.bookingService.createPreBooking({
    ...body,
    room_number: roomNumbers,
    specification: specObj,
  });

  return { message: 'PreBooking created successfully', booking };
}


     @Get('latest/:lodgeId/:phone')
async getLatestBooking(
  @Param('lodgeId', ParseIntPipe) lodgeId: number,
  @Param('phone') phone: string,
) {
  return this.bookingService.getLatestBookingByPhone(lodgeId, phone);
}
@Get('prebooked/:lodgeId')
async getPreBooked(
  @Param('lodgeId', ParseIntPipe) lodgeId: number,
) {
  return this.bookingService.getPreBookedData(lodgeId);
}

}

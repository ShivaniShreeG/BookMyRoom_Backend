import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { BookingService } from './booking.service';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  // 🔹 1️⃣ Get all bookings
  @Get()
  findAll() {
    return this.bookingService.findAll();
  }

  // 🔹 2️⃣ Get all bookings for a specific lodge
  @Get('lodge/:lodge_id')
  findByLodgeId(@Param('lodge_id', ParseIntPipe) lodge_id: number) {
    return this.bookingService.findByLodgeId(lodge_id);
  }

  // 🔹 3️⃣ Get one booking by booking_id + lodge_id
  @Get(':booking_id/:lodge_id')
  findOne(
    @Param('booking_id', ParseIntPipe) booking_id: number,
    @Param('lodge_id', ParseIntPipe) lodge_id: number,
  ) {
    return this.bookingService.findOne(booking_id, lodge_id);
  }
}

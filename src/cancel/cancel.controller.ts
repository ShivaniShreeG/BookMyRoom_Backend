import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CancelService } from './cancel.service';

@Controller('cancels')
export class CancelController {
  constructor(private readonly cancelService: CancelService) {}

  // 🔹 1️⃣ Get all cancellations
  @Get()
  findAll() {
    return this.cancelService.findAll();
  }

  // 🔹 2️⃣ Get cancellations for a specific lodge
  @Get('lodge/:lodge_id')
  findByLodgeId(@Param('lodge_id', ParseIntPipe) lodge_id: number) {
    return this.cancelService.findByLodgeId(lodge_id);
  }

  // 🔹 3️⃣ Get one cancellation by booking_id + lodge_id
  @Get(':booking_id/:lodge_id')
  findOne(
    @Param('booking_id', ParseIntPipe) booking_id: number,
    @Param('lodge_id', ParseIntPipe) lodge_id: number,
  ) {
    return this.cancelService.findOne(booking_id, lodge_id);
  }
}

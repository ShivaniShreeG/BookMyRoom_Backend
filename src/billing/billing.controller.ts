import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { BillingService } from './billing.service';

@Controller('billings')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  // 🔹 1️⃣ Get all billings
  @Get()
  findAll() {
    return this.billingService.findAll();
  }

  // 🔹 2️⃣ Get all billings for a specific lodge
  @Get('lodge/:lodge_id')
  findByLodgeId(@Param('lodge_id', ParseIntPipe) lodge_id: number) {
    return this.billingService.findByLodgeId(lodge_id);
  }

  // 🔹 3️⃣ Get one billing by booking_id + lodge_id
  @Get(':booking_id/:lodge_id')
  findOne(
    @Param('booking_id', ParseIntPipe) booking_id: number,
    @Param('lodge_id', ParseIntPipe) lodge_id: number,
  ) {
    return this.billingService.findOne(booking_id, lodge_id);
  }
}

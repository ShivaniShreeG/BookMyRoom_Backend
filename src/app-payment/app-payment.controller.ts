import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { AppPaymentService } from './app-payment.service';

@Controller('app-payments')
export class AppPaymentController {
  constructor(private readonly appPaymentService: AppPaymentService) {}

  // 🔹 1️⃣ Get all app payments
  @Get()
  findAll() {
    return this.appPaymentService.findAll();
  }

  // 🔹 2️⃣ Get all payments by lodge_id
  @Get('lodge/:lodge_id')
  findByLodgeId(@Param('lodge_id', ParseIntPipe) lodge_id: number) {
    return this.appPaymentService.findByLodgeId(lodge_id);
  }

  // 🔹 3️⃣ Get single payment by id + lodge_id
  @Get(':id/:lodge_id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Param('lodge_id', ParseIntPipe) lodge_id: number,
  ) {
    return this.appPaymentService.findOne(id, lodge_id);
  }
}

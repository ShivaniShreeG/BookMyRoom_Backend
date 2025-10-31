import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { IncomeService } from './income.service';

@Controller('incomes')
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  // 🔹 1️⃣ Get all incomes
  @Get()
  findAll() {
    return this.incomeService.findAll();
  }

  // 🔹 2️⃣ Get all incomes for a lodge
  @Get('lodge/:lodge_id')
  findByLodgeId(@Param('lodge_id', ParseIntPipe) lodge_id: number) {
    return this.incomeService.findByLodgeId(lodge_id);
  }

  // 🔹 3️⃣ Get a single income by id + lodge_id
  @Get(':id/:lodge_id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Param('lodge_id', ParseIntPipe) lodge_id: number,
  ) {
    return this.incomeService.findOne(id, lodge_id);
  }
}

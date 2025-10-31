import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ExpenseService } from './expense.service';

@Controller('expenses')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  // 🔹 1️⃣ Get all expenses
  @Get()
  findAll() {
    return this.expenseService.findAll();
  }

  // 🔹 2️⃣ Get all expenses for a lodge
  @Get('lodge/:lodge_id')
  findByLodgeId(@Param('lodge_id', ParseIntPipe) lodge_id: number) {
    return this.expenseService.findByLodgeId(lodge_id);
  }

  // 🔹 3️⃣ Get single expense by id + lodge_id
  @Get(':id/:lodge_id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Param('lodge_id', ParseIntPipe) lodge_id: number,
  ) {
    return this.expenseService.findOne(id, lodge_id);
  }
}

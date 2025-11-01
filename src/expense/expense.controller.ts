import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/create-expense.dto';

@Controller('expenses')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  // GET /expenses/lodge/:lodgeId → all expenses for a lodge
  @Get('lodge/:lodgeId')
  findAllByLodge(@Param('lodgeId', ParseIntPipe) lodgeId: number) {
    return this.expenseService.findAllByLodge(lodgeId);
  }

  // GET /expenses/:lodgeId/:expenseId → specific expense
  @Get(':lodgeId/:expenseId')
  findOne(
    @Param('lodgeId', ParseIntPipe) lodgeId: number,
    @Param('expenseId', ParseIntPipe) expenseId: number,
  ) {
    return this.expenseService.findOne(lodgeId, expenseId);
  }

  // POST /expenses → create new expense
  @Post()
  create(@Body() dto: CreateExpenseDto) {
    return this.expenseService.create(dto);
  }

  // PATCH /expenses/:expenseId → update an expense
  @Patch(':expenseId')
  update(
    @Param('expenseId', ParseIntPipe) expenseId: number,
    @Body() dto: UpdateExpenseDto,
  ) {
    return this.expenseService.update(expenseId, dto);
  }

  // DELETE /expenses/:expenseId → delete an expense
  @Delete(':expenseId')
  remove(@Param('expenseId', ParseIntPipe) expenseId: number) {
    return this.expenseService.remove(expenseId);
  }
}

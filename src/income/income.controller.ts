import { Body, Controller, Delete, Get, Param, Patch, Post, ParseIntPipe } from '@nestjs/common';
import { IncomeService } from './income.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';

@Controller('incomes')
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  // Create income
  @Post()
  create(@Body() dto: CreateIncomeDto) {
    return this.incomeService.create(dto);
  }

  // Get all incomes for a lodge
  @Get('lodge/:lodgeId')
  findAllByLodge(@Param('lodgeId', ParseIntPipe) lodgeId: number) {
    return this.incomeService.findAllByLodge(lodgeId);
  }

  // Get single income record
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.incomeService.findOne(id);
  }

  // Update income
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateIncomeDto) {
    return this.incomeService.update(id, dto);
  }

  // Delete income
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.incomeService.remove(id);
  }
}

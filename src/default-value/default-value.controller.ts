import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { DefaultValueService } from './default-value.service';

@Controller('default-values')
export class DefaultValueController {
  constructor(private readonly defaultValueService: DefaultValueService) {}

  // 🔹 1️⃣ Get all default values
  @Get()
  findAll() {
    return this.defaultValueService.findAll();
  }

  // 🔹 2️⃣ Get all default values for a specific lodge
  @Get('lodge/:lodge_id')
  findByLodgeId(@Param('lodge_id', ParseIntPipe) lodge_id: number) {
    return this.defaultValueService.findByLodgeId(lodge_id);
  }

  // 🔹 3️⃣ Get one default value by ID + lodge_id
  @Get(':id/:lodge_id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Param('lodge_id', ParseIntPipe) lodge_id: number,
  ) {
    return this.defaultValueService.findOne(id, lodge_id);
  }
}

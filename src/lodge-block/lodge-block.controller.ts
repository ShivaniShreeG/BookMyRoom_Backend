import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { LodgeBlockService } from './lodge-block.service';

@Controller('lodge-blocks')
export class LodgeBlockController {
  constructor(private readonly lodgeBlockService: LodgeBlockService) {}

  // 🔹 1️⃣ Get all lodge blocks
  @Get()
  findAll() {
    return this.lodgeBlockService.findAll();
  }

  // 🔹 2️⃣ Get lodge blocks for a specific lodge
  @Get('lodge/:lodge_id')
  findByLodgeId(@Param('lodge_id', ParseIntPipe) lodge_id: number) {
    return this.lodgeBlockService.findByLodgeId(lodge_id);
  }

  // 🔹 3️⃣ Get one lodge block by ID + lodge_id
  @Get(':id/:lodge_id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Param('lodge_id', ParseIntPipe) lodge_id: number,
  ) {
    return this.lodgeBlockService.findOne(id, lodge_id);
  }
}

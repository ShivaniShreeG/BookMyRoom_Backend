import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { PeakHoursService } from './peak-hour.service';

@Controller('peak-hours')
export class PeakHoursController {
  constructor(private readonly peakHoursService: PeakHoursService) {}

  // 🔹 1️⃣ Get all peak hour records
  @Get()
  findAll() {
    return this.peakHoursService.findAll();
  }

  // 🔹 2️⃣ Get all peak hours for a specific lodge
  @Get('lodge/:lodge_id')
  findByLodgeId(@Param('lodge_id', ParseIntPipe) lodge_id: number) {
    return this.peakHoursService.findByLodgeId(lodge_id);
  }

  // 🔹 3️⃣ Get one record by ID + lodge_id
  @Get(':id/:lodge_id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Param('lodge_id', ParseIntPipe) lodge_id: number,
  ) {
    return this.peakHoursService.findOne(id, lodge_id);
  }
}

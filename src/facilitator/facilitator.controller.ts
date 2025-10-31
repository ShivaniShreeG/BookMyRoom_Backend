import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { FacilitatorService } from './facilitator.service';

@Controller('facilitators')
export class FacilitatorController {
  constructor(private readonly facilitatorService: FacilitatorService) {}

  // 🔹 1️⃣ Get all facilitators
  @Get()
  findAll() {
    return this.facilitatorService.findAll();
  }

  // 🔹 2️⃣ Get all facilitators by lodge_id
  @Get('lodge/:lodge_id')
  findByLodgeId(@Param('lodge_id', ParseIntPipe) lodge_id: number) {
    return this.facilitatorService.findByLodgeId(lodge_id);
  }

  // 🔹 3️⃣ Get single facilitator by id + lodge_id
  @Get(':id/:lodge_id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Param('lodge_id', ParseIntPipe) lodge_id: number,
  ) {
    return this.facilitatorService.findOne(id, lodge_id);
  }
}

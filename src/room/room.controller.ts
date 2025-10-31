import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { RoomsService } from './room.service';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  // 🔹 1️⃣ Get all rooms
  @Get()
  findAll() {
    return this.roomsService.findAll();
  }

  // 🔹 2️⃣ Get all rooms for a specific lodge
  @Get('lodge/:lodge_id')
  findByLodgeId(@Param('lodge_id', ParseIntPipe) lodge_id: number) {
    return this.roomsService.findByLodgeId(lodge_id);
  }

  // 🔹 3️⃣ Get one room by ID + lodge_id
  @Get(':id/:lodge_id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Param('lodge_id', ParseIntPipe) lodge_id: number,
  ) {
    return this.roomsService.findOne(id, lodge_id);
  }
}

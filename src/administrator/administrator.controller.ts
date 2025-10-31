import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { AdministratorService } from './administrator.service';

@Controller('administrators')
export class AdministratorController {
  constructor(private readonly administratorService: AdministratorService) {}

  // 🔹 1️⃣ Get all administrators
  @Get()
  findAll() {
    return this.administratorService.findAll();
  }

  // 🔹 2️⃣ Get administrators for a specific lodge
  @Get('lodge/:lodge_id')
  findByLodgeId(@Param('lodge_id', ParseIntPipe) lodge_id: number) {
    return this.administratorService.findByLodgeId(lodge_id);
  }

  // 🔹 3️⃣ Get single administrator by user_id + lodge_id
  @Get(':user_id/:lodge_id')
  findOne(
    @Param('user_id') user_id: string,
    @Param('lodge_id', ParseIntPipe) lodge_id: number,
  ) {
    return this.administratorService.findOne(BigInt(user_id), lodge_id);
  }
}

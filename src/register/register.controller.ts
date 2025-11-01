import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { RegisterService } from './register.service';
import { CreateLodgeOwnerDto } from './dto/create-user.dto';

@Controller('register')
export class RegisterController {
  constructor(private readonly registerService: RegisterService) {}

  @Post('create')
  async createLodgeWithOwner(@Body() dto: CreateLodgeOwnerDto) {
    return this.registerService.createLodgeWithOwner(dto);
  }

  @Get('check-lodge/:lodge_id')
  async checkLodgeExists(@Param('lodge_id') lodge_id: number) {
    const lodge = await this.registerService.findLodgeById(+lodge_id);
    return { exists: !!lodge };
  }
}

import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { LodgeService } from './lodge.service';
import { CreateLodgeDto } from './dto/create-lodge.dto';
import { UpdateLodgeDto } from './dto/update-lodge.dto';

@Controller('lodges')
export class LodgeController {
  constructor(private readonly lodgeService: LodgeService) {}

  // ✅ Get all lodges
  @Get()
  async findAll() {
    return this.lodgeService.findAll();
  }

  // ✅ Get single lodge by ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.lodgeService.findOne(Number(id));
  }

  // ✅ Create new lodge
  @Post()
  async create(@Body() createLodgeDto: CreateLodgeDto) {
    return this.lodgeService.createLodge(createLodgeDto);
  }

  // ✅ Update lodge
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateLodgeDto: UpdateLodgeDto) {
    return this.lodgeService.updateLodge(Number(id), updateLodgeDto);
  }

  // ✅ Block/Unblock lodge
  @Post(':id/block')
  async blockLodge(
    @Param('id') id: string,
    @Query('block') block: string,
    @Body('reason') reason?: string,
  ) {
    const shouldBlock = block === 'true';
    return this.lodgeService.blockLodge(Number(id), shouldBlock, reason);
  }

  // ✅ Delete lodge
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.lodgeService.deleteLodge(Number(id));
  }
}

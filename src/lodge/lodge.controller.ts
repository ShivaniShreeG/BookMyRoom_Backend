import { Controller, Get, Param, ParseIntPipe, Post, Body, Delete, Patch } from '@nestjs/common';
import { LodgeService } from './lodge.service';
import { CreateLodgeDto } from './dto/create-lodge.dto';
import { UpdateLodgeDto } from './dto/update-lodge.dto';
import { BlockLodgeDto } from './dto/block-lodge.dto';

@Controller('lodges')
export class LodgeController {
  constructor(private readonly lodgeService: LodgeService) {}

  @Get()
  findAll() {
    return this.lodgeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.lodgeService.findOne(id);
  }

  @Post()
  create(@Body() createLodgeDto: CreateLodgeDto) {
    return this.lodgeService.createLodge(createLodgeDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLodgeDto: UpdateLodgeDto,
  ) {
    return this.lodgeService.updateLodge(id, updateLodgeDto);
  }

  @Patch(':id/block')
  block(
    @Param('id', ParseIntPipe) id: number,
    @Body() blockLodgeDto: BlockLodgeDto,
  ) {
    const { block, reason } = blockLodgeDto;
    return this.lodgeService.blockLodge(id, block, reason);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.lodgeService.deleteLodge(id);
  }
}

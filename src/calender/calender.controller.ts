import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { CalenderService } from './calender.service';

@Controller('calender')
export class CalenderController {
  constructor(private readonly roomsService: CalenderService) {}

  @Get('summary/:lodgeId')
  async getRoomsSummary(@Param('lodgeId', ParseIntPipe) lodgeId: number) {
    return this.roomsService.getRoomsSummary(lodgeId);
  }

  @Get('room/book/:lodgeId')
  async getRoomBookings(
    @Param('lodgeId', ParseIntPipe) lodgeId: number,
    @Query('roomType') roomType: string,
    @Query('roomName') roomName: string,
  ) {
    return this.roomsService.getBookingsByRoom(lodgeId, roomType, roomName);
  }
}

import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { HomeService } from './home.service';

@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}


  @Get('current-balance/:lodgeId')
  async getFinanceSummary(@Param('lodgeId', ParseIntPipe) lodgeId: number) {
    return this.homeService.getFinanceSummary(lodgeId);
  }
   @Get('availability/7days/:lodgeId')
  async getNext7DaysAvailability(
    @Param('lodgeId', ParseIntPipe) lodgeId: number
  ) {
    return this.homeService.getRoomCountsForNext7Days(lodgeId);
  }
  @Get('availability/:lodgeId')
  async getCurrentRoomAvailability (
    @Param('lodgeId', ParseIntPipe) lodgeId: number
  ) {
    return this.homeService.getCurrentRoomAvailability(lodgeId);
  }
}

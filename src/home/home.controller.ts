import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { HomeService } from './home.service';

@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}


  @Get('current-balance/:lodgeId')
  async getFinanceSummary(@Param('lodgeId', ParseIntPipe) lodgeId: number) {
    return this.homeService.getFinanceSummary(lodgeId);
  }
}

import { Controller, Post, Body, UploadedFiles, UseInterceptors, BadRequestException, Req, Param, ParseIntPipe, Get, Put} from '@nestjs/common';
import { HistoryService } from './history.service';
import { FilesInterceptor } from '@nestjs/platform-express';


@Controller('history')
export class HistoryController {
  constructor(private readonly  historyService: HistoryService) {}

@Get('prebooked/:lodgeId')
async getPreBooked(
  @Param('lodgeId', ParseIntPipe) lodgeId: number,
) {
  return this.historyService.getPreBookedData(lodgeId);
}

}

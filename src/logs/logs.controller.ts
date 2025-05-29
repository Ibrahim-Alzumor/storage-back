import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { LogsService } from './logs.service';

@Controller('logs')
@UseGuards(AuthGuard)
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get('my')
  async getMyLogs(@Req() req) {
    return this.logsService.getLogsByUser(req.user.email);
  }

  @Get('stats')
  async getStats(
    @Query('start') start: string,
    @Query('end') end: string,
    @Query('email') email?: string,
  ) {
    return this.logsService.getOrderStats({
      startDate: new Date(start),
      endDate: new Date(end),
      email,
    });
  }
}

import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UnitsService } from './units.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Get()
  findAll() {
    return this.unitsService.findAll();
  }

  @Post()
  create(@Body() dto: CreateUnitDto, @Req() req) {
    return this.unitsService.create(dto, req.user.email);
  }
}

import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
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

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.unitsService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateUnitDto, @Req() req) {
    return this.unitsService.create(dto, req.user.email);
  }
}

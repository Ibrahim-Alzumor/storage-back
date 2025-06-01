import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UnitsService } from './units.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { AuthGuard } from '../auth/auth.guard';
import { UpdateUnitDto } from './dto/update-unit.dto';

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

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUnitDto, @Req() req) {
    return this.unitsService.update(id, dto, req.user.email);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.unitsService.remove(id, req.user.email);
  }
}

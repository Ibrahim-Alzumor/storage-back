import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { ClearanceLevelService } from './clearance-level.service';
import { CreateClearanceLevelDto } from './dto/create-clearance-level.dto';
import { UpdateClearanceLevelDto } from './dto/update-clearance-level.dto';
import { CreateFunctionPermissionDto } from './dto/create-function-permission.dto';
import { ClearanceLevelDocument } from './schemas/clearance-level.schema';
import { FunctionPermissionDocument } from './schemas/function-permission.schema';

@Controller('clearance-levels')
export class ClearanceLevelController {
  constructor(private readonly clearanceLevelService: ClearanceLevelService) {}

  @Get()
  async getClearanceLevels(): Promise<ClearanceLevelDocument[]> {
    return this.clearanceLevelService.getClearanceLevels();
  }

  @Get('functions')
  async getFunctions(): Promise<FunctionPermissionDocument[]> {
    return this.clearanceLevelService.getFunctions();
  }

  @Get(':level')
  async getClearanceLevel(
    @Param('level') level: number,
  ): Promise<ClearanceLevelDocument> {
    return this.clearanceLevelService.getClearanceLevel(level);
  }

  @Post()
  async createClearanceLevel(
    @Body() createClearanceLevelDto: CreateClearanceLevelDto,
    @Req() req,
  ): Promise<ClearanceLevelDocument> {
    const userEmail = req.user?.email || 'system@example.com';
    return this.clearanceLevelService.createClearanceLevel(
      createClearanceLevelDto,
      userEmail,
    );
  }

  @Put(':level')
  async updateClearanceLevel(
    @Param('level') level: number,
    @Body() updateClearanceLevelDto: UpdateClearanceLevelDto,
    @Req() req,
  ): Promise<ClearanceLevelDocument> {
    const userEmail = req.user?.email || 'system@example.com';
    return this.clearanceLevelService.updateClearanceLevel(
      level,
      updateClearanceLevelDto,
      userEmail,
    );
  }

  @Delete(':level')
  async deleteClearanceLevel(
    @Param('level') level: number,
    @Req() req,
  ): Promise<void> {
    const userEmail = req.user?.email || 'system@example.com';
    return this.clearanceLevelService.deleteClearanceLevel(level, userEmail);
  }

  @Post('functions')
  async createFunction(
    @Body() createFunctionDto: CreateFunctionPermissionDto,
    @Req() req,
  ): Promise<FunctionPermissionDocument> {
    const userEmail = req.user?.email || 'system@example.com';
    return this.clearanceLevelService.createFunction(
      createFunctionDto,
      userEmail,
    );
  }

  @Post('functions/batch')
  async createFunctionsIfNotExist(
    @Body() createFunctionDtos: CreateFunctionPermissionDto[],
    @Req() req,
  ): Promise<FunctionPermissionDocument[]> {
    const userEmail = req.user?.email || 'system@example.com';
    return this.clearanceLevelService.createFunctionsIfNotExist(
      createFunctionDtos,
      userEmail,
    );
  }

  @Post(':level/functions/:functionId')
  async addFunctionToClearanceLevel(
    @Param('level') level: number,
    @Param('functionId') functionId: string,
    @Req() req,
  ): Promise<ClearanceLevelDocument> {
    const userEmail = req.user?.email || 'system@example.com';
    return this.clearanceLevelService.addFunctionToClearanceLevel(
      level,
      functionId,
      userEmail,
    );
  }

  @Delete(':level/functions/:functionId')
  async removeFunctionFromClearanceLevel(
    @Param('level') level: number,
    @Param('functionId') functionId: string,
    @Req() req,
  ): Promise<ClearanceLevelDocument> {
    const userEmail = req.user?.email || 'system@example.com';
    return this.clearanceLevelService.removeFunctionFromClearanceLevel(
      level,
      functionId,
      userEmail,
    );
  }
}

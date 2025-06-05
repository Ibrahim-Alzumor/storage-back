import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ClearanceLevel,
  ClearanceLevelDocument,
} from './schemas/clearance-level.schema';
import {
  FunctionPermission,
  FunctionPermissionDocument,
} from './schemas/function-permission.schema';
import { CreateClearanceLevelDto } from './dto/create-clearance-level.dto';
import { UpdateClearanceLevelDto } from './dto/update-clearance-level.dto';
import { CreateFunctionPermissionDto } from './dto/create-function-permission.dto';
import { LogsService } from '../logs/logs.service';

@Injectable()
export class ClearanceLevelService {
  constructor(
    @InjectModel(ClearanceLevel.name)
    private readonly clearanceLevelModel: Model<ClearanceLevelDocument>,
    @InjectModel(FunctionPermission.name)
    private readonly functionPermissionModel: Model<FunctionPermissionDocument>,
    private readonly logsService: LogsService,
  ) {}

  async getClearanceLevels(): Promise<ClearanceLevelDocument[]> {
    return this.clearanceLevelModel.find().exec();
  }

  async getClearanceLevel(level: number): Promise<ClearanceLevelDocument> {
    const clearanceLevel = await this.clearanceLevelModel
      .findOne({ level })
      .exec();
    if (!clearanceLevel) {
      throw new NotFoundException(`Clearance level ${level} not found`);
    }
    return clearanceLevel;
  }

  async createClearanceLevel(
    createClearanceLevelDto: CreateClearanceLevelDto,
    userEmail: string,
  ): Promise<ClearanceLevelDocument> {
    const created = new this.clearanceLevelModel(createClearanceLevelDto);

    await this.logsService.logAction({
      userEmail,
      action: `Created clearance level ${created.name}`,
      resourceType: 'clearance-level',
      resourceId: created.level.toString(),
      payload: JSON.stringify(createClearanceLevelDto),
    });

    return created.save();
  }

  async updateClearanceLevel(
    level: number,
    updateClearanceLevelDto: UpdateClearanceLevelDto,
    userEmail: string,
  ): Promise<ClearanceLevelDocument> {
    const updated = await this.clearanceLevelModel
      .findOneAndUpdate({ level }, updateClearanceLevelDto, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(`Clearance level ${level} not found`);
    }

    await this.logsService.logAction({
      userEmail,
      action: `Updated clearance level ${updated.name}`,
      resourceType: 'clearance-level',
      resourceId: level.toString(),
      payload: JSON.stringify(updateClearanceLevelDto),
    });

    return updated;
  }

  async deleteClearanceLevel(level: number, userEmail: string): Promise<void> {
    const clearanceLevel = await this.getClearanceLevel(level);
    const result = await this.clearanceLevelModel.deleteOne({ level }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException(`Clearance level ${level} not found`);
    }

    await this.logsService.logAction({
      userEmail,
      action: `Deleted clearance level ${clearanceLevel.name}`,
      resourceType: 'clearance-level',
      resourceId: level.toString(),
    });
  }

  async getFunctions(): Promise<FunctionPermissionDocument[]> {
    return this.functionPermissionModel.find().exec();
  }

  async createFunction(
    createFunctionDto: CreateFunctionPermissionDto,
    userEmail: string,
  ): Promise<FunctionPermissionDocument> {
    const created = new this.functionPermissionModel(createFunctionDto);

    await this.logsService.logAction({
      userEmail,
      action: `Created function permission ${created.name}`,
      resourceType: 'function-permission',
      resourceId: created.id,
      payload: JSON.stringify(createFunctionDto),
    });

    return created.save();
  }

  async createFunctionsIfNotExist(
    functions: CreateFunctionPermissionDto[],
    userEmail: string,
  ): Promise<FunctionPermissionDocument[]> {
    try {
      const existingFunctions = await this.getFunctions();
      const existingIds = existingFunctions.map((f) => f.id);
      const newFunctions = functions.filter((f) => !existingIds.includes(f.id));

      if (newFunctions.length === 0) {
        return [];
      }

      return await Promise.all(
        newFunctions.map((f) => this.createFunction(f, userEmail)),
      );
    } catch (error) {
      Logger.error(
        `Error creating functions: ${error.message}`,
        error.stack,
        'ClearanceLevelService',
      );
      return [];
    }
  }

  async hasPermission(
    userClearanceLevel: number,
    functionId: string,
  ): Promise<boolean> {
    const clearanceLevel = await this.getClearanceLevel(userClearanceLevel);
    return clearanceLevel
      ? clearanceLevel.allowedFunctions.includes(functionId)
      : false;
  }

  async addFunctionToClearanceLevel(
    level: number,
    functionId: string,
    userEmail: string,
  ): Promise<ClearanceLevelDocument> {
    const clearanceLevel = await this.getClearanceLevel(level);

    if (!clearanceLevel.allowedFunctions.includes(functionId)) {
      clearanceLevel.allowedFunctions.push(functionId);
      await clearanceLevel.save();

      await this.logsService.logAction({
        userEmail,
        action: `Added function ${functionId} to clearance level ${clearanceLevel.name}`,
        resourceType: 'clearance-level',
        resourceId: level.toString(),
        payload: JSON.stringify({ functionId }),
      });
    }

    return clearanceLevel;
  }

  async removeFunctionFromClearanceLevel(
    level: number,
    functionId: string,
    userEmail: string,
  ): Promise<ClearanceLevelDocument> {
    const clearanceLevel = await this.getClearanceLevel(level);

    const index = clearanceLevel.allowedFunctions.indexOf(functionId);
    if (index !== -1) {
      clearanceLevel.allowedFunctions.splice(index, 1);
      await clearanceLevel.save();

      await this.logsService.logAction({
        userEmail,
        action: `Removed function ${functionId} from clearance level ${clearanceLevel.name}`,
        resourceType: 'clearance-level',
        resourceId: level.toString(),
        payload: JSON.stringify({ functionId }),
      });
    }

    return clearanceLevel;
  }
}

import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUnitDto } from './dto/create-unit.dto';
import { LogsService } from '../logs/logs.service';
import { UnitDocument } from './schema/unit.schema';

export interface UnitResponse {
  id: string;
  name: string;
}

@Injectable()
export class UnitsService {
  constructor(
    @InjectModel('Unit') private readonly unitModel: Model<UnitDocument>,
    private readonly logsService: LogsService,
  ) {}

  async findAll(): Promise<UnitResponse[]> {
    const units = await this.unitModel.find().exec();
    return units.map((unit) => ({
      id: unit._id.toString(),
      name: unit.name,
    }));
  }

  async findById(id: string): Promise<UnitResponse | null> {
    const unit = await this.unitModel.findById(id).exec();
    if (!unit) return null;

    return {
      id: unit._id.toString(),
      name: unit.name,
    };
  }

  async create(dto: CreateUnitDto, userEmail: string): Promise<UnitResponse> {
    try {
      const existing = await this.unitModel.findOne({ name: dto.name }).exec();
      if (existing) {
        throw new ConflictException(`Unit ${dto.name} already exists`);
      }

      const created = new this.unitModel(dto);
      await created.save();

      await this.logsService.logAction({
        userEmail,
        action: `Added unit ${created.name}`,
        resourceType: 'unit',
        resourceId: created._id.toString(),
        payload: JSON.stringify(dto),
      });

      return {
        id: created._id.toString(),
        name: created.name,
      };
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException(`Unit ${dto.name} already exists`);
      }
      throw error;
    }
  }
}

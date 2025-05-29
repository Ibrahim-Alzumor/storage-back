import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUnitDto } from './dto/create-unit.dto';
import { LogsService } from '../logs/logs.service';
import { Unit } from './schema/unit.schema';

@Injectable()
export class UnitsService {
  constructor(
    @InjectModel('Unit') private readonly unitModel: Model<Unit>,
    private readonly logsService: LogsService,
  ) {}

  async findAll(): Promise<string[]> {
    const units = await this.unitModel.find().exec();
    return units.map((unit) => unit.name);
  }

  async create(dto: CreateUnitDto, userEmail: string): Promise<string> {
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
        resourceId: created.name,
        payload: JSON.stringify(dto),
      });

      return created.name;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException(`Unit ${dto.name} already exists`);
      }
      throw error;
    }
  }
}

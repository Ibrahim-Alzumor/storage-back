import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCategoryDto } from './dto/create-category.dto';
import { LogsService } from '../logs/logs.service';
import { Category } from './schema/category.schema';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel('Category') private readonly categoryModel: Model<Category>,
    private readonly logsService: LogsService,
  ) {}

  async findAll(): Promise<string[]> {
    const categories = await this.categoryModel.find().exec();
    return categories.map((category) => category.name);
  }

  async create(dto: CreateCategoryDto, userEmail: string): Promise<string> {
    try {
      const existing = await this.categoryModel
        .findOne({ name: dto.name })
        .exec();
      if (existing) {
        throw new ConflictException(`Category ${dto.name} already exists`);
      }

      const created = new this.categoryModel(dto);
      await created.save();

      await this.logsService.logAction({
        userEmail,
        action: `Added category ${created.name}`,
        resourceType: 'category',
        resourceId: created.name,
        payload: JSON.stringify(dto),
      });

      return created.name;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException(`Category ${dto.name} already exists`);
      }
      throw error;
    }
  }
}

import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCategoryDto } from './dto/create-category.dto';
import { LogsService } from '../logs/logs.service';
import { CategoryDocument } from './schema/category.schema';

export interface CategoryResponse {
  id: string;
  name: string;
}

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel('Category')
    private readonly categoryModel: Model<CategoryDocument>,
    private readonly logsService: LogsService,
  ) {}

  async findAll(): Promise<CategoryResponse[]> {
    const categories = await this.categoryModel.find().exec();
    return categories.map((category) => ({
      id: category._id.toString(),
      name: category.name,
    }));
  }

  async findById(id: string): Promise<CategoryResponse | null> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) return null;

    return {
      id: category._id.toString(),
      name: category.name,
    };
  }

  async create(
    dto: CreateCategoryDto,
    userEmail: string,
  ): Promise<CategoryResponse> {
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
        resourceId: created._id.toString(),
        payload: JSON.stringify(dto),
      });

      return {
        id: created._id.toString(),
        name: created.name,
      };
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException(`Category ${dto.name} already exists`);
      }
      throw error;
    }
  }
}

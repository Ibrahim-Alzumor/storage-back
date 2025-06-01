import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCategoryDto } from './dto/create-category.dto';
import { LogsService } from '../logs/logs.service';
import { CategoryDocument } from './schema/category.schema';
import { UpdateCategoryDto } from './dto/update-category.dto';

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

  async update(
    id: string,
    dto: UpdateCategoryDto,
    userEmail: string,
  ): Promise<CategoryResponse> {
    try {
      const category = await this.categoryModel.findById(id).exec();
      if (!category) {
        throw new NotFoundException(`Category with ID ${id} not found`);
      }

      if (dto.name && dto.name !== category.name) {
        const existing = await this.categoryModel
          .findOne({ name: dto.name })
          .exec();
        if (existing) {
          throw new ConflictException(`Category ${dto.name} already exists`);
        }
      }

      const updatedCategory = await this.categoryModel
        .findByIdAndUpdate(id, dto, { new: true })
        .exec();

      if (!updatedCategory) {
        throw new NotFoundException(`Category with ID ${id} not found`);
      }

      await this.logsService.logAction({
        userEmail,
        action: `Updated category from ${category.name} to ${updatedCategory.name}`,
        resourceType: 'category',
        resourceId: id,
        payload: JSON.stringify(dto),
      });

      return {
        id: updatedCategory._id.toString(),
        name: updatedCategory.name,
      };
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException(`Category name already exists`);
      }
      throw error;
    }
  }

  async remove(id: string, userEmail: string): Promise<void> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    await this.categoryModel.findByIdAndDelete(id).exec();

    await this.logsService.logAction({
      userEmail,
      action: `Deleted category ${category.name}`,
      resourceType: 'category',
      resourceId: id,
      payload: JSON.stringify({ id }),
    });
  }
}

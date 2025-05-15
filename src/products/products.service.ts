import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel('Product') private readonly productModel: Model<Product>,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const created = new this.productModel(dto);
    return await created.save();
  }

  async findAll(): Promise<Product[]> {
    return this.productModel.find().exec();
  }

  async findOne(id: number): Promise<Product> {
    const prod = await this.productModel.findOne({ id }).exec();
    if (!prod) throw new NotFoundException(`No Product with id ${id}`);
    return prod;
  }

  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    const updated = await this.productModel
      .findOneAndUpdate({ id }, dto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException(`No Product with id ${id}`);
    return updated;
  }

  async remove(id: number): Promise<void> {
    const res = await this.productModel.deleteOne({ id }).exec();
    if (res.deletedCount === 0)
      throw new NotFoundException(`No Product with id ${id}`);
  }
}

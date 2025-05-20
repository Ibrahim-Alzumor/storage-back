import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    created.id = Date.now();
    created.isEmpty = false;
    return await created.save();
  }

  async findAll(): Promise<Product[]> {
    return this.productModel.find({ isEmpty: false }).exec();
  }

  async findOne(id: number): Promise<Product> {
    const prod = await this.productModel.findOne({ id }).exec();
    if (!prod) throw new NotFoundException(`No Product with id ${id}`);
    return prod;
  }

  async findByName(name: string): Promise<Product[]> {
    return this.productModel
      .find({
        name: { $regex: name, $options: 'i' },
      })
      .exec();
  }

  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    dto.isEmpty = false;
    const updated = await this.productModel
      .findOneAndUpdate({ id }, dto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException(`No Product with id ${id}`);
    return updated;
  }

  async remove(id: number): Promise<void> {
    const res = await this.productModel
      .updateOne({ id }, { $set: { isEmpty: true, stock: 0 } })
      .exec();
    if (res.matchedCount === 0)
      throw new NotFoundException(`No Product with id ${id}`);
  }

  async addStock(id: number, amount: number): Promise<void> {
    const res = await this.productModel
      .updateOne({ id }, { $inc: { stock: amount } })
      .exec();

    if (res.matchedCount === 0)
      throw new NotFoundException(`No Product with id ${id}`);
  }

  async removeStock(id: number, amount: number): Promise<void> {
    const product = await this.productModel.findOne({ id }).exec();
    if (!product) throw new NotFoundException(`No Product with id ${id}`);
    if (product.stock - amount < 0) {
      throw new BadRequestException(`Cannot reduce the stock below Zero`);
    }
    await this.productModel
      .updateOne({ id }, { $inc: { stock: -amount } })
      .exec();
  }
}

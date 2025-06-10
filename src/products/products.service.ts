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
import { LogsService } from '../logs/logs.service';
import {
  PaginationOptions,
  PaginationResult,
} from '../interface/pagination-result.interface';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel('Product') private readonly productModel: Model<Product>,
    private readonly logsService: LogsService,
  ) {}

  async create(dto: CreateProductDto, userEmail: string): Promise<Product> {
    const productData = {
      ...dto,
      id: Date.now(),
      barcode: this.generateRandomString(100),
    };

    const created = new this.productModel(productData);

    await this.logsService.logAction({
      userEmail,
      action: `Added product ${created.name}`,
      resourceType: 'product',
      resourceId: created.id.toString(),
      payload: JSON.stringify(dto),
    });

    return await created.save();
  }

  async findAll(opts: PaginationOptions): Promise<PaginationResult<Product>> {
    const { page, limit } = opts;
    const skip = (page - 1) * limit;

    const total = await this.productModel.countDocuments().exec();

    const items = await this.productModel.find().skip(skip).limit(limit).exec();

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<Product> {
    const prod = await this.productModel.findOne({ id }).exec();
    if (!prod) throw new NotFoundException(`No Product with id ${id}`);
    return prod;
  }

  async findByName(
    name: string,
    opts: PaginationOptions,
  ): Promise<PaginationResult<Product>> {
    const { page, limit } = opts;
    const skip = (page - 1) * limit;

    const filter = { name: { $regex: name, $options: 'i' } };

    const total = await this.productModel.countDocuments(filter).exec();

    const items = await this.productModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .exec();

    return { items, total, page, limit };
  }

  async update(
    id: number,
    dto: UpdateProductDto,
    userEmail: string,
  ): Promise<Product> {
    const updateData = {
      ...dto,
    };

    const updated = await this.productModel
      .findOneAndUpdate({ id }, updateData, { new: true })
      .exec();
    if (!updated) throw new NotFoundException(`No Product with id ${id}`);

    await this.logsService.logAction({
      userEmail,
      action: `Updated product ${updated.name}`,
      resourceType: 'product',
      resourceId: id.toString(),
      payload: JSON.stringify(dto),
    });
    return updated;
  }

  async remove(id: number, userEmail: string): Promise<void> {
    const product = await this.findOne(id);
    const res = await this.productModel.deleteOne({ id }).exec();
    if (res.deletedCount === 0)
      throw new NotFoundException(`No Product with id ${id}`);
    await this.logsService.logAction({
      userEmail,
      action: `Removed product ${product.name}`,
      resourceType: 'product',
      resourceId: product.id.toString(),
    });
  }

  async addStock(
    id: number,
    amount: number,
    userEmail: string,
  ): Promise<Product> {
    const product = await this.productModel
      .findOneAndUpdate({ id }, { $inc: { stock: amount } }, { new: true })
      .exec();

    if (!product) {
      throw new NotFoundException(`No Product with id ${id}`);
    }

    await this.logsService.logAction({
      userEmail,
      action: `Added to product ${product.name}`,
      resourceType: 'product',
      resourceId: product.id.toString(),
      payload: JSON.stringify({ added: amount }),
    });

    return product;
  }

  async removeStock(
    id: number,
    amount: number,
    userEmail: string,
  ): Promise<void> {
    const product = await this.productModel.findOne({ id }).exec();
    if (!product) throw new NotFoundException(`No Product with id ${id}`);
    if (product.stock - amount < 0) {
      throw new BadRequestException(`Cannot reduce the stock below Zero`);
    }

    await this.productModel
      .updateOne({ id }, { $inc: { stock: -amount } })
      .exec();

    await this.logsService.logAction({
      userEmail,
      action: `Removed from product ${product.name}`,
      resourceType: 'product',
      resourceId: product.id.toString(),
      payload: JSON.stringify({ removed: amount }),
    });
  }

  async findByBarcode(barcode: string): Promise<Product | null> {
    return this.productModel.findOne({ barcode }).exec();
  }

  async assignBarcode(id: number, barcodeId: string): Promise<void> {
    const existing = await this.productModel.findOne({ barcodeId }).exec();
    if (existing) {
      throw new BadRequestException(
        `Barcode ${barcodeId} is already assigned to another product`,
      );
    }
    await this.productModel
      .updateOne({ id }, { $set: { barcode: barcodeId } })
      .exec();
  }

  async findAllValidBarcodes(
    opts: PaginationOptions,
  ): Promise<PaginationResult<Product>> {
    const { page, limit } = opts;
    const skip = (page - 1) * limit;

    const filter = {
      $expr: { $gt: [{ $strLenCP: '$barcode' }, 80] },
    };

    const total = await this.productModel.countDocuments(filter).exec();
    const items = await this.productModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .exec();

    return { items, total, page, limit };
  }

  private generateRandomString(length: number): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  }
}

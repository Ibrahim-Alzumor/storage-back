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
      isEmpty: false,
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

  async update(
    id: number,
    dto: UpdateProductDto,
    userEmail: string,
  ): Promise<Product> {
    const updateData = {
      ...dto,
      isEmpty: false,
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
    const res = await this.productModel
      .updateOne({ id }, { $set: { isEmpty: true, stock: 0 } })
      .exec();
    if (res.matchedCount === 0)
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
    if (product.stock - amount === 0) {
      await this.productModel
        .updateOne({ id }, { $set: { isEmpty: true } })
        .exec();
      await this.productModel
        .updateOne({ id }, { $inc: { stock: -amount } })
        .exec();
    } else {
      await this.productModel
        .updateOne({ id }, { $inc: { stock: -amount } })
        .exec();
    }

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

  async findAllValidBarcodes(): Promise<Product[]> {
    const products = await this.productModel.find().exec();

    return products.filter(
      (product) => product.barcode && product.barcode.length > 80,
    );
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

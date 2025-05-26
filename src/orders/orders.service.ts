import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { Model } from 'mongoose';
import { CreateOrderDto } from './dto/create-order.dto';
import { ProductsService } from '../products/products.service';
import { LogsService } from '../logs/logs.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    private readonly productsService: ProductsService,
    private readonly logsService: LogsService,
  ) {}

  async createOrder(dto: CreateOrderDto, userEmail: string): Promise<Order> {
    const timestamp = new Date();

    for (const item of dto.items) {
      const product = await this.productsService.findOne(item.productId);
      if (!product) {
        throw new NotFoundException(`No Product with id ${item.productId}`);
      }
      if (product.stock < item.quantity) {
        throw new NotFoundException(
          `Not enough stock for Product with id ${item.productId}`,
        );
      }
      await this.productsService.removeStock(
        item.productId,
        item.quantity,
        userEmail,
      );
    }

    const order = new this.orderModel({
      userEmail,
      timestamp,
      items: dto.items,
    });
    const savedOrder = await order.save();
    await this.logsService.logAction({
      resourceId: '',
      userEmail,
      action: `Placed order with ${dto.items.length} items`,
      resourceType: 'order',
      payload: JSON.stringify({
        items: dto.items,
        timestamp,
      }),
    });

    return savedOrder;
  }

  async findAll(): Promise<Order[]> {
    return this.orderModel.find().sort({ timestamp: -1 }).exec();
  }

  findByUserEmail(userEmail: string): Promise<Order[]> {
    return this.orderModel.find({ userEmail }).exec();
  }
}

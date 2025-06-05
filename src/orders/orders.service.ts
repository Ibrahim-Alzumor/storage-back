import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { Model } from 'mongoose';
import { CreateOrderDto } from './dto/create-order.dto';
import { ProductsService } from '../products/products.service';
import { LogsService } from '../logs/logs.service';
import { UsersService } from '../users/users.service';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    private readonly productsService: ProductsService,
    private readonly logsService: LogsService,
    private readonly usersService: UsersService,
  ) {}

  async createOrder(dto: CreateOrderDto, userEmail: string): Promise<Order> {
    const timestamp = new Date();
    const user = await this.usersService.findByEmail(userEmail);

    if (!user) {
      throw new NotFoundException(`User with email ${userEmail} not found`);
    }

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
      resourceId: savedOrder.id.toString(),
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
    return this.orderModel.find().sort({ date: -1 }).exec();
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderModel.findOne({ id }).exec();
    if (!order) throw new NotFoundException(`No Order with id ${id}`);
    return order;
  }

  findByUserEmail(userEmail: string): Promise<Order[]> {
    return this.orderModel.find({ userEmail }).exec();
  }

  async searchOrders(searchTerm: string): Promise<Order[]> {
    const regex = new RegExp(searchTerm, 'i');
    return this.orderModel
      .find({
        userEmail: regex,
      })
      .sort({ timestamp: -1 })
      .exec();
  }

  async updateOrder(
    orderId: number,
    updateOrderDto: UpdateOrderDto,
  ): Promise<Order> {
    const order = await this.orderModel.findOne({ id: orderId }).exec();

    if (!order) {
      throw new NotFoundException(`Order with id ${orderId} not found`);
    }

    if (updateOrderDto.items) {
      for (const item of updateOrderDto.items) {
        if (item.productId) {
          const product = await this.productsService.findOne(item.productId);
          if (!product) {
            throw new NotFoundException(`No Product with id ${item.productId}`);
          }
        }
      }
    }

    Object.assign(order, updateOrderDto);
    return order.save();
  }

  async getFilteredOrders(
    start?: string,
    end?: string,
    email?: string,
  ): Promise<Order[]> {
    const query: any = {};

    if (start || end) {
      query.timestamp = {};
      if (start) {
        query.timestamp.$gte = new Date(start);
      }
      if (end) {
        query.timestamp.$lte = new Date(end);
      }
    }

    if (email) {
      query.userEmail = email;
    }

    return this.orderModel.find(query).sort({ timestamp: -1 }).exec();
  }
}

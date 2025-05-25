import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
@UseGuards(AuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Req() req, @Body() dto: CreateOrderDto) {
    console.log('decoded User:', req.user);
    const userEmail = req.user.email;
    return this.ordersService.createOrder(dto, userEmail);
  }

  @Get()
  async findAll() {
    return this.ordersService.findAll();
  }

  @Get('my')
  async findMine(@Req() req) {
    return this.ordersService.findByUserEmail(req.user.email);
  }
}

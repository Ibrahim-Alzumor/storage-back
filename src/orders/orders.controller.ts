import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('orders')
@UseGuards(AuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Req() req, @Body() dto: CreateOrderDto) {
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

  @Get('by-email')
  async findByEmail(@Query('email') email: string) {
    return this.ordersService.findByUserEmail(email);
  }

  @Get('search')
  async search(@Query('name') searchTerm: string) {
    return this.ordersService.searchOrders(searchTerm);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.updateOrder(id, updateOrderDto);
  }

  @Get('filtered')
  async getFilteredOrders(
    @Query('start') start: string,
    @Query('end') end: string,
    @Query('email') email: string,
  ) {
    return this.ordersService.getFilteredOrders(start, end, email);
  }
}

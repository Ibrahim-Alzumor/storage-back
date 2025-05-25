import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';
import { AuthGuard } from '../auth/auth.guard';
import { Product } from './schemas/product.schema';

@UseGuards(AuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() dto: CreateProductDto, @Req() req) {
    return this.productsService.create(dto, req.user.email);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get('search')
  async findByName(@Query('name') name: string) {
    return this.productsService.findByName(name);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
    @Req() req,
  ) {
    return this.productsService.update(id, dto, req.user.email);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.productsService.remove(id, req.user.email);
  }

  @Patch(':id/add-stock')
  async addStock(
    @Param('id', ParseIntPipe) id: number,
    @Body('amount', ParseIntPipe) amount: number,
    @Req() req,
  ): Promise<Product> {
    return await this.productsService.addStock(id, amount, req.user.email);
  }

  @Patch(':id/remove-stock')
  removeStock(
    @Param('id', ParseIntPipe) id: number,
    @Body('amount', ParseIntPipe) amount: number,
    @Req() req,
  ) {
    return this.productsService.removeStock(id, amount, req.user.email);
  }

  @Get('by-barcode/:barcodeId')
  getByBarcode(@Param('barcodeId') barcodeId: string) {
    return this.productsService.findByBarcode(barcodeId);
  }

  @Put(':id/barcode')
  assignBarcode(
    @Param('id', ParseIntPipe) id: number,
    @Body('barcodeId') barcodeId: string,
  ) {
    return this.productsService.assignBarcode(id, barcodeId);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('products')
export class ProductsController {
  constructor(private readonly svc: ProductsService) {}

  @Post()
  create(@Body() dto: CreateProductDto, @Req() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (req.user.clearanceLevel < 3) {
      throw new ForbiddenException(
        'Your not authorized to add a new product only managers and above are allowed',
      );
    }
    return this.svc.create(dto);
  }

  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
    @Req() req,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (req.user.clearanceLevel < 2) {
      throw new ForbiddenException(
        'Your not authorized to update a product only associates and above are allowed',
      );
    }
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (req.user.clearanceLevel < 3) {
      throw new ForbiddenException(
        'Your not authorized to delete a product only managers and above are allowed',
      );
    }
    return this.svc.remove(id);
  }
}

import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @IsNumber()
  id: number;
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsNumber()
  stock: number;
  @IsNotEmpty()
  @IsString()
  category: string;
  @IsString()
  @IsOptional()
  image?: string;
  @IsString()
  @IsOptional()
  description?: string;
  isEmpty?: boolean;
  @IsOptional()
  barcode?: string;
}

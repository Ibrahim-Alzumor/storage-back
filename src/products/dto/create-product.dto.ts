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
  categoryId: string;
  @IsString()
  @IsOptional()
  images?: string[];
  @IsString()
  @IsOptional()
  description?: string;
  @IsOptional()
  barcode?: string;
  @IsString()
  @IsNotEmpty()
  unitId: string;
}

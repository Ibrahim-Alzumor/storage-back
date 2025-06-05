import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateClearanceLevelDto {
  @IsNumber()
  level: number;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  allowedFunctions?: string[];
}
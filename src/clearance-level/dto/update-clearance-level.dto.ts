import { IsArray, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateClearanceLevelDto } from './create-clearance-level.dto';

export class UpdateClearanceLevelDto extends PartialType(CreateClearanceLevelDto) {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  allowedFunctions?: string[];
}
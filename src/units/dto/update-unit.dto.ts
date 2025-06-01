import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateUnitDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;
}

import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;
  @IsString()
  @IsNotEmpty()
  lastName: string;
  @IsEmail()
  email: string;
  @IsString()
  @IsNotEmpty()
  password: string;
  @IsString()
  @IsOptional()
  jobTitle?: string;
  @IsString()
  @IsOptional()
  phone?: string;
  @IsNumber()
  @IsNotEmpty()
  clearanceLevel: number;
}

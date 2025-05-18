import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateProductDto } from '../products/dto/create-product.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authSvc: AuthService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('register')
  async register(@Body() dto: CreateProductDto, @Req() req) {
    if (req.user.clearanceLevel < 3) {
      throw new ForbiddenException(
        'Your clearance level is is too low to register new users.',
      );
    }
    return this.authSvc.register(dto);
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authSvc.login(body);
  }
}

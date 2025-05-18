import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authSvc: AuthService) {}

  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    return this.authSvc.register(dto);
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authSvc.login(body);
  }
}

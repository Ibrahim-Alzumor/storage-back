import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authSvc: AuthService) {}

  @Post('register')
  register(@Body() body: any) {
    return this.authSvc.register(body);
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authSvc.login(body);
  }
}

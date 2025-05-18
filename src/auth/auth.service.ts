import { Injectable, UnauthorizedException, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AuthService {
  constructor(
    private usersSvc: UsersService,
    private jwtSvc: JwtService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  async register(dto: any) {
    return this.usersSvc.create(dto);
  }

  async login(creds: { email: string; password: string }) {
    const user = await this.validateUser(creds.email, creds.password);
    if (!user) throw new UnauthorizedException('Invalid Credentials');
    const payload = {
      sub: user.email,
    };

    return {
      accessToken: await this.jwtSvc.signAsync(payload),
      clearanceLevel: user.clearanceLevel,
    };
  }

  private async validateUser(email: string, pass: string) {
    const user = await this.usersSvc.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...rest } = user.toObject(); //come back
      return rest;
    }
    return null;
  }
}

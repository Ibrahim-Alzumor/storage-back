import { Injectable, UnauthorizedException, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuthGuard } from './auth.guard';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  @UseGuards(AuthGuard)
  async register(dto: any) {
    return this.usersService.create(dto);
  }

  async login(creds: { email: string; password: string }) {
    const user = await this.validateUser(creds.email, creds.password);
    if (user.active === false) {
      throw new UnauthorizedException('Account is disabled');
    }
    if (!user) throw new UnauthorizedException('Invalid Credentials');
    const payload = {
      email: user.email,
      clearanceLevel: user.clearanceLevel,
    };
    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }

  private async validateUser(email: string, pass: string) {
    try {
      const user = await this.usersService.findByEmail(email);
      if (user) {
        const passwordMatch = await bcrypt.compare(pass, user.password);
        if (passwordMatch) {
          const { password, ...rest } = user.toObject();
          return rest;
        }
      }
      return null;
    } catch (error) {
      console.error('Error in validateUser:', error);
      return null;
    }
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersSvc: UsersService,
    private jwtSvc: JwtService,
  ) {}
  private async validateUser(email: string, pass: string) {
    const user = await this.usersSvc.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unused-vars
      const { password, ...rest } = user.toObject();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return rest;
    }
    return null;
  }

  async register(dto: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.usersSvc.create(dto);
  }

  async login(creds: { email: string; password: string }) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const user = await this.validateUser(creds.email, creds.password);
    if (!user) throw new UnauthorizedException('Invalid Credentials');

    const payload = {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      sub: user.id,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      clearanceLevel: user.clearanceLevel,
    };

    return {
      accessToken: this.jwtSvc.sign(payload),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      clearanceLevel: payload.clearanceLevel,
    };
  }
}

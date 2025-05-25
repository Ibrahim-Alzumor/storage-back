import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ProductsModule } from './products/products.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import * as process from 'node:process';
import { jwtConstants } from './auth/constants';
import { OrdersModule } from './orders/orders.module';
import { LogsService } from './logs/logs.service';
import { LogsController } from './logs/logs.controller';
import { LogsModule } from './logs/logs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(<string>process.env['MONGODB_URI']),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        secret: jwtConstants.secret,
        signOptions: { expiresIn: '100m' },
      }),
      inject: [ConfigService],
    }),
    ProductsModule,
    UsersModule,
    AuthModule,
    OrdersModule,
    LogsModule,
  ],
  providers: [LogsService],
  controllers: [LogsController],
})
export class AppModule {}

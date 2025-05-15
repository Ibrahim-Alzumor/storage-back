import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { MongooseModule } from '@nestjs/mongoose';
import * as process from 'node:process';

@Module({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  imports: [MongooseModule.forRoot(process.env.MONGODB_URI), ProductsModule],
})
export class AppModule {}

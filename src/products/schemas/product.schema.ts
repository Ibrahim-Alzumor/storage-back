import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema()
export class Product {
  @Prop({ unique: true, required: true })
  id: number;
  @Prop({ required: true })
  name: string;
  @Prop({ required: true, default: 0 })
  stock: number;
  @Prop({ required: true })
  category: string;
  @Prop()
  image: string;
  @Prop()
  description: string;
  @Prop({ default: false })
  isEmpty: boolean;
  @Prop({ unique: true })
  barcode: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

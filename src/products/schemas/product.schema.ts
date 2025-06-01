import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Category } from '../../categories/schema/category.schema';
import { Unit } from '../../units/schema/unit.schema';

export type ProductDocument = Product & Document;

@Schema()
export class Product {
  @Prop({ unique: true, required: true })
  id: number;
  @Prop({ required: true })
  name: string;
  @Prop({ required: true, default: 0 })
  stock: number;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category' })
  categoryId: Category;
  @Prop()
  image: string;
  @Prop()
  description: string;
  @Prop({ default: false })
  isEmpty: boolean;
  @Prop({ unique: true })
  barcode: string;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Unit' })
  unitId: Unit;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

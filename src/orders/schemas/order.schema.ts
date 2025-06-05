import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Product } from '../../products/schemas/product.schema';

export type OrderDocument = Order & Document;

export class OrderItem {
  @Prop({ required: true })
  productId: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product' })
  product?: Product;

  @Prop({ required: true })
  quantity: number;
}

@Schema()
export class Order {
  @Prop({ unique: true, default: () => Date.now() })
  id: number;

  @Prop({ required: true })
  userEmail: string;

  @Prop({ required: true })
  timestamp: Date;

  @Prop({
    type: [OrderItem],
    required: true,
  })
  items: OrderItem[];
}

export const OrderSchema = SchemaFactory.createForClass(Order);

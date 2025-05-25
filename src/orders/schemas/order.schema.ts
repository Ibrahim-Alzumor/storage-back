import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema()
export class Order {
  @Prop({ required: true })
  userEmail: string;

  @Prop({ required: true })
  timestamp: Date;

  @Prop({
    type: [{ productId: Number, quantity: Number }],
    required: true,
  })
  items: Array<{ productId: number; quantity: number }>;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

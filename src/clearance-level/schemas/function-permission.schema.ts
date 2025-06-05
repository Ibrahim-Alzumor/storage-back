import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FunctionPermissionDocument = FunctionPermission & Document;

@Schema()
export class FunctionPermission {
  @Prop({ unique: true, required: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop()
  category: string;
}

export const FunctionPermissionSchema = SchemaFactory.createForClass(FunctionPermission);
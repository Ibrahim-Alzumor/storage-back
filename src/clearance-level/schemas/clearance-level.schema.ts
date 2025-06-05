import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ClearanceLevelDocument = ClearanceLevel & Document;

@Schema()
export class ClearanceLevel {
  @Prop({ unique: true, required: true })
  level: number;

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ type: [String], default: [] })
  allowedFunctions: string[];
}

export const ClearanceLevelSchema = SchemaFactory.createForClass(ClearanceLevel);
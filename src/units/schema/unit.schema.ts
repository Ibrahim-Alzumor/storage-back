import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UnitDocument = Unit & Document;

@Schema()
export class Unit {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  name: string;
}

export const UnitSchema = SchemaFactory.createForClass(Unit);

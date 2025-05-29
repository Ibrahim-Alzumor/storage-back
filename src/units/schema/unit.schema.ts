import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UnitDocument = Unit & Document;

@Schema()
export class Unit {
  @Prop({ required: true, unique: true })
  name: string;
}

export const UnitSchema = SchemaFactory.createForClass(Unit);

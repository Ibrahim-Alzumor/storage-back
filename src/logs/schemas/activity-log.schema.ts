import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class ActivityLog {
  @Prop({ required: true })
  userEmail: string;

  @Prop({ required: true })
  action: string;

  @Prop({ required: true })
  resourceType: string;

  @Prop()
  resourceId: string;

  @Prop()
  payload: string;

  @Prop({ required: true })
  timestamp: Date;
}

export type ActivityLogDocument = ActivityLog & Document;
export const ActivityLogSchema = SchemaFactory.createForClass(ActivityLog);

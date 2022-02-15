import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Message {
  @Prop()
  ts: string;

  @Prop()
  channel: string;

  @Prop()
  thread_ts: string;

  @Prop()
  mr_id: string;
}

export type MessageDocument = Message & Document;

export const MessageSchema = SchemaFactory.createForClass(Message);

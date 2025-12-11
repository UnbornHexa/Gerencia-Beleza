import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ClientDocument = Client & Document;

@Schema({ timestamps: true })
export class Client {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  email?: string;

  @Prop({
    type: {
      cep: String,
      state: String,
      city: String,
      street: String,
      number: String,
      complement: String,
      neighborhood: String,
    },
  })
  address?: {
    cep: string;
    state: string;
    city: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
  };

  @Prop({ default: false })
  isVip: boolean;

  @Prop()
  notes?: string;
}

export const ClientSchema = SchemaFactory.createForClass(Client);


import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  phone: string;

  @Prop({
    type: {
      cep: String,
      state: String,
      city: String,
      street: String,
      number: String,
      complement: String,
    },
    required: true,
  })
  address: {
    cep: string;
    state: string;
    city: string;
    street: string;
    number: string;
    complement?: string;
  };

  @Prop({
    type: {
      confirm: { type: String, default: 'Olá! Confirmo seu agendamento para {date} às {time}.' },
      reschedule: { type: String, default: 'Olá! Preciso remarcar seu agendamento. Podemos reagendar?' },
      cancel: { type: String, default: 'Olá! Infelizmente preciso cancelar seu agendamento. Podemos reagendar?' },
    },
    default: {
      confirm: 'Olá! Confirmo seu agendamento para {date} às {time}.',
      reschedule: 'Olá! Preciso remarcar seu agendamento. Podemos reagendar?',
      cancel: 'Olá! Infelizmente preciso cancelar seu agendamento. Podemos reagendar?',
    },
  })
  whatsappMessages: {
    confirm: string;
    reschedule: string;
    cancel: string;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);


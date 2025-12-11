import { Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  phone: string;
  address: {
    cep: string;
    state: string;
    city: string;
    street: string;
    number: string;
    complement?: string;
  };
  whatsappMessages: {
    confirm: string;
    reschedule: string;
    cancel: string;
  };
  createdAt: Date;
  updatedAt: Date;
}


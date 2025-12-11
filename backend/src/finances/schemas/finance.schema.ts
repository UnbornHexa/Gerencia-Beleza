import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FinanceDocument = Finance & Document;

export enum FinanceType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum ExpenseCategory {
  HEALTH = 'Saúde',
  EDUCATION = 'Educação',
  FOOD = 'Alimentação',
  PERSONAL = 'Gastos Pessoais',
  WORK = 'Trabalho',
  VEHICLE = 'Veículo',
  LEISURE = 'Lazer',
  HOUSE = 'Casa',
}

@Schema({ timestamps: true })
export class Finance {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: FinanceType })
  type: FinanceType;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: Number })
  amount: number;

  @Prop({ required: true })
  date: Date;

  @Prop({ enum: ExpenseCategory })
  category?: ExpenseCategory;

  @Prop({ type: Types.ObjectId, ref: 'Service' })
  serviceId?: Types.ObjectId;
}

export const FinanceSchema = SchemaFactory.createForClass(Finance);


import { IsEnum, IsString, IsNumber, IsDateString, IsOptional, Min } from 'class-validator';
import { FinanceType, ExpenseCategory } from '../schemas/finance.schema';

export class CreateFinanceDto {
  @IsEnum(FinanceType)
  type: FinanceType;

  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsEnum(ExpenseCategory)
  category?: ExpenseCategory;

  @IsOptional()
  @IsString()
  serviceId?: string;
}


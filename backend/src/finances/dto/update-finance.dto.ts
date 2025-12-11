import { IsEnum, IsString, IsNumber, IsDateString, IsOptional, Min } from 'class-validator';
import { FinanceType, ExpenseCategory } from '../schemas/finance.schema';

export class UpdateFinanceDto {
  @IsOptional()
  @IsEnum(FinanceType)
  type?: FinanceType;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsEnum(ExpenseCategory)
  category?: ExpenseCategory;

  @IsOptional()
  @IsString()
  serviceId?: string;
}


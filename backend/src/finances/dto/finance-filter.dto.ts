import { IsOptional, IsDateString, IsEnum } from 'class-validator';

export enum PeriodFilter {
  MONTH = 'month',
  THREE_MONTHS = '3months',
  SIX_MONTHS = '6months',
  YEAR = 'year',
  CUSTOM = 'custom',
}

export class FinanceFilterDto {
  @IsOptional()
  @IsEnum(PeriodFilter)
  period?: PeriodFilter;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}


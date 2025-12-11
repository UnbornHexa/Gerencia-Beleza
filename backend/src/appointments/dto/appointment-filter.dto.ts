import { IsOptional, IsDateString, IsEnum } from 'class-validator';

export enum ViewMode {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

export class AppointmentFilterDto {
  @IsOptional()
  @IsEnum(ViewMode)
  view?: ViewMode;

  @IsOptional()
  @IsDateString()
  date?: string;
}


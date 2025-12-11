import { IsString, IsDateString, IsArray, IsOptional, IsEnum } from 'class-validator';
import { AppointmentStatus } from '../schemas/appointment.schema';

export class CreateAppointmentDto {
  @IsString()
  clientId: string;

  @IsArray()
  @IsString({ each: true })
  serviceIds: string[];

  @IsDateString()
  date: string;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}


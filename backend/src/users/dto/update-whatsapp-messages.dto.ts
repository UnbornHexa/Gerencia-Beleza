import { IsOptional, IsString } from 'class-validator';

export class UpdateWhatsappMessagesDto {
  @IsOptional()
  @IsString()
  confirm?: string;

  @IsOptional()
  @IsString()
  reschedule?: string;

  @IsOptional()
  @IsString()
  cancel?: string;
}


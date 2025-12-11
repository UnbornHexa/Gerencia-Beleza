import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentFilterDto } from './dto/appointment-filter.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  create(
    @CurrentUser() user: any,
    @Body() createAppointmentDto: CreateAppointmentDto,
  ) {
    return this.appointmentsService.create(user.userId, createAppointmentDto);
  }

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query() filter: AppointmentFilterDto,
  ) {
    return this.appointmentsService.findAll(user.userId, filter);
  }

  @Get('upcoming')
  getUpcoming(@CurrentUser() user: any, @Query('hours') hours?: string) {
    return this.appointmentsService.getUpcoming(user.userId, hours ? parseInt(hours) : 3);
  }

  @Get('today-earnings')
  getTodayProjectedEarnings(@CurrentUser() user: any) {
    return this.appointmentsService.getTodayProjectedEarnings(user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.appointmentsService.findOne(id, user.userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.update(id, user.userId, updateAppointmentDto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Query('reason') reason?: string,
  ) {
    return this.appointmentsService.remove(id, user.userId, reason);
  }
}


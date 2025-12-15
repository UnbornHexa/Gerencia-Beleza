import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment, AppointmentDocument, AppointmentStatus } from './schemas/appointment.schema';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentFilterDto, ViewMode } from './dto/appointment-filter.dto';
import { ServicesService } from '../services/services.service';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel(Appointment.name) private appointmentModel: Model<AppointmentDocument>,
    private servicesService: ServicesService,
  ) {}

  async create(userId: string, createAppointmentDto: CreateAppointmentDto): Promise<AppointmentDocument> {
    // Calculate total amount from services
    const services = await Promise.all(
      createAppointmentDto.serviceIds.map(id => this.servicesService.findOne(id, userId)),
    );
    const totalAmount = services.reduce((sum, service) => sum + service.price, 0);

    const appointment = new this.appointmentModel({
      ...createAppointmentDto,
      userId,
      date: new Date(createAppointmentDto.date),
      totalAmount,
      status: createAppointmentDto.status || AppointmentStatus.SCHEDULED,
    });

    return appointment.save();
  }

  async findAll(userId: string, filter: AppointmentFilterDto): Promise<AppointmentDocument[]> {
    const query: any = { userId };
    const date = filter.date ? new Date(filter.date) : new Date();

    if (filter.view) {
      switch (filter.view) {
        case ViewMode.DAY:
          const startOfDay = new Date(date);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(date);
          endOfDay.setHours(23, 59, 59, 999);
          query.date = { $gte: startOfDay, $lte: endOfDay };
          break;
        case ViewMode.WEEK:
          const startOfWeek = new Date(date);
          startOfWeek.setDate(date.getDate() - date.getDay());
          startOfWeek.setHours(0, 0, 0, 0);
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          endOfWeek.setHours(23, 59, 59, 999);
          query.date = { $gte: startOfWeek, $lte: endOfWeek };
          break;
        case ViewMode.MONTH:
          const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
          const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
          endOfMonth.setHours(23, 59, 59, 999);
          query.date = { $gte: startOfMonth, $lte: endOfMonth };
          break;
      }
    }

    return this.appointmentModel
      .find(query)
      .populate('clientId')
      .populate('serviceIds')
      .sort({ date: 1, startTime: 1 })
      .exec();
  }

  async findOne(id: string, userId: string): Promise<AppointmentDocument> {
    const appointment = await this.appointmentModel
      .findOne({ _id: id, userId })
      .populate('clientId')
      .populate('serviceIds')
      .exec();
    if (!appointment) {
      throw new NotFoundException('Agendamento não encontrado');
    }
    return appointment;
  }

  async update(id: string, userId: string, updateAppointmentDto: UpdateAppointmentDto): Promise<AppointmentDocument> {
    const appointment = await this.findOne(id, userId);
    
    if (updateAppointmentDto.serviceIds) {
      const services = await Promise.all(
        updateAppointmentDto.serviceIds.map(serviceId => this.servicesService.findOne(serviceId, userId)),
      );
      appointment.totalAmount = services.reduce((sum, service) => sum + service.price, 0);
    }

    if (updateAppointmentDto.date) {
      updateAppointmentDto.date = new Date(updateAppointmentDto.date) as any;
    }

    Object.assign(appointment, updateAppointmentDto);
    return appointment.save();
  }

  async remove(id: string, userId: string, cancellationReason?: string): Promise<void> {
    const appointment = await this.findOne(id, userId);
    if (cancellationReason) {
      appointment.cancellationReason = cancellationReason;
      appointment.status = AppointmentStatus.CANCELLED;
      await appointment.save();
    } else {
      const result = await this.appointmentModel.deleteOne({ _id: id, userId }).exec();
      if (result.deletedCount === 0) {
        throw new NotFoundException('Agendamento não encontrado');
      }
    }
  }

  async getUpcoming(userId: string, hours: number = 3): Promise<AppointmentDocument[]> {
    const now = new Date();
    const future = new Date(now.getTime() + hours * 60 * 60 * 1000);

    return this.appointmentModel
      .find({
        userId,
        date: { $gte: now, $lte: future },
        status: { $in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED] },
      })
      .populate('clientId')
      .populate('serviceIds')
      .sort({ date: 1, startTime: 1 })
      .exec();
  }

  async getTodayProjectedEarnings(userId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await this.appointmentModel
      .find({
        userId,
        date: { $gte: today, $lt: tomorrow },
        status: { $in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED] },
      })
      .exec();

    return appointments.reduce((sum, apt) => sum + apt.totalAmount, 0);
  }
}


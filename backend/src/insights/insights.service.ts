import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment, AppointmentDocument, AppointmentStatus } from '../appointments/schemas/appointment.schema';
import { Client, ClientDocument } from '../clients/schemas/client.schema';
import { Finance, FinanceDocument, FinanceType } from '../finances/schemas/finance.schema';
import { Service, ServiceDocument } from '../services/schemas/service.schema';

@Injectable()
export class InsightsService {
  constructor(
    @InjectModel(Appointment.name) private appointmentModel: Model<AppointmentDocument>,
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>,
    @InjectModel(Finance.name) private financeModel: Model<FinanceDocument>,
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
  ) {}

  async getClientInsights(userId: string, clientId: string) {
    const appointments = await this.appointmentModel
      .find({ userId, clientId, status: AppointmentStatus.COMPLETED })
      .populate('serviceIds')
      .sort({ date: -1 })
      .exec();

    // Most contracted services
    const serviceCounts: Record<string, { service: any; count: number }> = {};
    appointments.forEach(apt => {
      apt.serviceIds.forEach((service: any) => {
        const serviceId = service._id.toString();
        if (!serviceCounts[serviceId]) {
          serviceCounts[serviceId] = { service, count: 0 };
        }
        serviceCounts[serviceId].count++;
      });
    });

    const topServices = Object.values(serviceCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Preferred time of day
    const timeSlots = { morning: 0, afternoon: 0, evening: 0 };
    appointments.forEach(apt => {
      const hour = parseInt(apt.startTime.split(':')[0]);
      if (hour >= 6 && hour < 12) timeSlots.morning++;
      else if (hour >= 12 && hour < 18) timeSlots.afternoon++;
      else timeSlots.evening++;
    });

    const preferredTime = Object.entries(timeSlots).reduce((a, b) =>
      timeSlots[a[0] as keyof typeof timeSlots] > timeSlots[b[0] as keyof typeof timeSlots] ? a : b,
    )[0];

    // Preferred hour
    const hourCounts: Record<number, number> = {};
    appointments.forEach(apt => {
      const hour = parseInt(apt.startTime.split(':')[0]);
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const preferredHour = Object.entries(hourCounts).reduce((a, b) =>
      hourCounts[parseInt(a[0])] > hourCounts[parseInt(b[0])] ? a : b,
    )[0];

    return {
      topServices: topServices.map(item => ({
        service: item.service,
        count: item.count,
      })),
      preferredTimeOfDay: preferredTime,
      preferredHour: parseInt(preferredHour),
      totalAppointments: appointments.length,
    };
  }

  async getClientPatterns(userId: string) {
    const clients = await this.clientModel.find({ userId }).exec();
    const patterns = [];

    for (const client of clients) {
      const appointments = await this.appointmentModel
        .find({ userId, clientId: client._id, status: AppointmentStatus.COMPLETED })
        .sort({ date: -1 })
        .exec();

      if (appointments.length < 2) continue;

      // Calculate average days between appointments
      const intervals: number[] = [];
      for (let i = 0; i < appointments.length - 1; i++) {
        const diff = Math.abs(
          (appointments[i].date.getTime() - appointments[i + 1].date.getTime()) / (1000 * 60 * 60 * 24),
        );
        intervals.push(diff);
      }

      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const lastAppointment = appointments[0].date;
      const daysSinceLast = Math.abs((new Date().getTime() - lastAppointment.getTime()) / (1000 * 60 * 60 * 24));

      let pattern: 'weekly' | 'biweekly' | 'monthly' | null = null;
      if (avgInterval >= 6 && avgInterval <= 8) pattern = 'weekly';
      else if (avgInterval >= 13 && avgInterval <= 15) pattern = 'biweekly';
      else if (avgInterval >= 28 && avgInterval <= 32) pattern = 'monthly';

      if (pattern && daysSinceLast > avgInterval * 1.2) {
        patterns.push({
          client,
          pattern,
          avgInterval: Math.round(avgInterval),
          daysSinceLast: Math.round(daysSinceLast),
          lastAppointment,
        });
      }
    }

    return patterns;
  }

  async getTopServices(userId: string, period: 'month' | 'semester' | 'year' = 'month') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'semester':
        startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    const finances = await this.financeModel
      .find({
        userId,
        type: FinanceType.INCOME,
        date: { $gte: startDate },
        serviceId: { $exists: true },
      })
      .populate('serviceId')
      .exec();

    const serviceStats: Record<string, { service: any; total: number; count: number; clients: Set<string> }> = {};

    finances.forEach(finance => {
      if (!finance.serviceId) return;
      const serviceId = (finance.serviceId as any)._id.toString();
      if (!serviceStats[serviceId]) {
        serviceStats[serviceId] = {
          service: finance.serviceId,
          total: 0,
          count: 0,
          clients: new Set(),
        };
      }
      serviceStats[serviceId].total += finance.amount;
      serviceStats[serviceId].count++;
    });

    // Get unique clients per service from appointments
    const appointments = await this.appointmentModel
      .find({
        userId,
        date: { $gte: startDate },
        status: AppointmentStatus.COMPLETED,
      })
      .populate('clientId')
      .populate('serviceIds')
      .exec();

    appointments.forEach(apt => {
      apt.serviceIds.forEach((service: any) => {
        const serviceId = service._id.toString();
        if (serviceStats[serviceId] && apt.clientId) {
          serviceStats[serviceId].clients.add((apt.clientId as any)._id.toString());
        }
      });
    });

    return Object.values(serviceStats)
      .map(stat => ({
        service: stat.service,
        total: stat.total,
        count: stat.count,
        uniqueClients: stat.clients.size,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);
  }

  async getTopNeighborhoods(userId: string, period: 'month' | 'semester' | 'year' = 'month') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'semester':
        startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    const appointments = await this.appointmentModel
      .find({
        userId,
        date: { $gte: startDate },
        status: AppointmentStatus.COMPLETED,
      })
      .populate('clientId')
      .exec();

    const neighborhoodStats: Record<string, number> = {};

    appointments.forEach(apt => {
      const client = apt.clientId as any;
      if (client?.address?.neighborhood) {
        const neighborhood = client.address.neighborhood;
        neighborhoodStats[neighborhood] = (neighborhoodStats[neighborhood] || 0) + apt.totalAmount;
      }
    });

    return Object.entries(neighborhoodStats)
      .map(([neighborhood, total]) => ({ neighborhood, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);
  }

  async identifyVipClients(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const appointments = await this.appointmentModel
      .find({
        userId,
        date: { $gte: startOfMonth },
        status: AppointmentStatus.COMPLETED,
      })
      .populate('clientId')
      .exec();

    const clientSpending: Record<string, number> = {};

    appointments.forEach(apt => {
      const clientId = (apt.clientId as any)?._id?.toString();
      if (clientId) {
        clientSpending[clientId] = (clientSpending[clientId] || 0) + apt.totalAmount;
      }
    });

    const avgSpending = Object.values(clientSpending).reduce((a, b) => a + b, 0) / Object.keys(clientSpending).length || 0;
    const vipThreshold = avgSpending * 1.5;

    const vipClients = Object.entries(clientSpending)
      .filter(([_, spending]) => spending >= vipThreshold)
      .map(([clientId, spending]) => ({ clientId, spending }));

    return vipClients;
  }
}


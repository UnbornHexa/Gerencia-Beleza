import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InsightsService } from './insights.service';
import { InsightsController } from './insights.controller';
import { Appointment, AppointmentSchema } from '../appointments/schemas/appointment.schema';
import { Client, ClientSchema } from '../clients/schemas/client.schema';
import { Finance, FinanceSchema } from '../finances/schemas/finance.schema';
import { Service, ServiceSchema } from '../services/schemas/service.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
      { name: Client.name, schema: ClientSchema },
      { name: Finance.name, schema: FinanceSchema },
      { name: Service.name, schema: ServiceSchema },
    ]),
  ],
  controllers: [InsightsController],
  providers: [InsightsService],
  exports: [InsightsService],
})
export class InsightsModule {}


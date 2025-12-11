import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { ServicesModule } from './services/services.module';
import { FinancesModule } from './finances/finances.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { InsightsModule } from './insights/insights.module';
import { ExternalApisModule } from './external-apis/external-apis.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://admin:admin123@mongodb:27017/gerencia-beleza?authSource=admin'),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    ClientsModule,
    ServicesModule,
    FinancesModule,
    AppointmentsModule,
    InsightsModule,
    ExternalApisModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}


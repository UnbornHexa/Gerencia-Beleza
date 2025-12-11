import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FinancesService } from './finances.service';
import { FinancesController } from './finances.controller';
import { Finance, FinanceSchema } from './schemas/finance.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Finance.name, schema: FinanceSchema }]),
  ],
  controllers: [FinancesController],
  providers: [FinancesService],
  exports: [FinancesService],
})
export class FinancesModule {}


import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Finance, FinanceDocument, FinanceType, ExpenseCategory } from './schemas/finance.schema';
import { CreateFinanceDto } from './dto/create-finance.dto';
import { UpdateFinanceDto } from './dto/update-finance.dto';
import { FinanceFilterDto, PeriodFilter } from './dto/finance-filter.dto';

@Injectable()
export class FinancesService {
  constructor(
    @InjectModel(Finance.name) private financeModel: Model<FinanceDocument>,
  ) {}

  async create(userId: string, createFinanceDto: CreateFinanceDto): Promise<FinanceDocument> {
    const finance = new this.financeModel({
      ...createFinanceDto,
      userId,
      date: new Date(createFinanceDto.date),
    });
    return finance.save();
  }

  async findAll(userId: string, filter: FinanceFilterDto): Promise<FinanceDocument[]> {
    const query: any = { userId };
    const now = new Date();

    if (filter.period) {
      let startDate: Date;
      switch (filter.period) {
        case PeriodFilter.MONTH:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case PeriodFilter.THREE_MONTHS:
          startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
          break;
        case PeriodFilter.SIX_MONTHS:
          startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
          break;
        case PeriodFilter.YEAR:
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        case PeriodFilter.CUSTOM:
          if (filter.startDate) {
            query.date = { $gte: new Date(filter.startDate) };
          }
          if (filter.endDate) {
            query.date = { ...query.date, $lte: new Date(filter.endDate) };
          }
          break;
      }
      if (startDate && filter.period !== PeriodFilter.CUSTOM) {
        query.date = { $gte: startDate, $lte: now };
      }
    }

    return this.financeModel.find(query).sort({ date: -1 }).exec();
  }

  async findOne(id: string, userId: string): Promise<FinanceDocument> {
    const finance = await this.financeModel.findOne({ _id: id, userId }).exec();
    if (!finance) {
      throw new NotFoundException('Registro financeiro não encontrado');
    }
    return finance;
  }

  async update(id: string, userId: string, updateFinanceDto: UpdateFinanceDto): Promise<FinanceDocument> {
    const finance = await this.findOne(id, userId);
    if (updateFinanceDto.date) {
      updateFinanceDto.date = new Date(updateFinanceDto.date) as any;
    }
    Object.assign(finance, updateFinanceDto);
    return finance.save();
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.financeModel.deleteOne({ _id: id, userId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Registro financeiro não encontrado');
    }
  }

  async getSummary(userId: string, filter: FinanceFilterDto) {
    const finances = await this.findAll(userId, filter);
    
    const totalIncome = finances
      .filter(f => f.type === FinanceType.INCOME)
      .reduce((sum, f) => sum + f.amount, 0);
    
    const totalExpense = finances
      .filter(f => f.type === FinanceType.EXPENSE)
      .reduce((sum, f) => sum + f.amount, 0);

    const incomeByService = finances
      .filter(f => f.type === FinanceType.INCOME && f.serviceId)
      .reduce((acc, f) => {
        const serviceId = f.serviceId.toString();
        acc[serviceId] = (acc[serviceId] || 0) + f.amount;
        return acc;
      }, {} as Record<string, number>);

    const expenseByCategory = finances
      .filter(f => f.type === FinanceType.EXPENSE && f.category)
      .reduce((acc, f) => {
        const category = f.category as string;
        acc[category] = (acc[category] || 0) + f.amount;
        return acc;
      }, {} as Record<string, number>);

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      incomeByService,
      expenseByCategory,
    };
  }
}


import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { InsightsService } from './insights.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('insights')
@UseGuards(JwtAuthGuard)
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Get('client/:clientId')
  async getClientInsights(@Param('clientId') clientId: string, @CurrentUser() user: any) {
    return this.insightsService.getClientInsights(user.userId, clientId);
  }

  @Get('patterns')
  async getClientPatterns(@CurrentUser() user: any) {
    return this.insightsService.getClientPatterns(user.userId);
  }

  @Get('top-services')
  async getTopServices(
    @CurrentUser() user: any,
    @Query('period') period: 'month' | 'semester' | 'year' = 'month',
  ) {
    return this.insightsService.getTopServices(user.userId, period);
  }

  @Get('top-neighborhoods')
  async getTopNeighborhoods(
    @CurrentUser() user: any,
    @Query('period') period: 'month' | 'semester' | 'year' = 'month',
  ) {
    return this.insightsService.getTopNeighborhoods(user.userId, period);
  }

  @Get('vip-clients')
  async getVipClients(@CurrentUser() user: any) {
    return this.insightsService.identifyVipClients(user.userId);
  }
}


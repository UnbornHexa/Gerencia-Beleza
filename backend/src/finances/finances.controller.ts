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
import { FinancesService } from './finances.service';
import { CreateFinanceDto } from './dto/create-finance.dto';
import { UpdateFinanceDto } from './dto/update-finance.dto';
import { FinanceFilterDto } from './dto/finance-filter.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('finances')
@UseGuards(JwtAuthGuard)
export class FinancesController {
  constructor(private readonly financesService: FinancesService) {}

  @Post()
  create(
    @CurrentUser() user: any,
    @Body() createFinanceDto: CreateFinanceDto,
  ) {
    return this.financesService.create(user.userId, createFinanceDto);
  }

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query() filter: FinanceFilterDto,
  ) {
    return this.financesService.findAll(user.userId, filter);
  }

  @Get('summary')
  getSummary(
    @CurrentUser() user: any,
    @Query() filter: FinanceFilterDto,
  ) {
    return this.financesService.getSummary(user.userId, filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.financesService.findOne(id, user.userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateFinanceDto: UpdateFinanceDto,
  ) {
    return this.financesService.update(id, user.userId, updateFinanceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.financesService.remove(id, user.userId);
  }
}

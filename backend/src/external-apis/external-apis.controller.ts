import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ExternalApisService } from './external-apis.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';

@Controller('external-apis')
export class ExternalApisController {
  constructor(private readonly externalApisService: ExternalApisService) {}

  @Public()
  @Get('cep/:cep')
  async getAddressByCep(@Param('cep') cep: string) {
    return this.externalApisService.getAddressByCep(cep);
  }

  @Public()
  @Get('states')
  async getStates() {
    return this.externalApisService.getStates();
  }

  @Public()
  @Get('cities/:stateId')
  async getCitiesByState(@Param('stateId') stateId: string) {
    return this.externalApisService.getCitiesByState(stateId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('whatsapp/generate-link')
  async generateWhatsAppLink(@Body() body: { phone: string; message: string }) {
    return { link: await this.externalApisService.generateWhatsAppLink(body.phone, body.message) };
  }

  @UseGuards(JwtAuthGuard)
  @Post('whatsapp/send')
  async sendWhatsAppMessage(@Body() body: { phone: string; message: string }) {
    return this.externalApisService.sendWhatsAppMessage(body.phone, body.message);
  }
}


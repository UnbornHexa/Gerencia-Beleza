import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class ExternalApisService {
  private readonly logger = new Logger(ExternalApisService.name);
  private ibgeApiUrl: string;
  private whatsappApiUrl: string;
  private whatsappApiKey: string;

  constructor(private configService: ConfigService) {
    this.ibgeApiUrl = this.configService.get('IBGE_API_URL') || 'https://servicodados.ibge.gov.br/api/v1';
    this.whatsappApiUrl = this.configService.get('WHATSAPP_API_URL') || '';
    this.whatsappApiKey = this.configService.get('WHATSAPP_API_KEY') || '';
  }

  async getAddressByCep(cep: string) {
    try {
      const cleanCep = cep.replace(/\D/g, '');
      if (cleanCep.length !== 8) {
        throw new Error('CEP inválido');
      }

      const response = await axios.get(`https://viacep.com.br/ws/${cleanCep}/json/`, {
        timeout: 5000,
      });
      
      if (response.data.erro) {
        throw new Error('CEP não encontrado');
      }

      return {
        cep: response.data.cep,
        street: response.data.logradouro,
        neighborhood: response.data.bairro,
        city: response.data.localidade,
        state: response.data.uf,
      };
    } catch (error: any) {
      this.logger.error(`Erro ao buscar CEP ${cep}: ${error.message}`);
      throw new Error('Erro ao buscar CEP. Verifique se o CEP está correto.');
    }
  }

  async getStates() {
    try {
      const response = await axios.get(`${this.ibgeApiUrl}/localidades/estados?orderBy=nome`, {
        timeout: 10000,
      });
      return response.data.map((state: any) => ({
        id: state.id,
        sigla: state.sigla,
        nome: state.nome,
      }));
    } catch (error: any) {
      this.logger.error(`Erro ao buscar estados: ${error.message}`);
      throw new Error('Erro ao buscar estados');
    }
  }

  async getCitiesByState(stateId: string) {
    try {
      const response = await axios.get(
        `${this.ibgeApiUrl}/localidades/estados/${stateId}/municipios?orderBy=nome`,
        {
          timeout: 10000,
        },
      );
      return response.data.map((city: any) => ({
        id: city.id,
        nome: city.nome,
      }));
    } catch (error: any) {
      this.logger.error(`Erro ao buscar cidades do estado ${stateId}: ${error.message}`);
      throw new Error('Erro ao buscar cidades');
    }
  }

  async generateWhatsAppLink(phone: string, message: string): Promise<string> {
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        throw new Error('Número de telefone inválido');
      }
      const encodedMessage = encodeURIComponent(message);
      return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    } catch (error: any) {
      this.logger.error(`Erro ao gerar link WhatsApp: ${error.message}`);
      throw new Error('Erro ao gerar link do WhatsApp');
    }
  }

  async sendWhatsAppMessage(phone: string, message: string): Promise<any> {
    if (!this.whatsappApiUrl || !this.whatsappApiKey) {
      this.logger.warn('WhatsApp API não configurada, retornando link');
      return { link: await this.generateWhatsAppLink(phone, message) };
    }

    try {
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        throw new Error('Número de telefone inválido');
      }

      const response = await axios.post(
        `${this.whatsappApiUrl}/messages`,
        {
          to: cleanPhone,
          message: message,
        },
        {
          headers: {
            Authorization: `Bearer ${this.whatsappApiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        },
      );
      
      this.logger.log(`Mensagem WhatsApp enviada para ${cleanPhone}`);
      return response.data;
    } catch (error: any) {
      this.logger.error(`Erro ao enviar mensagem WhatsApp: ${error.message}`);
      // Fallback to WhatsApp link
      return { link: await this.generateWhatsAppLink(phone, message) };
    }
  }
}

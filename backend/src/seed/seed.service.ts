import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async onModuleInit() {
    await this.seedAdminUser();
  }

  async seedAdminUser() {
    try {
      const adminEmail = 'admin@gerenciabeleza.com';
      const existingAdmin = await this.userModel.findOne({ email: adminEmail }).exec();

      if (existingAdmin) {
        this.logger.log('Usuário administrador já existe');
        return;
      }

      const hashedPassword = await bcrypt.hash('admin123', 10);

      const adminUser = new this.userModel({
        email: adminEmail,
        password: hashedPassword,
        phone: '(00) 00000-0000',
        address: {
          cep: '00000-000',
          state: 'SP',
          city: 'São Paulo',
          street: 'Rua Administrador',
          number: '0',
          complement: '',
        },
      });

      await adminUser.save();
      this.logger.log('✅ Usuário administrador criado com sucesso!');
      this.logger.log(`📧 Email: ${adminEmail}`);
      this.logger.log(`🔑 Senha: admin123`);
    } catch (error) {
      this.logger.error('Erro ao criar usuário administrador:', error);
    }
  }
}



import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateWhatsappMessagesDto } from './dto/update-whatsapp-messages.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async create(userData: {
    email: string;
    password: string;
    phone: string;
    address: {
      cep: string;
      state: string;
      city: string;
      street: string;
      number: string;
      complement?: string;
    };
  }): Promise<UserDocument> {
    const existingUser = await this.findByEmail(userData.email);
    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = new this.userModel({
      ...userData,
      email: userData.email.toLowerCase(),
      password: hashedPassword,
    });

    return user.save();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser) {
        throw new ConflictException('Email já está em uso');
      }
      updateUserDto.email = updateUserDto.email.toLowerCase();
    }

    Object.assign(user, updateUserDto);
    return user.save();
  }

  async updatePassword(id: string, updatePasswordDto: UpdatePasswordDto): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const isPasswordValid = await bcrypt.compare(updatePasswordDto.currentPassword, user.password);
    if (!isPasswordValid) {
      throw new ConflictException('Senha atual incorreta');
    }

    user.password = await bcrypt.hash(updatePasswordDto.newPassword, 10);
    await user.save();
  }

  async updateWhatsappMessages(
    id: string,
    updateMessagesDto: UpdateWhatsappMessagesDto,
  ): Promise<UserDocument> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    user.whatsappMessages = {
      ...user.whatsappMessages,
      ...updateMessagesDto,
    };

    return user.save();
  }
}


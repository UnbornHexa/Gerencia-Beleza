import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Client, ClientDocument } from './schemas/client.schema';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>,
  ) {}

  async create(userId: string, createClientDto: CreateClientDto): Promise<ClientDocument> {
    const client = new this.clientModel({
      ...createClientDto,
      userId,
    });
    return client.save();
  }

  async findAll(userId: string): Promise<ClientDocument[]> {
    return this.clientModel.find({ userId }).exec();
  }

  async findOne(id: string, userId: string): Promise<ClientDocument> {
    const client = await this.clientModel.findOne({ _id: id, userId }).exec();
    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }
    return client;
  }

  async update(id: string, userId: string, updateClientDto: UpdateClientDto): Promise<ClientDocument> {
    const client = await this.findOne(id, userId);
    Object.assign(client, updateClientDto);
    return client.save();
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.clientModel.deleteOne({ _id: id, userId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Cliente não encontrado');
    }
  }
}


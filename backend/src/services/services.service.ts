import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Service, ServiceDocument } from './schemas/service.schema';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
  ) {}

  async create(userId: string, createServiceDto: CreateServiceDto): Promise<ServiceDocument> {
    const service = new this.serviceModel({
      ...createServiceDto,
      userId,
    });
    return service.save();
  }

  async findAll(userId: string): Promise<ServiceDocument[]> {
    return this.serviceModel.find({ userId }).exec();
  }

  async findOne(id: string, userId: string): Promise<ServiceDocument> {
    const service = await this.serviceModel.findOne({ _id: id, userId }).exec();
    if (!service) {
      throw new NotFoundException('Serviço não encontrado');
    }
    return service;
  }

  async update(id: string, userId: string, updateServiceDto: UpdateServiceDto): Promise<ServiceDocument> {
    const service = await this.findOne(id, userId);
    Object.assign(service, updateServiceDto);
    return service.save();
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.serviceModel.deleteOne({ _id: id, userId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Serviço não encontrado');
    }
  }
}


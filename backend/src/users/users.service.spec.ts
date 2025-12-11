import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let model: any;

  const mockModel = {
    findOne: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken('User'),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get(getModelToken('User'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByEmail', () => {
    it('should return a user if found', async () => {
      const mockUser = { _id: '123', email: 'test@test.com' };
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.findByEmail('test@test.com');
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findByEmail('test@test.com');
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should throw ConflictException if email already exists', async () => {
      const existingUser = { _id: '123', email: 'test@test.com' };
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingUser),
      });

      await expect(
        service.create({
          email: 'test@test.com',
          password: 'password',
          phone: '123456789',
          address: {
            cep: '12345-678',
            state: 'SP',
            city: 'São Paulo',
            street: 'Rua Test',
            number: '123',
          },
        }),
      ).rejects.toThrow(ConflictException);
    });
  });
});


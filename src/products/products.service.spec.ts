import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { ConflictException } from '@nestjs/common';
import { UniqueConstraintError } from 'sequelize';
import { ProductsService } from './products.service';
import { Product } from './products.model';
import { CreateProductRequestDto } from './dtos/products.request.dto';
import { ProductResponseDto } from './dtos/products.response.dto';
import { createMock } from '../test-utils/create-mock';

describe('ProductsService', () => {
  let service: ProductsService;
  let productModel: typeof Product;

  beforeEach(async () => {
    productModel = createMock<typeof Product>({
      create: jest.fn(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getModelToken(Product),
          useValue: productModel,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a new product', async () => {
      const dto: CreateProductRequestDto = {
        name: 'Widget Pro',
        productToken: '550e8400-e29b-41d4-a716-446655440000',
        price: 29.99,
        stock: 100,
      };
      const createdProduct = createMock<Product>({ id: 1, ...dto });
      jest.mocked(productModel.create).mockResolvedValue(createdProduct);

      const result = await service.create(dto);

      expect(productModel.create).toHaveBeenCalledWith({ ...dto });
      expect(result).toBeInstanceOf(ProductResponseDto);
      expect(result).toMatchObject({
        id: 1,
        name: dto.name,
        productToken: dto.productToken,
        price: dto.price,
        stock: dto.stock,
      });
    });

    it('should throw ConflictException when productToken already exists', async () => {
      const dto: CreateProductRequestDto = {
        name: 'Widget Pro',
        productToken: '550e8400-e29b-41d4-a716-446655440000',
        price: 29.99,
        stock: 100,
      };
      const uniqueError = new UniqueConstraintError({});
      jest.mocked(productModel.create).mockRejectedValue(uniqueError);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });
});

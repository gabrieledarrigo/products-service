import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UniqueConstraintError } from 'sequelize';
import { ProductsService } from './products.service';
import { Product } from './products.model';
import { CreateProductRequestDto, GetProductsQueryDto } from './dtos/products.request.dto';
import { ProductResponseDto, PaginationResponseDto } from './dtos/products.response.dto';
import { createMock } from '../test-utils/create-mock';

describe('ProductsService', () => {
  let service: ProductsService;
  let productModel: typeof Product;

  beforeEach(async () => {
    productModel = createMock<typeof Product>({
      create: jest.fn(),
      findAndCountAll: jest.fn(),
      findByPk: jest.fn(),
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

  describe('findAll', () => {
    it('should return a paginated list of products with metadata', async () => {
      const query: GetProductsQueryDto = {
        page: 1,
        limit: 20,
        getOffset: () => 0,
      };

      const products = [
        createMock<Product>({ id: 1, name: 'Product 1' }),
        createMock<Product>({ id: 2, name: 'Product 2' }),
      ];

      jest.mocked(productModel.findAndCountAll).mockResolvedValue({
        rows: products,
        count: 2,
      } as unknown as Awaited<ReturnType<typeof productModel.findAndCountAll>>);

      const result = await service.findAll(query);

      expect(productModel.findAndCountAll).toHaveBeenCalledWith({
        offset: 0,
        limit: 20,
      });
      expect(result).toBeInstanceOf(PaginationResponseDto);
      expect(result).toMatchObject({
        totalItems: 2,
        currentPage: 1,
        totalPages: 1,
        limit: 20,
      });
      expect(result.products).toHaveLength(2);
      expect(result.products[0]).toBeInstanceOf(ProductResponseDto);
    });

    it('should compute the correct offset for a given page and limit', async () => {
      const query: GetProductsQueryDto = {
        page: 3,
        limit: 5,
        getOffset: () => 10,
      };

      jest.mocked(productModel.findAndCountAll).mockResolvedValue({
        rows: [],
        count: 12,
      } as unknown as Awaited<ReturnType<typeof productModel.findAndCountAll>>);

      const result = await service.findAll(query);

      expect(productModel.findAndCountAll).toHaveBeenCalledWith({
        offset: 10,
        limit: 5,
      });
      expect(result).toMatchObject({
        totalItems: 12,
        currentPage: 3,
        totalPages: 3,
        limit: 5,
      });
    });

    it('should return an empty list when no products exist', async () => {
      const query: GetProductsQueryDto = {
        page: 1,
        limit: 20,
        getOffset: () => 0,
      };

      jest.mocked(productModel.findAndCountAll).mockResolvedValue({
        rows: [],
        count: 0,
      } as unknown as Awaited<ReturnType<typeof productModel.findAndCountAll>>);

      const result = await service.findAll(query);

      expect(result.products).toEqual([]);
      expect(result).toMatchObject({
        totalItems: 0,
        currentPage: 1,
        totalPages: 0,
        limit: 20,
      });
    });
  });

  describe('findOne', () => {
    it('should return the product when it exists', async () => {
      const product = createMock<Product>({
        id: 1,
        name: 'Widget Pro',
        productToken: '550e8400-e29b-41d4-a716-446655440000',
        price: 29.99,
        stock: 100,
      });
      jest.mocked(productModel.findByPk).mockResolvedValue(product);

      const result = await service.findOne(1);

      expect(productModel.findByPk).toHaveBeenCalledWith(1);
      expect(result).toBeInstanceOf(ProductResponseDto);
      expect(result).toMatchObject({
        id: 1,
        name: 'Widget Pro',
        productToken: '550e8400-e29b-41d4-a716-446655440000',
        price: 29.99,
        stock: 100,
      });
    });

    it('should throw NotFoundException when the product does not exist', async () => {
      jest.mocked(productModel.findByPk).mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStock', () => {
    it('should update the stock and return the updated product', async () => {
      const product = createMock<Product>({
        id: 1,
        name: 'Widget Pro',
        productToken: '550e8400-e29b-41d4-a716-446655440000',
        price: 29.99,
        stock: 100,
        update: jest.fn(),
      });
      const updatedProduct = createMock<Product>({
        ...product,
        stock: 50,
      });
      jest.mocked(productModel.findByPk).mockResolvedValue(product);
      jest.mocked(product.update).mockResolvedValue(updatedProduct);

      const result = await service.updateStock(1, { stock: 50 });

      expect(productModel.findByPk).toHaveBeenCalledWith(1);
      expect(product.update).toHaveBeenCalledWith({ stock: 50 });
      expect(result).toBeInstanceOf(ProductResponseDto);
      expect(result).toMatchObject({ id: 1, stock: 50 });
    });

    it('should throw NotFoundException when the product does not exist', async () => {
      jest.mocked(productModel.findByPk).mockResolvedValue(null);

      await expect(service.updateStock(999, { stock: 50 })).rejects.toThrow(NotFoundException);
    });
  });
});

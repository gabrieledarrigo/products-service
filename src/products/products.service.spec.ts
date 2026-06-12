import { describe, it, expect, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { ProductsService } from './products.service';
import { Product } from './products.model';
import { createMock } from '../test-utils/create-mock';

describe('ProductsService', () => {
  let service: ProductsService;
  let productModel: typeof Product;

  beforeEach(async () => {
    productModel = createMock<typeof Product>();

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
});

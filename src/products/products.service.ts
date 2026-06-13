import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UniqueConstraintError } from 'sequelize';
import { Product } from './products.model';
import { CreateProductRequestDto } from './dtos/products.request.dto';
import { ProductResponseDto } from './dtos/products.response.dto';

/**
 * Application service handling the business logic for product operations.
 *
 * Encapsulates all product-related logic including creation, retrieval,
 * pagination, stock updates, and soft-deletion. Returns response DTOs so
 * controllers can simply delegate and return the result.
 */
@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product)
    private readonly productModel: typeof Product,
  ) {}

  /**
   * Creates a new product.
   *
   * @param dto - The validated product creation payload.
   * @returns The newly created product as a response DTO.
   * @throws ConflictException when a product with the same productToken already exists.
   */
  async create(dto: CreateProductRequestDto): Promise<ProductResponseDto> {
    const product = await this.productModel.create({ ...dto }).catch((error) => {
      if (error instanceof UniqueConstraintError) {
        throw new ConflictException('Product with this productToken already exists');
      }

      throw error;
    });

    return new ProductResponseDto(product);
  }
}

import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UniqueConstraintError } from 'sequelize';
import { Product } from './products.model';
import {
  CreateProductRequestDto,
  GetProductsQueryDto,
  UpdateProductStockRequestDto,
} from './dtos/products.request.dto';
import { ProductResponseDto, PaginationResponseDto } from './dtos/products.response.dto';

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

  /**
   * Retrieves a paginated list of active products.
   *
   * @param query - The validated pagination parameters.
   * @returns A paginated response containing products and pagination metadata.
   */
  async findAll(query: GetProductsQueryDto): Promise<PaginationResponseDto> {
    const { page, limit } = query;

    const { rows, count } = await this.productModel.findAndCountAll({
      offset: query.getOffset(),
      limit,
    });

    const products = rows.map((product) => new ProductResponseDto(product));

    return new PaginationResponseDto(products, count, page, limit);
  }

  /**
   * Retrieves a single active product by its identifier.
   *
   * @param id - The product identifier.
   * @returns The product as a response DTO.
   * @throws NotFoundException when no active product exists with the given id.
   */
  async findOne(id: number): Promise<ProductResponseDto> {
    const product = await this.productModel.findByPk(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return new ProductResponseDto(product);
  }

  /**
   * Updates the stock quantity of an existing active product.
   *
   * @param id - The product identifier.
   * @param dto - The validated stock update payload.
   * @returns The updated product as a response DTO.
   * @throws NotFoundException when no active product exists with the given id.
   */
  async updateStock(id: number, dto: UpdateProductStockRequestDto): Promise<ProductResponseDto> {
    const product = await this.productModel.findByPk(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const updatedProduct = await product.update({ stock: dto.stock });

    return new ProductResponseDto(updatedProduct);
  }

  /**
   * Soft-deletes a product by its identifier.
   *
   * The operation is idempotent: deleting a non-existent or already-deleted
   * product completes successfully without error.
   *
   * @param id - The product identifier.
   */
  async remove(id: number): Promise<void> {
    await this.productModel.destroy({ where: { id } });
  }
}

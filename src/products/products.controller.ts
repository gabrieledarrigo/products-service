import { Controller, Post, Body } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductRequestDto } from './dtos/products.request.dto';
import { ProductResponseDto } from './dtos/products.response.dto';

/**
 * Handle HTTP requests related to products.
 */
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * Creates a new product.
   *
   * @param dto - The validated product creation payload.
   * @returns The created product as a response DTO.
   */
  @Post()
  create(@Body() dto: CreateProductRequestDto): Promise<ProductResponseDto> {
    return this.productsService.create(dto);
  }
}

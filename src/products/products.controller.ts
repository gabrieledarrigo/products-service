import { Controller, Post, Get, Put, Body, Query, Param, ParseIntPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
import {
  CreateProductRequestDto,
  GetProductsQueryDto,
  UpdateProductStockRequestDto,
} from './dtos/products.request.dto';
import { ProductResponseDto, PaginationResponseDto } from './dtos/products.response.dto';

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

  /**
   * Retrieves a paginated list of products.
   *
   * @param query - The validated pagination parameters.
   * @returns A paginated response containing products and metadata.
   */
  @Get()
  findAll(@Query() query: GetProductsQueryDto): Promise<PaginationResponseDto> {
    return this.productsService.findAll(query);
  }

  /**
   * Retrieves a single product by its identifier.
   *
   * @param id - The product identifier.
   * @returns The product as a response DTO.
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ProductResponseDto> {
    return this.productsService.findOne(id);
  }

  /**
   * Updates the stock quantity of a product.
   *
   * @param id - The product identifier.
   * @param dto - The validated stock update payload.
   * @returns The updated product as a response DTO.
   */
  @Put(':id/stock')
  updateStock(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductStockRequestDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.updateStock(id, dto);
  }
}

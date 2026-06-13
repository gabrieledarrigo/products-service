import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsNumber,
  IsInt,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
  MAX_PRODUCT_PRICE,
  MIN_PAGE_LIMIT,
  MIN_PRODUCT_PRICE,
  MIN_PRODUCT_STOCK,
  PRODUCT_PRICE_SCALE,
} from '../constants';

export class CreateProductRequestDto {
  /**
   * Product display name, must be a non-empty string.
   */
  @IsString()
  @IsNotEmpty()
  readonly name!: string;

  /**
   * Client-provided UUID v4 token.
   */
  @IsUUID('4')
  readonly productToken!: string;

  /**
   * Unit price, non-negative with up to 4 decimal places, max 999999.9999.
   */
  @IsNumber({ maxDecimalPlaces: PRODUCT_PRICE_SCALE })
  @Min(MIN_PRODUCT_PRICE)
  @Max(MAX_PRODUCT_PRICE)
  readonly price!: number;

  /**
   * Available inventory quantity, non-negative integer.
   */
  @IsInt()
  @Min(MIN_PRODUCT_STOCK)
  readonly stock!: number;
}

export class GetProductsQueryDto {
  /**
   * Page number to retrieve, minimum 1, defaults to 1.
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(DEFAULT_PAGE)
  readonly page: number = DEFAULT_PAGE;

  /**
   * Number of products per page, between 1 and 100, defaults to 20.
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(MIN_PAGE_LIMIT)
  @Max(MAX_PAGE_LIMIT)
  readonly limit: number = DEFAULT_PAGE_LIMIT;

  /**
   * Calculates the zero-based row offset for the current page.
   *
   * @returns The number of rows to skip before the current page.
   */
  getOffset(): number {
    return (this.page - 1) * this.limit;
  }
}

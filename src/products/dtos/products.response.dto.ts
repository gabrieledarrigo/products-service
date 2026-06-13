import { Product } from '../products.model';

export class ProductResponseDto {
  /**
   * Auto-incremented unique identifier.
   */
  readonly id: number;

  /**
   * Client-provided UUID v4 token.
   */
  readonly productToken: string;

  /**
   * Product display name.
   */
  readonly name: string;

  /**
   * Unit price with up to 4 decimal places.
   */
  readonly price: number;

  /**
   * Available inventory quantity.
   */
  readonly stock: number;

  /**
   * Timestamp when the product was created.
   */
  readonly createdAt: Date;

  /**
   * Timestamp when the product was last updated.
   */
  readonly updatedAt: Date;

  /**
   * @param product - The Product model instance to map from.
   */
  constructor(product: Product) {
    this.id = product.id;
    this.productToken = product.productToken;
    this.name = product.name;
    this.price = Number(product.price);
    this.stock = product.stock;
    this.createdAt = product.createdAt;
    this.updatedAt = product.updatedAt;
  }
}

export class PaginationResponseDto {
  /**
   * Array of product response objects.
   */
  readonly products: ProductResponseDto[];

  /**
   * Total number of products matching the query (excluding soft-deleted).
   */
  readonly totalItems: number;

  /**
   * Current page number.
   */
  readonly currentPage: number;

  /**
   * Total number of pages.
   */
  readonly totalPages: number;

  /**
   * Number of products per page.
   */
  readonly limit: number;

  /**
   * @param products - Array of ProductResponseDto objects for the current page.
   * @param totalItems - Total number of products across all pages.
   * @param currentPage - The current page number.
   * @param limit - The number of products per page.
   */
  constructor(
    products: ProductResponseDto[],
    totalItems: number,
    currentPage: number,
    limit: number,
  ) {
    this.products = products;
    this.totalItems = totalItems;
    this.currentPage = currentPage;
    this.totalPages = Math.ceil(totalItems / limit);
    this.limit = limit;
  }
}

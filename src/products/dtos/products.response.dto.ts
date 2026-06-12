import { Product } from '../products.model';

/**
 * Response DTO for a single product.
 *
 * Maps the internal Product model to the client-facing response format,
 * decoupling the API contract from the database entity.
 */
export class ProductResponseDto {
  /** Auto-incremented unique identifier. */
  id: number;

  /** Client-provided UUID v4 token. */
  productToken: string;

  /** Product display name. */
  name: string;

  /** Unit price with up to 4 decimal places. */
  price: number;

  /** Available inventory quantity. */
  stock: number;

  /** Timestamp when the product was created. */
  createdAt: Date;

  /** Timestamp when the product was last updated. */
  updatedAt: Date;

  /**
   * @param product - The Product model instance to map from.
   */
  constructor(product: Product) {
    this.id = product.id;
    this.productToken = product.productToken;
    this.name = product.name;
    this.price = product.price;
    this.stock = product.stock;
    this.createdAt = product.createdAt;
    this.updatedAt = product.updatedAt;
  }
}

/**
 * Response DTO for a paginated list of products.
 *
 * Wraps an array of ProductResponseDto with pagination metadata.
 */
export class PaginationResponseDto {
  /** Array of product response objects. */
  products: ProductResponseDto[];

  /** Total number of products matching the query (excluding soft-deleted). */
  totalItems: number;

  /** Current page number. */
  currentPage: number;

  /** Total number of pages. */
  totalPages: number;

  /** Number of products per page. */
  limit: number;

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

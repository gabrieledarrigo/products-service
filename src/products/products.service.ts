import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Product } from './products.model';

/**
 * Service handling the business logic for product operations.
 *
 * Encapsulates all product-related logic including creation, retrieval,
 * pagination, stock updates, and soft-deletion.
 */
@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product)
    // @ts-expect-error: used in Phase 3 when service methods are implemented
    private readonly productModel: typeof Product,
  ) {}
}

import { Controller } from '@nestjs/common';
import { ProductsService } from './products.service';

/**
 * REST controller for product endpoints.
 *
 * Handles HTTP requests, delegates business logic to ProductsService,
 * and returns appropriate responses. Keeps controller logic thin
 * per the convention-over-configuration principle.
 */
@Controller('products')
export class ProductsController {
  // @ts-expect-error: used in Phase 3 when controller endpoints are implemented
  constructor(private readonly productsService: ProductsService) {}
}

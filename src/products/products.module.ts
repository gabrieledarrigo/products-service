import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Product } from './products.model';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';

/**
 * NestJS module for the products domain.
 *
 * Wires together the Product model, ProductsService, and ProductsController.
 */
@Module({
  imports: [SequelizeModule.forFeature([Product])],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}

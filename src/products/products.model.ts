import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  Unique,
  AllowNull,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
} from 'sequelize-typescript';
import { PRODUCT_PRICE_PRECISION, PRODUCT_PRICE_SCALE } from './constants';

/**
 * Sequelize model representing a product in the e-commerce catalog.
 */
@Table({
  tableName: 'products',
  paranoid: true,
  timestamps: true,
  underscored: false,
})
export class Product extends Model {
  /** Auto-incremented unique identifier. */
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  /** Client-provided UUID v4 token, unique across all products including soft-deleted ones. */
  @Unique
  @AllowNull(false)
  @Column(DataType.UUID)
  declare productToken: string;

  /** Product display name. */
  @AllowNull(false)
  @Column(DataType.STRING)
  declare name: string;

  /** Unit price with up to 4 decimal places. */
  @AllowNull(false)
  @Column(DataType.DECIMAL(PRODUCT_PRICE_PRECISION, PRODUCT_PRICE_SCALE))
  declare price: number;

  /** Available inventory quantity. */
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare stock: number;

  /** Timestamp when the product was created. */
  @CreatedAt
  declare createdAt: Date;

  /** Timestamp when the product was last updated. */
  @UpdatedAt
  declare updatedAt: Date;

  /** Timestamp when the product was soft-deleted, null if active. */
  @DeletedAt
  declare deletedAt: Date | null;
}

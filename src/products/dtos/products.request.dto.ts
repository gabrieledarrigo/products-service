import { IsString, IsNotEmpty, IsUUID, IsNumber, IsInt, Min, Max } from 'class-validator';

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
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Max(999999.9999)
  readonly price!: number;

  /**
   * Available inventory quantity, non-negative integer.
   */
  @IsInt()
  @Min(0)
  readonly stock!: number;
}

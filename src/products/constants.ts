/**
 * Total number of digits allowed for the price column.
 */
export const PRODUCT_PRICE_PRECISION = 10;

/**
 * Number of decimal places allowed for the price.
 */
export const PRODUCT_PRICE_SCALE = 4;

/**
 * Minimum allowed price.
 */
export const MIN_PRODUCT_PRICE = 0;

/**
 * Maximum allowed price, derived from DECIMAL(10, 4): 6 integer digits and 4 decimals.
 */
export const MAX_PRODUCT_PRICE = 999999.9999;

/**
 * Minimum allowed stock quantity.
 */
export const MIN_PRODUCT_STOCK = 0;

/**
 * Default page number when none is provided.
 */
export const DEFAULT_PAGE = 1;

/**
 * Default number of items per page when none is provided.
 */
export const DEFAULT_PAGE_LIMIT = 20;

/**
 * Minimum allowed number of items per page.
 */
export const MIN_PAGE_LIMIT = 1;

/**
 * Maximum allowed number of items per page.
 */
export const MAX_PAGE_LIMIT = 100;

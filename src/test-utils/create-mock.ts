/**
 * Recursively makes all properties of T optional.
 */
export type PartialDeep<T> = T extends object
  ? T extends Array<infer U>
    ? Array<PartialDeep<U>>
    : { [K in keyof T]?: PartialDeep<T[K]> }
  : T;

/**
 * Creates a mock object of type T from a partial deep representation.
 *
 * Use this instead of type casting when creating mock objects in tests.
 *
 * @param values - Optional partial values to populate the mock with.
 * @returns A mock object typed as T.
 */
export function createMock<T extends object>(values?: PartialDeep<T>): T {
  return (values ?? {}) as T;
}

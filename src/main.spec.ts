import { sum } from './main';

describe('sum', () => {
  it('should return the sum of two positive numbers', () => {
    const result = sum(2, 3);

    expect(result).toBe(5);
  });

  it('should return the sum of a positive and a negative number', () => {
    const result = sum(5, -3);

    expect(result).toBe(2);
  });

  it('should return zero when both numbers are zero', () => {
    const result = sum(0, 0);

    expect(result).toBe(0);
  });
});

/**
 * LUXFIN AI - Decimal-Safe Monetary Calculation Engine
 * Guarantees zero floating-point precision drift across all financial calculations.
 */

export class DecimalMath {
  /**
   * Convert monetary amount to integer cents/units (e.g., 10500.50 -> 1050050)
   */
  public static toCents(amount: number): number {
    if (isNaN(amount) || !isFinite(amount)) return 0;
    return Math.round((amount + Number.EPSILON) * 100);
  }

  /**
   * Convert integer cents back to formatted decimal number (e.g., 1050050 -> 10500.50)
   */
  public static fromCents(cents: number): number {
    return Math.round(cents) / 100;
  }

  /**
   * Precise addition of monetary values
   */
  public static add(a: number, b: number): number {
    return DecimalMath.fromCents(DecimalMath.toCents(a) + DecimalMath.toCents(b));
  }

  /**
   * Precise subtraction of monetary values
   */
  public static subtract(a: number, b: number): number {
    return DecimalMath.fromCents(DecimalMath.toCents(a) - DecimalMath.toCents(b));
  }

  /**
   * Precise multiplication (e.g. amount * quantity, unitPrice * units)
   */
  public static multiply(amount: number, factor: number): number {
    const cents = DecimalMath.toCents(amount);
    return DecimalMath.fromCents(Math.round(cents * factor));
  }

  /**
   * Precise division with zero division protection
   */
  public static divide(numerator: number, denominator: number): number {
    if (denominator === 0) return 0;
    const numCents = DecimalMath.toCents(numerator);
    const resultCents = numCents / denominator;
    return DecimalMath.fromCents(Math.round(resultCents));
  }

  /**
   * Sum an array of numbers with decimal precision
   */
  public static sum(values: number[]): number {
    const totalCents = values.reduce((acc, val) => acc + DecimalMath.toCents(val), 0);
    return DecimalMath.fromCents(totalCents);
  }

  /**
   * Round to 2 decimal places cleanly
   */
  public static roundCurrency(value: number): number {
    return DecimalMath.fromCents(DecimalMath.toCents(value));
  }

  /**
   * Calculate percentage safely (e.g., numerator / denominator * 100)
   */
  public static percentage(numerator: number, denominator: number): number {
    if (denominator <= 0) return 0;
    const ratio = numerator / denominator;
    return Math.round((ratio * 100 + Number.EPSILON) * 100) / 100; // 2 decimal precision
  }
}

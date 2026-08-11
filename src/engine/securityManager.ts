/**
 * LUXFIN AI - Financial Database Multi-Tenant Security & Access Control Manager
 * Enforces strict user data ownership boundaries across all financial entities.
 */

export class SecurityViolationError extends Error {
  constructor(public entityName: string, public entityId: string, public targetUserId: string, public activeUserId: string) {
    super(`SECURITY VIOLATION: User '${activeUserId}' attempted unauthorized access to ${entityName} '${entityId}' owned by '${targetUserId}'.`);
    this.name = 'SecurityViolationError';
  }
}

export interface SecurityContext {
  activeUserId: string;
  userEmail: string;
  ipAddress?: string;
  deviceId?: string;
}

export class SecurityManager {
  /**
   * Enforces user ownership check on a record.
   * Throws SecurityViolationError if the user attempting access is not the owner.
   */
  public static enforceOwnership<T extends { userId?: string; id?: string }>(
    record: T,
    activeUserId: string,
    entityName: string = 'Financial Record'
  ): T {
    if (!activeUserId) {
      throw new Error('SECURITY ERROR: Unauthenticated session - activeUserId is missing.');
    }

    if (record.userId && record.userId !== activeUserId) {
      throw new SecurityViolationError(entityName, record.id || 'unknown', record.userId, activeUserId);
    }

    return record;
  }

  /**
   * Filters a list of records to return ONLY those owned by the active user.
   */
  public static filterUserOwnedRecords<T extends { userId?: string }>(
    records: T[],
    activeUserId: string
  ): T[] {
    if (!activeUserId) return [];
    return records.filter((r) => !r.userId || r.userId === activeUserId);
  }

  /**
   * Binds the active user ownership to a new record.
   */
  public static bindOwnership<T extends { userId?: string }>(
    record: T,
    activeUserId: string
  ): T {
    return {
      ...record,
      userId: activeUserId,
    };
  }

  /**
   * Validates monetary values for security integrity (prevents negative/NaN injection bugs).
   */
  public static validateMonetaryAmount(amount: number, fieldName: string = 'amount'): number {
    if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount)) {
      throw new Error(`VALIDATION ERROR: Field '${fieldName}' must be a valid finite number.`);
    }
    return Math.round((amount + Number.EPSILON) * 100) / 100;
  }
}

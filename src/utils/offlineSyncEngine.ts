import { storage } from './storage';
import { logger } from '../services/loggerService';

export type OfflineActionType =
  | 'CREATE_TRANSACTION'
  | 'UPDATE_TRANSACTION'
  | 'DELETE_TRANSACTION'
  | 'UPDATE_ACCOUNT'
  | 'UPDATE_BUDGET'
  | 'UPDATE_GOAL'
  | 'UPDATE_BILL'
  | 'UPDATE_DEBT'
  | 'UPDATE_INVESTMENT';

export type SyncStateStatus = 'ONLINE_SYNCED' | 'SYNCING' | 'OFFLINE_QUEUE' | 'CONFLICT_DETECTED';

export interface OfflineQueueItem {
  id: string;
  actionType: OfflineActionType;
  entityId?: string;
  payload: any;
  timestamp: string; // ISO string
  synced: boolean;
  hasConflict?: boolean;
  conflictDetails?: {
    localPayload: any;
    serverPayload: any;
    serverTimestamp: string;
    conflictReason: string;
  };
}

export interface SyncEngineStatus {
  isOnline: boolean;
  status: SyncStateStatus;
  queuedCount: number;
  conflictCount: number;
  lastSyncedAt: string | null;
}

const STORAGE_KEY = 'luxfin_offline_queue_v1';
const LAST_SYNC_KEY = 'luxfin_last_synced_at';

class OfflineSyncEngine {
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private queue: OfflineQueueItem[] = [];
  private listeners: Set<(status: SyncEngineStatus) => void> = new Set();
  private status: SyncStateStatus = 'ONLINE_SYNCED';
  private lastSyncedAt: string | null = null;

  constructor() {
    this.loadQueue();
    this.lastSyncedAt = localStorage.getItem(LAST_SYNC_KEY);
    this.setupListeners();
    this.updateStatus();
  }

  private loadQueue() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        this.queue = JSON.parse(data);
      }
    } catch (e) {
      logger.error('SyncEngine', 'Failed to load offline queue', e);
      this.queue = [];
    }
  }

  private saveQueue() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
    } catch (e) {
      logger.error('SyncEngine', 'Failed to save offline queue', e);
    }
  }

  private setupListeners() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        logger.info('SyncEngine', 'Network connection restored');
        this.isOnline = true;
        this.updateStatus();
        this.autoSync();
      });

      window.addEventListener('offline', () => {
        logger.warn('SyncEngine', 'Network connection lost. Entering Offline Mode.');
        this.isOnline = false;
        this.updateStatus();
      });
    }
  }

  private updateStatus() {
    const unSyncedCount = this.getUnsyncedCount();
    const conflictCount = this.getConflictCount();

    if (!this.isOnline) {
      this.status = 'OFFLINE_QUEUE';
    } else if (conflictCount > 0) {
      this.status = 'CONFLICT_DETECTED';
    } else if (unSyncedCount > 0) {
      this.status = 'OFFLINE_QUEUE';
    } else {
      this.status = 'ONLINE_SYNCED';
    }

    this.notifyListeners();
  }

  public getStatus(): SyncEngineStatus {
    return {
      isOnline: this.isOnline,
      status: this.status,
      queuedCount: this.getUnsyncedCount(),
      conflictCount: this.getConflictCount(),
      lastSyncedAt: this.lastSyncedAt,
    };
  }

  public getQueue(): OfflineQueueItem[] {
    return [...this.queue];
  }

  public getUnsyncedCount(): number {
    return this.queue.filter((q) => !q.synced).length;
  }

  public getConflictCount(): number {
    return this.queue.filter((q) => q.hasConflict).length;
  }

  public subscribe(callback: (status: SyncEngineStatus) => void): () => void {
    this.listeners.add(callback);
    callback(this.getStatus());
    return () => this.listeners.delete(callback);
  }

  private notifyListeners() {
    const st = this.getStatus();
    this.listeners.forEach((fn) => fn(st));
  }

  /**
   * Queue a mutation item when offline or perform optimistic local write
   */
  public queueAction(actionType: OfflineActionType, payload: any, entityId?: string): OfflineQueueItem {
    const newItem: OfflineQueueItem = {
      id: 'sync_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      actionType,
      entityId,
      payload,
      timestamp: new Date().toISOString(),
      synced: false,
    };

    this.queue.push(newItem);
    this.saveQueue();

    logger.info('SyncEngine', `Queued offline action: ${actionType}`, newItem);

    if (this.isOnline) {
      this.autoSync();
    } else {
      this.updateStatus();
    }

    return newItem;
  }

  /**
   * Process all pending queued items with conflict detection
   */
  public async autoSync(): Promise<{ success: boolean; syncedCount: number; conflictCount: number }> {
    if (!this.isOnline) {
      this.updateStatus();
      return { success: false, syncedCount: 0, conflictCount: this.getConflictCount() };
    }

    const unsynced = this.queue.filter((q) => !q.synced && !q.hasConflict);
    if (unsynced.length === 0) {
      this.updateStatus();
      return { success: true, syncedCount: 0, conflictCount: this.getConflictCount() };
    }

    this.status = 'SYNCING';
    this.notifyListeners();

    let syncedCount = 0;
    let conflictCount = 0;

    for (const item of unsynced) {
      // Simulate network verification & conflict check
      const conflictDetected = this.detectConflict(item);

      if (conflictDetected.hasConflict) {
        item.hasConflict = true;
        item.conflictDetails = conflictDetected.details;
        conflictCount++;
        logger.warn('SyncEngine', `Conflict detected for item ${item.id}`, item.conflictDetails);
      } else {
        // Execute sync write to local storage engine
        this.applyToLocalStorage(item);
        item.synced = true;
        syncedCount++;
      }
    }

    this.saveQueue();
    this.lastSyncedAt = new Date().toISOString();
    localStorage.setItem(LAST_SYNC_KEY, this.lastSyncedAt);

    this.updateStatus();
    return { success: conflictCount === 0, syncedCount, conflictCount };
  }

  /**
   * Conflict Detection Logic
   * Checks if server data or another state was modified concurrently
   */
  private detectConflict(item: OfflineQueueItem): { hasConflict: boolean; details?: any } {
    const state = storage.getState();

    // Example conflict check for UPDATE_TRANSACTION:
    if (item.actionType === 'UPDATE_TRANSACTION' && item.entityId) {
      const existingTx = state.transactions.find((t) => t.id === item.entityId);
      if (existingTx) {
        // Check if existing transaction has a newer date or amount difference from initial baseline
        const mockServerTimestamp = new Date(Date.now() - 1000 * 60 * 5).toISOString(); // Server update 5 mins ago
        if (existingTx.amount !== item.payload.amount && Math.random() < 0.25) { // 25% chance of conflict simulation if editing modified item
          return {
            hasConflict: true,
            details: {
              localPayload: item.payload,
              serverPayload: existingTx,
              serverTimestamp: mockServerTimestamp,
              conflictReason: `Nilai transaksi di server (${existingTx.amount}) berbeda dengan draf offline (${item.payload.amount}).`,
            },
          };
        }
      }
    }

    return { hasConflict: false };
  }

  /**
   * Apply queued action to Storage Engine
   */
  private applyToLocalStorage(item: OfflineQueueItem) {
    try {
      if (item.actionType === 'CREATE_TRANSACTION') {
        storage.addTransaction(item.payload);
      } else if (item.actionType === 'UPDATE_TRANSACTION') {
        storage.updateTransaction(item.payload.id || item.entityId, item.payload);
      } else if (item.actionType === 'DELETE_TRANSACTION') {
        storage.deleteTransaction(item.payload.id || item.entityId);
      }
    } catch (err) {
      logger.error('SyncEngine', `Error applying ${item.actionType}`, err);
    }
  }

  /**
   * Safe Conflict Resolution Handler
   * Allows user to select:
   * 1. USE_LOCAL: Accept offline modifications
   * 2. USE_SERVER: Discard offline modifications and keep server version
   * 3. MERGE: Combine fields safely
   */
  public resolveConflict(
    itemId: string,
    resolution: 'USE_LOCAL' | 'USE_SERVER' | 'MERGE'
  ) {
    const item = this.queue.find((q) => q.id === itemId);
    if (!item || !item.hasConflict) return;

    logger.info('SyncEngine', `Resolving conflict for ${itemId} with option ${resolution}`);

    if (resolution === 'USE_LOCAL') {
      this.applyToLocalStorage(item);
      item.synced = true;
      item.hasConflict = false;
      delete item.conflictDetails;
    } else if (resolution === 'USE_SERVER') {
      // Keep server data, mark queue item as resolved/dropped
      item.synced = true;
      item.hasConflict = false;
      delete item.conflictDetails;
    } else if (resolution === 'MERGE') {
      // Combine local notes/category with server amount
      if (item.conflictDetails) {
        const mergedPayload = {
          ...item.conflictDetails.serverPayload,
          ...item.payload,
          notes: `${item.payload.notes || ''} [Tersinkronisasi Gabungan Offline]`.trim(),
        };
        item.payload = mergedPayload;
        this.applyToLocalStorage(item);
      }
      item.synced = true;
      item.hasConflict = false;
      delete item.conflictDetails;
    }

    this.saveQueue();
    this.updateStatus();
  }

  /**
   * Clear synced items from queue history
   */
  public clearSyncedQueue() {
    this.queue = this.queue.filter((q) => !q.synced || q.hasConflict);
    this.saveQueue();
    this.updateStatus();
  }

  /**
   * Force simulated conflict for testing UI
   */
  public simulateConflict() {
    const mockItem: OfflineQueueItem = {
      id: 'conflict_' + Date.now(),
      actionType: 'UPDATE_TRANSACTION',
      entityId: 'tx_sample',
      payload: {
        id: 'tx_sample',
        amount: 500000,
        notes: 'Beli Peralatan Kantor (Offline Draft)',
        categoryId: 'cat_office',
      },
      timestamp: new Date().toISOString(),
      synced: false,
      hasConflict: true,
      conflictDetails: {
        localPayload: {
          amount: 500000,
          notes: 'Beli Peralatan Kantor (Offline Draft)',
        },
        serverPayload: {
          amount: 650000,
          notes: 'Beli Peralatan Kantor & Printer (Diubah di Web)',
        },
        serverTimestamp: new Date(Date.now() - 3600000).toISOString(),
        conflictReason: 'Jumlah & Catatan transaksi telah diperbarui di perangkat lain saat Anda offline.',
      },
    };

    this.queue.push(mockItem);
    this.saveQueue();
    this.updateStatus();
  }
}

export const offlineSyncEngine = new OfflineSyncEngine();

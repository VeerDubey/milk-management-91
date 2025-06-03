
import Dexie, { Table } from 'dexie';
import { Customer, Product, Order, Invoice, Payment, TrackSheet } from '@/types';

export interface SyncableEntity {
  id: string;
  lastModified: number;
  isDeleted?: boolean;
  syncStatus: 'pending' | 'synced' | 'conflict';
  centerId?: string;
}

export interface CustomerEntity extends Customer, SyncableEntity {}
export interface ProductEntity extends Product, SyncableEntity {}
export interface OrderEntity extends Order, SyncableEntity {}
export interface InvoiceEntity extends Invoice, SyncableEntity {}
export interface PaymentEntity extends Payment, SyncableEntity {}
export interface TrackSheetEntity extends TrackSheet, SyncableEntity {}

export class OfflineDatabase extends Dexie {
  customers!: Table<CustomerEntity>;
  products!: Table<ProductEntity>;
  orders!: Table<OrderEntity>;
  invoices!: Table<InvoiceEntity>;
  payments!: Table<PaymentEntity>;
  trackSheets!: Table<TrackSheetEntity>;
  syncQueue!: Table<{ id: string; operation: string; entity: string; data: any; timestamp: number }>;

  constructor() {
    super('VikasMilkDB');
    
    this.version(1).stores({
      customers: '++id, name, phone, area, centerId, lastModified, syncStatus',
      products: '++id, name, category, centerId, lastModified, syncStatus',
      orders: '++id, customerId, date, centerId, lastModified, syncStatus',
      invoices: '++id, customerId, number, date, centerId, lastModified, syncStatus',
      payments: '++id, customerId, date, centerId, lastModified, syncStatus',
      trackSheets: '++id, date, vehicleId, centerId, lastModified, syncStatus',
      syncQueue: '++id, timestamp, operation, entity'
    });
  }

  async addWithSync<T extends SyncableEntity>(table: Table<T>, data: Omit<T, 'id' | 'lastModified' | 'syncStatus'>): Promise<T> {
    const entity: T = {
      ...data,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      lastModified: Date.now(),
      syncStatus: 'pending',
      centerId: localStorage.getItem('currentCenterId') || 'default'
    } as T;

    await table.add(entity);
    await this.queueSync('create', table.name, entity);
    return entity;
  }

  async updateWithSync<T extends SyncableEntity>(table: Table<T>, id: string, updates: Partial<Omit<T, 'id'>>): Promise<void> {
    const updateData = {
      ...updates,
      lastModified: Date.now(),
      syncStatus: 'pending' as const
    };

    await table.update(id, updateData);
    await this.queueSync('update', table.name, { id, ...updateData });
  }

  async deleteWithSync<T extends SyncableEntity>(table: Table<T>, id: string): Promise<void> {
    const deleteData = {
      isDeleted: true,
      lastModified: Date.now(),
      syncStatus: 'pending' as const
    };

    await table.update(id, deleteData);
    await this.queueSync('delete', table.name, { id });
  }

  private async queueSync(operation: string, entity: string, data: any): Promise<void> {
    await this.syncQueue.add({
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      operation,
      entity,
      data,
      timestamp: Date.now()
    });
  }

  async getPendingSyncItems() {
    return await this.syncQueue.orderBy('timestamp').toArray();
  }

  async clearSyncQueue() {
    await this.syncQueue.clear();
  }
}

export const db = new OfflineDatabase();

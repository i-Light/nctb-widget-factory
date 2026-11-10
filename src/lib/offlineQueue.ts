import Dexie, { type EntityTable } from 'dexie';

export interface ProgressSyncEvent {
  id?: number;
  studentId: string;
  lessonId: string;
  score: number;
  streakDay: number;
  completedAtIso: string;
  synced: 0 | 1;
}

export class WidgetFactoryOfflineDB extends Dexie {
  outbox!: EntityTable<ProgressSyncEvent, 'id'>;

  constructor() {
    super('nctb_widget_factory_offline');
    this.version(1).stores({
      outbox: '++id, lessonId, synced',
    });
  }
}

export const offlineDb = new WidgetFactoryOfflineDB();

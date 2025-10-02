import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';

export interface OfflineAction {
  id: string;
  action: string;
  data: any;
  timestamp: number;
  retryCount?: number;
  completed?: boolean;
}

export class OfflineSyncService {
  private sqlite: SQLiteConnection;
  private dbConnection?: SQLiteDBConnection;
  private isInitialized = false;
  private pendingUploads: OfflineAction[] = [];

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);

    if (Capacitor.isNativePlatform()) {
      this.initializeDatabase();
    }
  }

  /**
   * Initialize SQLite database for offline storage
   */
  private async initializeDatabase() {
    try {
      if (this.isInitialized) return;

      // Create/open database
      this.dbConnection = await this.sqlite.createConnection('anand_saathi_db', false, 'no-encryption', 1, false);

      // Open the database connection
      await this.dbConnection.open();

      // Create offline actions table
      await this.dbConnection.execute(`CREATE TABLE IF NOT EXISTS offline_actions (
        id TEXT PRIMARY KEY,
        action TEXT NOT NULL,
        data TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        retry_count INTEGER DEFAULT 0,
        completed INTEGER DEFAULT 0
      )`);

      // Create field data table for offline storage
      await this.dbConnection.execute(`CREATE TABLE IF NOT EXISTS offline_field_data (
        id TEXT PRIMARY KEY,
        field_id TEXT,
        data_type TEXT,
        data TEXT NOT NULL,
        last_modified INTEGER,
        server_synced INTEGER DEFAULT 0
      )`);

      this.isInitialized = true;
      console.log('📱 Offline database initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize offline database:', error);
    }
  }

  /**
   * Queue an action for offline execution when online
   */
  async queueOfflineAction(action: string, data: any): Promise<boolean> {
    try {
      if (!Capacitor.isNativePlatform()) {
        // Browser fallback - use localStorage
        return this.queueOfflineActionBrowser(action, data);
      }

      if (!this.isInitialized) {
        await this.initializeDatabase();
      }

      const offlineAction: OfflineAction = {
        id: `${action}_${Date.now()}_${Math.random()}`,
        action,
        data,
        timestamp: Date.now()
      };

      // Store in SQLite
      await this.dbConnection!.execute(
        'INSERT INTO offline_actions (id, action, data, timestamp) VALUES (?, ?, ?, ?)',
        [offlineAction.id, offlineAction.action, JSON.stringify(offlineAction.data), offlineAction.timestamp]
      );

      console.log(`📱 Queued offline action: ${action}`);
      return true;

    } catch (error) {
      console.error('❌ Failed to queue offline action:', error);
      return false;
    }
  }

  /**
   * Browser fallback for offline queuing using localStorage
   */
  private async queueOfflineActionBrowser(action: string, data: any): Promise<boolean> {
    try {
      const offlineActions = JSON.parse(localStorage.getItem('anand_saathi_offline_actions') || '[]');
      const offlineAction: OfflineAction = {
        id: `${action}_${Date.now()}_${Math.random()}`,
        action,
        data,
        timestamp: Date.now()
      };

      offlineActions.push(offlineAction);
      localStorage.setItem('anand_saathi_offline_actions', JSON.stringify(offlineActions));

      console.log(`🌐 Queued offline action in browser: ${action}`);
      return true;

    } catch (error) {
      console.error('❌ Failed to queue offline action in browser:', error);
      return false;
    }
  }

  /**
   * Sync pending actions when back online
   */
  async syncPendingActions(): Promise<{ synced: number, failed: number }> {
    const result = { synced: 0, failed: 0 };

    try {
      if (!Capacitor.isNativePlatform()) {
        return this.syncPendingActionsBrowser();
      }

      if (!this.isInitialized) {
        await this.initializeDatabase();
      }

      // Get pending actions
      const pending = await this.dbConnection!.query(
        'SELECT * FROM offline_actions WHERE completed = 0 ORDER BY timestamp ASC'
      );

      for (const row of pending.values || []) {
        try {
          const action: OfflineAction = {
            id: row.id,
            action: row.action,
            data: JSON.parse(row.data),
            timestamp: row.timestamp,
            retryCount: row.retry_count || 0
          };

          const success = await this.executeAction(action);

          if (success) {
            // Mark as completed
            await this.dbConnection!.execute(
              'UPDATE offline_actions SET completed = 1 WHERE id = ?',
              [action.id]
            );
            result.synced++;
          } else {
            // Increment retry count
            await this.dbConnection!.execute(
              'UPDATE offline_actions SET retry_count = retry_count + 1 WHERE id = ?',
              [action.id]
            );
            result.failed++;
          }
        } catch (actionError) {
          console.error('❌ Action execution failed:', actionError);
          result.failed++;
        }
      }

    } catch (error) {
      console.error('❌ Sync failed:', error);
      result.failed++;
    }

    console.log(`📱 Sync complete: ${result.synced} synced, ${result.failed} failed`);
    return result;
  }

  /**
   * Sync pending actions in browser
   */
  private async syncPendingActionsBrowser(): Promise<{ synced: number, failed: number }> {
    const result = { synced: 0, failed: 0 };

    try {
      const offlineActions = JSON.parse(localStorage.getItem('anand_saathi_offline_actions') || '[]');
      const remainingActions: OfflineAction[] = [];

      for (const action of offlineActions) {
        try {
          const success = await this.executeAction(action);
          if (success) {
            result.synced++;
          } else {
            remainingActions.push(action);
            result.failed++;
          }
        } catch (actionError) {
          console.error('❌ Action execution failed:', actionError);
          remainingActions.push(action);
          result.failed++;
        }
      }

      // Save remaining actions back to localStorage
      localStorage.setItem('anand_saathi_offline_actions', JSON.stringify(remainingActions));

    } catch (error) {
      console.error('❌ Browser sync failed:', error);
    }

    return result;
  }

  /**
   * Execute a queued action
   */
  private async executeAction(action: OfflineAction): Promise<boolean> {
    try {
      // Import services dynamically to avoid circular dependencies
      const { communityDataService } = await import('../services/integrations/CommunityDataService');

      switch (action.action) {
        case 'submit_field_data':
          const result = await communityDataService.submitFarmData(action.data);
          return result.success;

        case 'register_field':
          const fieldResult = await communityDataService.submitFarmData({
            farmer_id: action.data.farmer_id,
            field_id: action.data.field_id,
            data_type: 'land_record',
            data: action.data.field_data,
            verification_level: 'basic',
            verification_status: 'pending',
            quality_score: 50
          });
          return fieldResult.success;

        case 'submit_photos':
          // Handle photo uploads
          console.log('📸 Photo upload action:', action);
          return true; // Placeholder - implement photo upload

        default:
          console.warn(`⚠️ Unknown action type: ${action.action}`);
          return false;
      }
    } catch (error) {
      console.error(`❌ Action execution failed for ${action.action}:`, error);
      return false;
    }
  }

  /**
   * Store field data locally for offline access
   */
  async storeFieldDataLocally(fieldId: string, dataType: string, data: any): Promise<void> {
    try {
      if (!Capacitor.isNativePlatform()) {
        return this.storeFieldDataBrowser(fieldId, dataType, data);
      }

      if (!this.isInitialized) {
        await this.initializeDatabase();
      }

      const id = `${fieldId}_${dataType}_${Date.now()}`;

      await this.dbConnection!.execute(
        'INSERT OR REPLACE INTO offline_field_data (id, field_id, data_type, data, last_modified, server_synced) VALUES (?, ?, ?, ?, ?, ?)',
        [id, fieldId, dataType, JSON.stringify(data), Date.now(), 0]
      );

    } catch (error) {
      console.error('❌ Failed to store field data locally:', error);
    }
  }

  /**
   * Browser version of local field data storage
   */
  private async storeFieldDataBrowser(fieldId: string, dataType: string, data: any): Promise<void> {
    try {
      const fieldData = JSON.parse(localStorage.getItem('anand_saathi_field_data') || '{}');
      fieldData[`${fieldId}_${dataType}`] = {
        data,
        lastModified: Date.now(),
        serverSynced: false
      };
      localStorage.setItem('anand_saathi_field_data', JSON.stringify(fieldData));
    } catch (error) {
      console.error('❌ Failed to store field data in browser:', error);
    }
  }

  /**
   * Get locally stored field data
   */
  async getLocalFieldData(fieldId?: string): Promise<any[]> {
    try {
      if (!Capacitor.isNativePlatform()) {
        return this.getLocalFieldDataBrowser(fieldId);
      }

      if (!this.isInitialized) {
        await this.initializeDatabase();
      }

      let query = 'SELECT * FROM offline_field_data';
      let params: any[] = [];

      if (fieldId) {
        query += ' WHERE field_id = ?';
        params = [fieldId];
      }

      query += ' ORDER BY last_modified DESC';

      const result = await this.dbConnection!.query(query, params);

      return (result.values || []).map(row => ({
        id: row.id,
        fieldId: row.field_id,
        dataType: row.data_type,
        data: JSON.parse(row.data),
        lastModified: row.last_modified,
        serverSynced: Boolean(row.server_synced)
      }));

    } catch (error) {
      console.error('❌ Failed to get local field data:', error);
      return [];
    }
  }

  /**
   * Browser version of getting local field data
   */
  private async getLocalFieldDataBrowser(fieldId?: string): Promise<any[]> {
    try {
      const fieldData = JSON.parse(localStorage.getItem('anand_saathi_field_data') || '{}');
      const results: any[] = [];

      for (const [key, value] of Object.entries(fieldData)) {
        if (!fieldId || key.startsWith(`${fieldId}_`)) {
          const [fieldIdFromKey, dataType] = key.split('_', 2);
          results.push({
            id: key,
            fieldId: fieldIdFromKey,
            dataType,
            data: (value as any).data,
            lastModified: (value as any).lastModified,
            serverSynced: (value as any).serverSynced
          });
        }
      }

      return results.sort((a, b) => b.lastModified - a.lastModified);
    } catch (error) {
      console.error('❌ Failed to get field data from browser:', error);
      return [];
    }
  }

  /**
   * Check if there's any offline data pending sync
   */
  async hasPendingSync(): Promise<boolean> {
    try {
      if (!Capacitor.isNativePlatform()) {
        const actions = JSON.parse(localStorage.getItem('anand_saathi_offline_actions') || '[]');
        return actions.length > 0;
      }

      if (!this.isInitialized) {
        await this.initializeDatabase();
      }

      const result = await this.dbConnection!.query(
        'SELECT COUNT(*) as count FROM offline_actions WHERE completed = 0'
      );

      return (result.values?.[0]?.count || 0) > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Clear completed offline actions (cleanup)
   */
  async clearCompletedActions(): Promise<void> {
    try {
      if (!Capacitor.isNativePlatform()) {
        // For browser, we already clean up during sync
        return;
      }

      if (!this.isInitialized) {
        await this.initializeDatabase();
      }

      // Keep last 100 completed actions for history
      await this.dbConnection!.execute(`
        DELETE FROM offline_actions
        WHERE id NOT IN (
          SELECT id FROM offline_actions
          WHERE completed = 1
          ORDER BY timestamp DESC
          LIMIT 100
        )`, []);
    } catch (error) {
      console.error('❌ Failed to clear completed actions:', error);
    }
  }
}

export const offlineSyncService = new OfflineSyncService();

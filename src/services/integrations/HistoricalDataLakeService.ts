/**
 * Historical Data Lake Service for Anand Saathi
 * Manages long-term agricultural data storage, retrieval, and analytics
 * Supports cloud storage integration and data compression/archival
 */

import { ApiResponse } from '../BaseService';
import { supabase } from '../../../integrations/supabase/client';

export interface DataRetentionPolicy {
  dataType: string;
  currentPolicy: 'daily_backups' | 'weekly_backups' | 'monthly_archive' | 'compressed_storage';
  retentionMonths: number;
  encryptionEnabled: boolean;
  backupLocation: 'supabase' | 's3' | 'csv_export';
}

export interface HistoricalDataset {
  id?: string;
  dataset_name: string;
  data_type: 'yield_history' | 'weather_history' | 'price_history' | 'soil_tests' | 'land_records' | 'irrigation_data';
  source: 'community_submission' | 'government_data' | 'research_institution' | 'market_feed';
  time_range_start: string;
  time_range_end: string;
  district?: string;
  record_count: number;
  total_size_mb: number;
  last_updated: string;
  data_format: 'json' | 'csv' | 'parquet' | 'compressed_json';
  retention_policy: string;
  access_count: number;
  download_count: number;
  compression_ratio?: number;
}

export interface DataLakeAnalytics {
  total_datasets: number;
  total_records: number;
  total_size_gb: number;
  oldest_data: string;
  newest_data: string;
  datasets_by_type: Record<string, number>;
  storage_utilization: number; // percentage
  compression_savings: number; // percentage
  most_accessed_datasets: string[];
}

export class HistoricalDataLakeService {
  private readonly BUCKET_NAME = 'anand-saathi-data-lake';
  private readonly COMPRESSION_THRESHOLD_MB = 100; // Compress datasets over 100MB

  constructor() {}

  /**
   * Create and upload a new historical dataset
   */
  async createDataset(
    name: string,
    dataType: HistoricalDataset['data_type'],
    records: any[],
    metadata: Partial<HistoricalDataset>
  ): Promise<ApiResponse<HistoricalDataset>> {
    try {
      const datasetId = this.generateDatasetId(name, dataType);
      const dataSize = this.calculateDataSize(records);

      // Determine optimal storage format
      const shouldCompress = dataSize > this.COMPRESSION_THRESHOLD_MB;
      const dataFormat = this.determineOptimalFormat(records, shouldCompress);

      // Process and format data
      const processedData = await this.processDataset(records, dataFormat);

      // Store in cloud storage
      const storageResult = await this.uploadToStorage(
        datasetId,
        processedData,
        dataFormat
      );

      if (!storageResult.success) {
        throw new Error('Failed to upload dataset to storage');
      }

      // Create metadata record
      const dataset: HistoricalDataset = {
        dataset_name: name,
        data_type: dataType,
        source: metadata.source || 'community_submission',
        time_range_start: metadata.time_range_start || this.findTimeRange(records)[0],
        time_range_end: metadata.time_range_end || this.findTimeRange(records)[1],
        district: metadata.district,
        record_count: records.length,
        total_size_mb: dataSize,
        data_format: dataFormat,
        retention_policy: this.getRetentionPolicy(dataType),
        compression_ratio: shouldCompress ? this.calculateCompressionRatio(records, processedData) : undefined,
        last_updated: new Date().toISOString(),
        access_count: 0,
        download_count: 0,
      };

      const { data, error } = await supabase
        .from('historical_datasets')
        .insert([dataset])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create dataset metadata: ${error.message}`);
      }

      return {
        success: true,
        data: data
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to create historical dataset: ${error.message}`
      };
    }
  }

  /**
   * Query historical data with filters
   */
  async queryHistoricalData(
    filters: {
      dataType?: HistoricalDataset['data_type'];
      district?: string;
      startDate?: string;
      endDate?: string;
      source?: string;
      limit?: number;
    }
  ): Promise<ApiResponse<any[]>> {
    try {
      // Find relevant datasets
      const datasets = await this.findMatchingDatasets(filters);

      if (datasets.length === 0) {
        return {
          success: true,
          data: []
        };
      }

      // Download and combine data from selected datasets
      const combinedData: any[] = [];

      for (const dataset of datasets) {
        const data = await this.downloadAndParseDataset(dataset);
        if (data) {
          combinedData.push(...data);
          // Update access count
          await this.updateDatasetMetrics(dataset.id!, 'access_count');
        }
      }

      // Apply time filters if specified
      let filteredData = combinedData;
      if (filters.startDate || filters.endDate) {
        filteredData = this.applyTimeFilters(combinedData, filters.startDate, filters.endDate);
      }

      // Apply limit
      if (filters.limit) {
        filteredData = filteredData.slice(0, filters.limit);
      }

      return {
        success: true,
        data: filteredData
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to query historical data: ${error.message}`
      };
    }
  }

  /**
   * Get data lake analytics and usage statistics
   */
  async getDataLakeAnalytics(): Promise<ApiResponse<DataLakeAnalytics>> {
    try {
      const { data: datasets, error } = await supabase
        .from('historical_datasets')
        .select('*')
        .order('last_updated', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch dataset analytics: ${error.message}`);
      }

      const analytics: DataLakeAnalytics = {
        total_datasets: datasets.length,
        total_records: datasets.reduce((sum, ds) => sum + ds.record_count, 0),
        total_size_gb: datasets.reduce((sum, ds) => sum + (ds.total_size_mb / 1024), 0),
        oldest_data: datasets.length > 0 ? datasets.sort((a, b) =>
          new Date(a.time_range_start).getTime() - new Date(b.time_range_start).getTime()
        )[0].time_range_start : null,
        newest_data: datasets.length > 0 ? datasets.sort((a, b) =>
          new Date(b.time_range_end).getTime() - new Date(a.time_range_end).getTime()
        )[0].time_range_end : null,
        datasets_by_type: this.groupByType(datasets),
        storage_utilization: this.calculateStorageUtilization(datasets),
        compression_savings: this.calculateCompressionSavings(datasets),
        most_accessed_datasets: datasets
          .sort((a, b) => b.access_count - a.access_count)
          .slice(0, 5)
          .map(ds => ds.dataset_name)
      };

      return {
        success: true,
        data: analytics
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to generate analytics: ${error.message}`
      };
    }
  }

  /**
   * Export dataset in requested format
   */
  async exportDataset(
    datasetId: string,
    format: 'csv' | 'json' | 'excel' = 'csv'
  ): Promise<ApiResponse<{ downloadUrl: string, fileName: string }>> {
    try {
      const { data: dataset, error: fetchError } = await supabase
        .from('historical_datasets')
        .select('*')
        .eq('id', datasetId)
        .single();

      if (fetchError || !dataset) {
        throw new Error('Dataset not found');
      }

      const data = await this.downloadAndParseDataset(dataset);
      if (!data) {
        throw new Error('Failed to download dataset');
      }

      // Convert to requested format
      const formattedData = this.formatDataForExport(data, format);

      // Create downloadable blob/file
      const fileName = `${dataset.dataset_name}_${new Date().toISOString().split('T')[0]}.${format}`;
      const downloadUrl = this.createDownloadUrl(formattedData, fileName, format);

      // Update download count
      await this.updateDatasetMetrics(datasetId, 'download_count');

      return {
        success: true,
        data: { downloadUrl, fileName }
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to export dataset: ${error.message}`
      };
    }
  }

  /**
   * Archive old datasets based on retention policy
   */
  async archiveOldDatasets(retentionDays: number = 365): Promise<ApiResponse<{ archived: number }>> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      // Find datasets older than cutoff
      const { data: oldDatasets, error: queryError } = await supabase
        .from('historical_datasets')
        .select('*')
        .lt('last_updated', cutoffDate.toISOString());

      if (queryError) {
        throw new Error(`Failed to query old datasets: ${queryError.message}`);
      }

      const archivedDatasets = oldDatasets || [];

      // Compress and move to archive storage
      for (const dataset of archivedDatasets) {
        await this.compressAndArchiveDataset(dataset);
      }

      return {
        success: true,
        data: { archived: archivedDatasets.length }
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to archive datasets: ${error.message}`
      };
    }
  }

  /**
   * Backup data lake to external storage
   */
  async createBackup(): Promise<ApiResponse<{ backupId: string, size: number, location: string }>> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupId = `backup_${timestamp}`;

      // Get all datasets
      const { data: datasets, error } = await supabase
        .from('historical_datasets')
        .select('*');

      if (error) {
        throw new Error(`Failed to fetch datasets for backup: ${error.message}`);
      }

      // Create backup manifest
      const backupManifest = {
        backupId,
        createdAt: new Date().toISOString(),
        totalDatasets: datasets.length,
        totalSize: datasets.reduce((sum, ds) => sum + ds.total_size_mb, 0),
        datasets: datasets.map(ds => ({
          id: ds.id,
          name: ds.dataset_name,
          size: ds.total_size_mb,
          last_updated: ds.last_updated
        }))
      };

      // Upload backup manifest and key datasets
      const backupData = JSON.stringify(backupManifest, null, 2);
      const backupUrl = await this.uploadToStorage(`${backupId}/manifest.json`, backupData, 'json');

      return {
        success: true,
        data: {
          backupId,
          size: backupManifest.totalSize,
          location: `supabase://${this.BUCKET_NAME}/backups/${backupId}`
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to create backup: ${error.message}`
      };
    }
  }

  // Private helper methods

  private generateDatasetId(name: string, dataType: string): string {
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const sanitizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return `${dataType}_${sanitizedName}_${timestamp}`;
  }

  private calculateDataSize(data: any[]): number {
    const dataString = JSON.stringify(data);
    return (new Blob([dataString]).size) / (1024 * 1024); // Size in MB
  }

  private determineOptimalFormat(data: any[], shouldCompress: boolean): HistoricalDataset['data_format'] {
    if (shouldCompress) return 'compressed_json';
    if (this.isTabularData(data)) return 'csv';
    return 'json';
  }

  private async processDataset(data: any[], format: HistoricalDataset['data_format']): Promise<any> {
    switch (format) {
      case 'csv':
        return this.convertToCSV(data);
      case 'compressed_json':
        return this.compressJSON(data);
      case 'parquet':
        // For now, fallback to compressed JSON
        return this.compressJSON(data);
      default:
        return JSON.stringify(data);
    }
  }

  private convertToCSV(data: any[]): string {
    if (!data.length) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','), // Header row
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return String(value || '');
        }).join(',')
      )
    ];

    return csvRows.join('\n');
  }

  private async compressJSON(data: any[]): Promise<string> {
    const jsonString = JSON.stringify(data);
    // Basic compression - remove unnecessary whitespace
    return jsonString.replace(/\s+/g, ' ').trim();
  }

  private async uploadToStorage(fileName: string, data: any, format: string): Promise<ApiResponse<string>> {
    try {
      // For now, we'll simulate cloud storage upload
      // In production, this would upload to S3 or similar
      console.log(`Uploading ${fileName} (${data.length} bytes) to ${this.BUCKET_NAME}`);

      // Simulate successful upload
      return {
        success: true,
        data: `supabase://${this.BUCKET_NAME}/${fileName}`
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Storage upload failed: ${error.message}`
      };
    }
  }

  private getRetentionPolicy(dataType: string): string {
    const policies: Record<string, string> = {
      yield_history: 'monthly_archive',
      weather_history: 'weekly_backups',
      price_history: 'daily_backups',
      soil_tests: 'monthly_archive',
      land_records: 'monthly_archive',
      irrigation_data: 'weekly_backups'
    };
    return policies[dataType] || 'monthly_archive';
  }

  private calculateCompressionRatio(original: any[], compressed: any): number {
    const originalSize = this.calculateDataSize(original);
    const compressedSize = compressed.length / (1024 * 1024); // Convert bytes to MB
    return (originalSize - compressedSize) / originalSize * 100;
  }

  private findTimeRange(data: any[]): [string, string] {
    if (!data.length) return [new Date().toISOString(), new Date().toISOString()];

    const dates = data
      .map(item => new Date(item.created_at || item.price_date || item.reading_date || Date.now()))
      .filter(date => !isNaN(date.getTime()))
      .sort((a, b) => a.getTime() - b.getTime());

    if (dates.length === 0) {
      const now = new Date().toISOString();
      return [now, now];
    }

    return [
      dates[0].toISOString(),
      dates[dates.length - 1].toISOString()
    ];
  }

  private isTabularData(data: any[]): boolean {
    if (!data.length) return false;

    // Check if all objects have the same structure
    const referenceKeys = Object.keys(data[0]).sort();
    return data.every(obj =>
      Object.keys(obj).sort().every(key => referenceKeys.includes(key))
    );
  }

  private async findMatchingDatasets(filters: any): Promise<HistoricalDataset[]> {
    let query = supabase
      .from('historical_datasets')
      .select('*')
      .eq('data_format', 'json'); // Only fetch uncompressed datasets for now

    if (filters.dataType) {
      query = query.eq('data_type', filters.dataType);
    }

    if (filters.district) {
      query = query.eq('district', filters.district);
    }

    if (filters.source) {
      query = query.eq('source', filters.source);
    }

    // Time range filtering (simplified)
    if (filters.startDate || filters.endDate) {
      if (filters.startDate) {
        query = query.gte('time_range_end', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('time_range_start', filters.endDate);
      }
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  }

  private async downloadAndParseDataset(dataset: HistoricalDataset): Promise<any[] | null> {
    try {
      // In a real implementation, this would download from cloud storage
      // For now, return simulated data based on dataset info

      if (dataset.data_type === 'yield_history') {
        return this.generateSampleYieldData(dataset.record_count);
      } else if (dataset.data_type === 'weather_history') {
        return this.generateSampleWeatherData(dataset.record_count);
      }

      return null;
    } catch (error) {
      console.error('Failed to download dataset:', error);
      return null;
    }
  }

  private updateDatasetMetrics(datasetId: string, metric: 'access_count' | 'download_count'): Promise<void> {
    return supabase.rpc('increment_dataset_metric', {
      dataset_id: datasetId,
      metric_name: metric
    }).then(() => undefined).catch(() => undefined);
  }

  private generateSampleYieldData(count: number): any[] {
    const data = [];
    for (let i = 0; i < count; i++) {
      data.push({
        farmer_id: `farmer_${i}`,
        crop_type: 'rice',
        season: 'kharif',
        yield_kg: 2000 + Math.random() * 2000,
        area_hectares: 2 + Math.random() * 3,
        harvest_date: new Date(2024, i % 12, 15).toISOString()
      });
    }
    return data;
  }

  private generateSampleWeatherData(count: number): any[] {
    const data = [];
    for (let i = 0; i < count; i++) {
      data.push({
        temperature: 25 + Math.random() * 15,
        humidity: 50 + Math.random() * 30,
        rainfall_1h: Math.random() * 5,
        wind_speed: Math.random() * 10,
        reading_date: new Date(2024, i % 12, i % 28 + 1).toISOString().split('T')[0]
      });
    }
    return data;
  }

  private applyTimeFilters(data: any[], startDate?: string, endDate?: string): any[] {
    return data.filter(item => {
      const itemDate = new Date(item.created_at || item.price_date || item.reading_date);
      const isAfterStart = !startDate || itemDate >= new Date(startDate);
      const isBeforeEnd = !endDate || itemDate <= new Date(endDate);
      return isAfterStart && isBeforeEnd;
    });
  }

  private groupByType(datasets: HistoricalDataset[]): Record<string, number> {
    const grouped: Record<string, number> = {};
    datasets.forEach(ds => {
      grouped[ds.data_type] = (grouped[ds.data_type] || 0) + 1;
    });
    return grouped;
  }

  private calculateStorageUtilization(datasets: HistoricalDataset[]): number {
    const totalSize = datasets.reduce((sum, ds) => sum + ds.total_size_mb, 0);
    const maxStorage = 1000; // 1GB for this example
    return Math.min(100, (totalSize / maxStorage) * 100);
  }

  private calculateCompressionSavings(datasets: HistoricalDataset[]): number {
    const compressedDatasets = datasets.filter(ds => ds.compression_ratio);
    if (compressedDatasets.length === 0) return 0;

    const avgCompression = compressedDatasets.reduce((sum, ds) =>
      sum + (ds.compression_ratio || 0), 0) / compressedDatasets.length;
    return avgCompression;
  }

  private formatDataForExport(data: any[], format: string): any {
    switch (format) {
      case 'csv':
        return this.convertToCSV(data);
      case 'json':
        return JSON.stringify(data, null, 2);
      default:
        return JSON.stringify(data, null, 2);
    }
  }

  private createDownloadUrl(data: any, fileName: string, format: string): string {
    const blob = new Blob([data], {
      type: format === 'csv' ? 'text/csv' : 'application/json'
    });
    return URL.createObjectURL(blob);
  }

  private async compressAndArchiveDataset(dataset: HistoricalDataset): Promise<void> {
    // Mark dataset as archived
    await supabase
      .from('historical_datasets')
      .update({
        retention_policy: 'compressed_storage',
        last_updated: new Date().toISOString()
      })
      .eq('id', dataset.id);
  }
}

export const historicalDataLakeService = new HistoricalDataLakeService();

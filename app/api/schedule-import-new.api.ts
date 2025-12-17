import { Platform } from 'react-native';
import api from './index';

export interface ScheduleImportTemplate {
  id: number;
  profession_id: number;
  template_name: string;
  template_description: string;
  file_type: string;
  sample_data: {
    title: string | null;
    description: string | null;
    location: string | null;
    priority: string;
    category: string | null;
    keywords: string | null;
  };
  format_specifications: {
    required_columns: string[];
    optional_columns: string[];
    column_descriptions: Record<string, string>;
    all_columns: string[];
  };
  ai_processing_info: {
    keywords_examples: any | null;
    priority_detection_rules: any | null;
    category_mapping_examples: any | null;
  };
  usage_statistics: {
    download_count: number;
    success_import_rate: number | null;
    user_feedback_rating: number | null;
  };
  file_information: {
    has_generated_files: boolean;
    template_file_path: string;
    sample_data_file_path: string | null;
    instructions_file_path: string;
    download_urls: {
      template: string;
      sample_data: string | null;
      instructions: string;
    };
  };
  status: {
    is_active: boolean;
    is_default: boolean;
  };
  metadata: {
    created_at: string;
    updated_at: string;
    created_at_human: string;
    updated_at_human: string;
  };
}

export interface ScheduleImport {
  id: number;
  user_id: number;
  import_type: 'file_upload' | 'manual_input' | 'text_parsing';
  source_type: 'csv' | 'excel' | 'txt' | 'manual' | 'json';
  raw_content: string | null;
  file_path: string | null;
  original_filename: string | null;
  file_size: number | null;
  file_size_bytes?: number;
  file_size_formatted?: string;
  mime_type?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processing_started_at?: string;
  processing_completed_at?: string;
  processing_duration?: string;
  total_entries?: number; // Keep for backward compatibility
  total_records_found: number;
  processed_entries?: number;
  successfully_processed: number;
  success_entries?: number; // Keep for backward compatibility
  failed_entries?: number;
  failed_records: number;
  success_rate: number;
  error_log: string | null;
  ai_confidence_score: string;
  detected_format: string | null;
  detected_profession: string | null;
  has_errors: boolean;
  ai_processing_status?: 'pending' | 'in_progress' | 'completed' | 'failed';
  ai_processing_feedback?: any | null;
  conversion_status?: 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  created_at_formatted: string;
  created_at_human: string;
  metadata?: {
    created_at: string;
    updated_at: string;
    created_at_human: string;
    updated_at_human: string;
  };
}

export interface ScheduleEntry {
  id: number;
  import_id: number;
  original_text: string;
  parsed_data: {
    title?: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    start_time?: string;
    end_time?: string;
    location?: string;
    priority?: string;
    category?: string;
    keywords?: string[];
  };
  ai_confidence: number;
  validation_status: 'pending' | 'valid' | 'invalid' | 'needs_review';
  validation_errors: string[] | null;
  is_converted: boolean;
  event_id: number | null;
  metadata: {
    created_at: string;
    updated_at: string;
  };
}

export interface CreateScheduleImportRequest {
  import_type: 'file_upload' | 'manual_input' | 'text_parsing';
  source_type: 'csv' | 'excel' | 'txt' | 'manual' | 'json';
  raw_content?: string;
  file?: any; // File object for uploads
  user_id?: number; // Optional user ID
}

export interface ScheduleImportResponse {
  success: boolean;
  message: string;
  data: ScheduleImport;
}

export interface ScheduleImportListResponse {
  success: boolean;
  data: ScheduleImport[];
}

export interface ScheduleEntriesResponse {
  success: boolean;
  data: ScheduleEntry[];
}

export interface ImportStatisticsResponse {
  success: boolean;
  data: {
    total_imports: number;
    successful_imports: number;
    failed_imports: number;
    total_entries_processed: number;
    average_success_rate: number;
    recent_imports: ScheduleImport[];
  };
}

export interface TemplateDownloadResponse {
  success: boolean;
  data: {
    content_base64: string;
    filename: string;
    content_type: string;
  };
}

export const ScheduleImportNewAPI = {
  // Template Management
  getTemplates: async (): Promise<{ success: boolean; data: ScheduleImportTemplate[] }> => {
    try {
      const response = await api.get<{ success: boolean; data: ScheduleImportTemplate[] }>('/schedule-import-templates');
      return response.data;
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  },

  getTemplate: async (id: number): Promise<{ success: boolean; data: ScheduleImportTemplate }> => {
    try {
      const response = await api.get<{ success: boolean; data: ScheduleImportTemplate }>(`/schedule-import-templates/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching template:', error);
      throw error;
    }
  },

  downloadTemplate: async (id: number): Promise<TemplateDownloadResponse> => {
    try {
      const response = await api.get<TemplateDownloadResponse>(`/schedule-import-templates/${id}/download`);
      return response.data;
    } catch (error) {
      console.error('Error downloading template:', error);
      throw error;
    }
  },

  downloadSample: async (id: number): Promise<TemplateDownloadResponse> => {
    try {
      const response = await api.get<TemplateDownloadResponse>(`/schedule-import-templates/${id}/download-sample`);
      return response.data;
    } catch (error) {
      console.error('Error downloading sample:', error);
      throw error;
    }
  },

  downloadInstructions: async (id: number): Promise<TemplateDownloadResponse> => {
    try {
      const response = await api.get<TemplateDownloadResponse>(`/schedule-import-templates/${id}/download-instructions`);
      return response.data;
    } catch (error) {
      console.error('Error downloading instructions:', error);
      throw error;
    }
  },

  // Core Import API
  createImport: async (data: CreateScheduleImportRequest): Promise<ScheduleImportResponse> => {
    try {
      let requestData: any;

      if (data.import_type === 'file_upload' && data.file) {
        // File upload using FormData for React Native
        const formData = new FormData();
        
        // Add form fields
        formData.append('import_type', data.import_type);
        formData.append('source_type', data.source_type);
        
        // Add user_id if provided
        if (data.user_id) {
          formData.append('user_id', data.user_id.toString());
        }
        
        // In React Native, file needs to be in a specific format
        const file = data.file as any;
        
        console.log('🔍 Original file object received:', {
          name: file.name,
          uri: file.uri,
          type: file.type,
          mimeType: file.mimeType,
          size: file.size
        });
        
        // Try to read file content for debugging
        try {
          const response = await fetch(file.uri);
          const fileContent = await response.text();
          console.log('📋 API Layer - File content preview (first 500 chars):');
          console.log(fileContent.substring(0, 500));
          console.log('📋 File content length:', fileContent.length, 'characters');
          
          // Check if this is sample data
          if (fileContent.includes('Sample ngay') || fileContent.includes('Sample lop')) {
            console.error('❌ ERROR: File contains sample data at API layer!');
            console.error('This means the file picker is returning the wrong file.');
          }
        } catch (readError) {
          console.log('Could not read file at API layer:', readError);
        }
        
        // Ensure we have the correct MIME type
        let mimeType = file.mimeType || file.type;
        if (!mimeType || mimeType === 'application/octet-stream') {
          // Set proper MIME type based on file extension
          if (file.name?.toLowerCase().endsWith('.csv')) {
            mimeType = 'text/csv';
          } else if (file.name?.toLowerCase().endsWith('.xlsx')) {
            mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          } else if (file.name?.toLowerCase().endsWith('.xls')) {
            mimeType = 'application/vnd.ms-excel';
          } else if (file.name?.toLowerCase().endsWith('.txt')) {
            mimeType = 'text/plain';
          }
        }
        
        // Create file object for React Native
        // Platform-specific handling
        const fileToUpload = {
          uri: Platform.OS === 'android' ? file.uri : file.uri.replace('file://', ''),
          type: mimeType || 'text/csv',
          name: file.name || `import_${Date.now()}.csv`,
        };
        
        // Append file to FormData - cast to any to bypass TypeScript
        formData.append('file', fileToUpload as any);
        
        console.log('📤 Uploading CSV file:', {
          name: fileToUpload.name,
          type: fileToUpload.type,
          uri: fileToUpload.uri,
          user_id: data.user_id,
          import_type: data.import_type,
          source_type: data.source_type
        });

        // Make the request with proper headers for multipart/form-data
        const response = await api.post<ScheduleImportResponse>('/schedule-imports', formData, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
          },
          transformRequest: (data) => {
            // Return FormData as-is, don't let axios transform it
            return data;
          },
        });
        
        console.log('📥 Import response received:', response.data);
        return response.data;
      } else {
        // Text/manual input using JSON
        requestData = {
          import_type: data.import_type,
          source_type: data.source_type,
          raw_content: data.raw_content,
          user_id: data.user_id, // Include user_id if provided
        };

        const response = await api.post<ScheduleImportResponse>('/schedule-imports', requestData);
        return response.data;
      }
    } catch (error) {
      console.error('Error creating import:', error);
      throw error;
    }
  },

  // Management APIs
  getImports: async (userId?: number): Promise<ScheduleImportListResponse> => {
    try {
      const url = userId ? `/schedule-imports?user_id=${userId}` : '/schedule-imports';
      const response = await api.get<ScheduleImportListResponse>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching imports:', error);
      throw error;
    }
  },

  getImport: async (id: number): Promise<ScheduleImportResponse> => {
    try {
      const response = await api.get<ScheduleImportResponse>(`/schedule-imports/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching import:', error);
      throw error;
    }
  },

  getStatistics: async (): Promise<ImportStatisticsResponse> => {
    try {
      const response = await api.get<ImportStatisticsResponse>('/schedule-imports/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  },

  deleteImport: async (id: number): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.delete<{ success: boolean; message: string }>(`/schedule-imports/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting import:', error);
      throw error;
    }
  },

  // Processing APIs
  processImport: async (id: number): Promise<ScheduleImportResponse> => {
    try {
      const response = await api.post<ScheduleImportResponse>(`/schedule-imports/${id}/process`);
      return response.data;
    } catch (error) {
      console.error('Error processing import:', error);
      throw error;
    }
  },

  convertToEvents: async (id: number): Promise<ScheduleImportResponse> => {
    try {
      const response = await api.post<ScheduleImportResponse>(`/schedule-imports/${id}/convert`);
      return response.data;
    } catch (error) {
      console.error('Error converting to events:', error);
      throw error;
    }
  },

  // Entry Management
  getEntries: async (importId: number, userId?: number): Promise<ScheduleEntriesResponse> => {
    try {
      const url = userId 
        ? `/schedule-imports/${importId}/entries?user_id=${userId}`
        : `/schedule-imports/${importId}/entries`;
      const response = await api.get<ScheduleEntriesResponse>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching entries:', error);
      throw error;
    }
  },
  
  getImportEntries: async (importId: number, userId?: number): Promise<ScheduleEntriesResponse> => {
    try {
      const url = userId 
        ? `/schedule-imports/${importId}/entries?user_id=${userId}`
        : `/schedule-imports/${importId}/entries`;
      const response = await api.get<ScheduleEntriesResponse>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching import entries:', error);
      throw error;
    }
  },

  updateEntry: async (entryId: number, data: Partial<ScheduleEntry>): Promise<{ success: boolean; data: ScheduleEntry }> => {
    try {
      const response = await api.patch<{ success: boolean; data: ScheduleEntry }>(`/schedule-imports/entries/${entryId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating entry:', error);
      throw error;
    }
  },

  // Export APIs
  exportImportAsCSV: async (
    importId: number, 
    userId: number, 
    format: 'original' | 'parsed' | 'standard' | 'ai_enhanced' | 'vietnamese_school' = 'standard'
  ): Promise<TemplateDownloadResponse> => {
    try {
      const response = await api.get<TemplateDownloadResponse>(
        `/schedule-imports/${importId}/export?user_id=${userId}&format=${format}`
      );
      return response.data;
    } catch (error) {
      console.error('Error exporting import as CSV:', error);
      throw error;
    }
  },

  exportEventsAsCSV: async (
    importId: number, 
    userId: number, 
    format: string = 'standard'
  ): Promise<TemplateDownloadResponse> => {
    try {
      const response = await api.get<TemplateDownloadResponse>(
        `/schedule-imports/${importId}/export-events?user_id=${userId}&format=${format}`
      );
      return response.data;
    } catch (error) {
      console.error('Error exporting events as CSV:', error);
      throw error;
    }
  },

  previewExport: async (
    importId: number, 
    userId: number, 
    format: string = 'standard'
  ): Promise<any> => {
    try {
      const response = await api.get(
        `/schedule-imports/${importId}/preview?user_id=${userId}&format=${format}`
      );
      return response.data;
    } catch (error) {
      console.error('Error previewing export:', error);
      throw error;
    }
  },

  batchExport: async (
    importIds: number[], 
    userId: number, 
    format: string = 'standard'
  ): Promise<TemplateDownloadResponse> => {
    try {
      const response = await api.post<TemplateDownloadResponse>(
        `/schedule-imports/export-batch?user_id=${userId}`,
        { import_ids: importIds, format }
      );
      return response.data;
    } catch (error) {
      console.error('Error batch exporting:', error);
      throw error;
    }
  },
};

export default ScheduleImportNewAPI;
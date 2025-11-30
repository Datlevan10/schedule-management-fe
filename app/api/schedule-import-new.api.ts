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
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_entries: number;
  processed_entries: number;
  success_entries: number;
  failed_entries: number;
  ai_processing_status: 'pending' | 'in_progress' | 'completed' | 'failed';
  ai_processing_feedback: any | null;
  conversion_status: 'pending' | 'completed' | 'failed';
  metadata: {
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
        // File upload using FormData
        const formData = new FormData();
        formData.append('import_type', data.import_type);
        formData.append('source_type', data.source_type);
        formData.append('file', data.file);

        const response = await api.post<ScheduleImportResponse>('/schedule-imports', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      } else {
        // Text/manual input using JSON
        requestData = {
          import_type: data.import_type,
          source_type: data.source_type,
          raw_content: data.raw_content,
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
  getImports: async (): Promise<ScheduleImportListResponse> => {
    try {
      const response = await api.get<ScheduleImportListResponse>('/schedule-imports');
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
  getEntries: async (importId: number): Promise<ScheduleEntriesResponse> => {
    try {
      const response = await api.get<ScheduleEntriesResponse>(`/schedule-imports/${importId}/entries`);
      return response.data;
    } catch (error) {
      console.error('Error fetching entries:', error);
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
};

export default ScheduleImportNewAPI;
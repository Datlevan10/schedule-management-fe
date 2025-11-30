import api from './index';
import { Profession } from './auth.api';

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
  profession?: Profession;
  metadata: {
    created_at: string;
    updated_at: string;
    created_at_human: string;
    updated_at_human: string;
  };
}

export interface ScheduleTemplatesResponse {
  data: ScheduleImportTemplate[];
}

export const ScheduleTemplateAPI = {
  getTemplates: async () => {
    const response = await api.get<ScheduleTemplatesResponse>('/schedule-import-templates');
    return response;
  },

  getTemplate: async (id: number) => {
    const response = await api.get<{ data: ScheduleImportTemplate }>(`/schedule-import-templates/${id}`);
    return response;
  },

  createTemplate: async (data: Partial<ScheduleImportTemplate>) => {
    const response = await api.post<{ data: ScheduleImportTemplate }>('/schedule-import-templates', data);
    return response;
  },

  updateTemplate: async (id: number, data: Partial<ScheduleImportTemplate>) => {
    const response = await api.put<{ data: ScheduleImportTemplate }>(`/schedule-import-templates/${id}`, data);
    return response;
  },

  deleteTemplate: async (id: number) => {
    const response = await api.delete(`/schedule-import-templates/${id}`);
    return response;
  },

  downloadTemplate: async (id: number) => {
    const response = await api.get<{
      success: boolean;
      data: {
        content_base64: string;
        filename: string;
        content_type: string;
      };
    }>(`/schedule-import-templates/${id}/download`);
    return response;
  },

  downloadSample: async (id: number) => {
    const response = await api.get<{
      success: boolean;
      data: {
        content_base64: string;
        filename: string;
        content_type: string;
      };
    }>(`/schedule-import-templates/${id}/download-sample`);
    return response;
  },

  downloadInstructions: async (id: number) => {
    const response = await api.get<{
      success: boolean;
      data: {
        content_base64: string;
        filename: string;
        content_type: string;
      };
    }>(`/schedule-import-templates/${id}/download-instructions`);
    return response;
  },
};
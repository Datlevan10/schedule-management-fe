import apiClient from "./index";

export interface ScheduleImportTemplate {
  id: number;
  name: string;
  description: string;
  fields: TemplateField[];
  created_at: string;
  updated_at: string;
}

export interface TemplateField {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

export interface ScheduleImport {
  id: number;
  template_id: number;
  file_name: string;
  import_type: 'file_upload' | 'manual';
  source_type: 'csv' | 'excel' | 'json';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_records: number;
  processed_records: number;
  failed_records: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface ScheduleImportTemplateResponse {
  success: boolean;
  data: ScheduleImportTemplate[];
}

export interface ScheduleImportResponse {
  success: boolean;
  data: ScheduleImport;
  message?: string;
}

export interface ImportResultResponse {
  success: boolean;
  data: {
    import: ScheduleImport;
    results: any[];
    errors: any[];
  };
}

class ScheduleImportAPI {
  // Get all import templates
  async getTemplates(): Promise<ScheduleImportTemplateResponse> {
    try {
      const response = await apiClient.get<ScheduleImportTemplateResponse>('/schedule-import-templates');
      return response.data;
    } catch (error) {
      console.error("Error fetching import templates:", error);
      throw error;
    }
  }

  // Get specific template
  async getTemplate(templateId: number): Promise<{ success: boolean; data: ScheduleImportTemplate }> {
    try {
      const response = await apiClient.get<{ success: boolean; data: ScheduleImportTemplate }>(`/schedule-import-templates/${templateId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching import template:", error);
      throw error;
    }
  }

  // Download template CSV
  async downloadTemplate(templateId: number): Promise<Blob> {
    try {
      const response = await apiClient.get(`/schedule-import-templates/${templateId}/download`, {
        responseType: 'blob'
      });
      return response.data as Blob;
    } catch (error) {
      console.error("Error downloading template:", error);
      throw error;
    }
  }

  // Download sample CSV
  async downloadSample(templateId: number): Promise<Blob> {
    try {
      const response = await apiClient.get(`/schedule-import-templates/${templateId}/download-sample`, {
        responseType: 'blob'
      });
      return response.data as Blob;
    } catch (error) {
      console.error("Error downloading sample:", error);
      throw error;
    }
  }

  // Download instructions
  async downloadInstructions(templateId: number): Promise<Blob> {
    try {
      const response = await apiClient.get(`/schedule-import-templates/${templateId}/download-instructions`, {
        responseType: 'blob'
      });
      return response.data as Blob;
    } catch (error) {
      console.error("Error downloading instructions:", error);
      throw error;
    }
  }

  // Import CSV file
  async importCSV(formData: FormData): Promise<ScheduleImportResponse> {
    try {
      const response = await apiClient.post<ScheduleImportResponse>('/schedule-imports', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error importing CSV:", error);
      throw error;
    }
  }

  // Get import status
  async getImportStatus(importId: number): Promise<{ success: boolean; data: ScheduleImport }> {
    try {
      const response = await apiClient.get<{ success: boolean; data: ScheduleImport }>(`/schedule-imports/${importId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching import status:", error);
      throw error;
    }
  }

  // Get import results
  async getImportResults(importId: number): Promise<ImportResultResponse> {
    try {
      const response = await apiClient.get<ImportResultResponse>(`/schedule-imports/${importId}/results`);
      return response.data;
    } catch (error) {
      console.error("Error fetching import results:", error);
      throw error;
    }
  }

  // Get all imports
  async getImports(): Promise<{ success: boolean; data: ScheduleImport[] }> {
    try {
      const response = await apiClient.get<{ success: boolean; data: ScheduleImport[] }>('/schedule-imports');
      return response.data;
    } catch (error) {
      console.error("Error fetching imports:", error);
      throw error;
    }
  }

  // Delete import
  async deleteImport(importId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete<{ success: boolean; message: string }>(`/schedule-imports/${importId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting import:", error);
      throw error;
    }
  }
}

export default new ScheduleImportAPI();
import apiClient from "./index";

export interface CustomerReportingTemplate {
  id: number;
  template_name: string;
  customer_fields: string[];
  report_frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  customer_limit: number;
  aggregation_rules: Record<string, string>;
  filter_conditions: Record<string, any>;
  is_active: boolean;
  metadata: {
    success_rate?: number;
    last_generated?: string;
    total_generations?: number;
  };
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface CustomerStats {
  total_customers: number;
  active_customers: number;
  customers_by_profession: Record<string, number>;
  recent_registrations: number;
  monthly_growth: number;
}

export interface ReportGenerationResult {
  success: boolean;
  report_id: string;
  data: any[];
  summary: {
    total_records: number;
    generated_at: string;
    template_used: string;
  };
}

export interface CustomerReportingTemplateResponse {
  success: boolean;
  data: CustomerReportingTemplate[];
}

export interface SingleCustomerReportingTemplateResponse {
  success: boolean;
  data: CustomerReportingTemplate;
}

export interface CustomerStatsResponse {
  success: boolean;
  data: CustomerStats;
}

export interface ReportGenerationResponse {
  success: boolean;
  data: ReportGenerationResult;
  message?: string;
}

class AdminCustomerReportingAPI {
  private basePath = '/admin/customer-reporting-templates';

  // Get all customer reporting templates
  async getTemplates(): Promise<CustomerReportingTemplateResponse> {
    try {
      const response = await apiClient.get<CustomerReportingTemplateResponse>(this.basePath);
      return response.data;
    } catch (error) {
      console.error("Error fetching customer reporting templates:", error);
      throw error;
    }
  }

  // Get a specific template
  async getTemplate(templateId: number): Promise<SingleCustomerReportingTemplateResponse> {
    try {
      const response = await apiClient.get<SingleCustomerReportingTemplateResponse>(`${this.basePath}/${templateId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching customer reporting template:", error);
      throw error;
    }
  }

  // Create a new template
  async createTemplate(template: Partial<CustomerReportingTemplate>): Promise<SingleCustomerReportingTemplateResponse> {
    try {
      const response = await apiClient.post<SingleCustomerReportingTemplateResponse>(this.basePath, template);
      return response.data;
    } catch (error) {
      console.error("Error creating customer reporting template:", error);
      throw error;
    }
  }

  // Update an existing template
  async updateTemplate(templateId: number, template: Partial<CustomerReportingTemplate>): Promise<SingleCustomerReportingTemplateResponse> {
    try {
      const response = await apiClient.put<SingleCustomerReportingTemplateResponse>(`${this.basePath}/${templateId}`, template);
      return response.data;
    } catch (error) {
      console.error("Error updating customer reporting template:", error);
      throw error;
    }
  }

  // Delete a template
  async deleteTemplate(templateId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete<{ success: boolean; message: string }>(`${this.basePath}/${templateId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting customer reporting template:", error);
      throw error;
    }
  }

  // Generate a report using a template
  async generateReport(templateId: number, additionalParams?: Record<string, any>): Promise<ReportGenerationResponse> {
    try {
      const response = await apiClient.post<ReportGenerationResponse>(
        `${this.basePath}/${templateId}/generate-report`, 
        additionalParams || {}
      );
      return response.data;
    } catch (error) {
      console.error("Error generating customer report:", error);
      throw error;
    }
  }

  // Clone a template
  async cloneTemplate(templateId: number, newName?: string): Promise<SingleCustomerReportingTemplateResponse> {
    try {
      const payload = newName ? { template_name: newName } : {};
      const response = await apiClient.post<SingleCustomerReportingTemplateResponse>(
        `${this.basePath}/${templateId}/clone`, 
        payload
      );
      return response.data;
    } catch (error) {
      console.error("Error cloning customer reporting template:", error);
      throw error;
    }
  }

  // Toggle template active status
  async toggleTemplateActive(templateId: number): Promise<SingleCustomerReportingTemplateResponse> {
    try {
      const response = await apiClient.patch<SingleCustomerReportingTemplateResponse>(`${this.basePath}/${templateId}/toggle-active`);
      return response.data;
    } catch (error) {
      console.error("Error toggling template active status:", error);
      throw error;
    }
  }

  // Get customer statistics
  async getCustomerStats(): Promise<CustomerStatsResponse> {
    try {
      const response = await apiClient.get<CustomerStatsResponse>(`${this.basePath}/stats/customers`);
      return response.data;
    } catch (error) {
      console.error("Error fetching customer statistics:", error);
      throw error;
    }
  }
}

export default new AdminCustomerReportingAPI();
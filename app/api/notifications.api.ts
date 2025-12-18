import api from "./index";
import { AnalysisHistoryItem, TaskSelectionAPI } from "./task-selection.api";

export interface AINotification {
  id: string;
  title: string;
  description: string;
  time: string;
  type:
    | "ai_analysis"
    | "priority_task"
    | "reminder"
    | "nhiệm vụ"
    | "sự kiện"
    | "cảnh báo";
  isRead: boolean;
  priority: "thấp" | "trung bình" | "cao" | "rất cao";
  analysis_id?: number;
  task_id?: string;
  created_at: string;
}

export interface NotificationResponse {
  status: "success" | "error";
  message: string;
  data: {
    notifications: AINotification[];
    unread_count: number;
  };
}

export interface TaskPriorityTask {
  task_id: string;
  title: string;
  priority: number;
  urgency_level: "critical" | "high" | "medium" | "low";
  start_datetime: string;
  location: string;
  notification_message?: string;
  priority_description?: string;
}

export interface TaskPriorityResponse {
  status: "success" | "error";
  message: string;
  data: {
    user_id?: string;
    manual_tasks?: {
      analysis_id: number;
      analysis_date: string;
      confidence_score: string;
      tasks: any[];
      priority_ranking: any[];
      task_count: number;
    };
    csv_tasks?: {
      analysis_id: number;
      import_id: number;
      analysis_date: string;
      confidence_score: string;
      tasks: any[];
      priority_ranking: any[];
      task_count: number;
    };
    combined_priorities?: {
      rank: number;
      task_id: string;
      title: string;
      priority: number;
      source: "manual" | "csv";
      urgency_level: "critical" | "high" | "medium" | "low";
      start_datetime: string;
      location?: string;
    }[];
    summary?: {
      has_manual_analysis: boolean;
      has_csv_analysis: boolean;
      total_tasks: number;
      highest_priority_task?: {
        task_id: string;
        title: string;
        priority: number;
        source: "manual" | "csv";
        urgency_level: "critical" | "high" | "medium" | "low";
        notification_message?: string;
      };
      priority_distribution: Record<string, number>;
      latest_manual_analysis?: string;
      latest_csv_analysis?: string;
    };
    dashboard_stats?: {
      active_tasks: number;
      reminders: number;
      productivity_percentage: string;
      productivity_score: number;
      tasks_needing_attention?: number;
      completed_tasks?: number;
      total_analyzed_tasks?: number;
    };
    // Keep old structure fields as optional for backward compatibility
    analysis_id?: number;
    analysis_date?: string;
    highest_priority_task?: TaskPriorityTask;
    priority_ranking?: (TaskPriorityTask & { rank: number })[];
    task_summary?: {
      total_tasks: number;
      priority_distribution: Record<string, number>;
      urgency_breakdown: Record<string, number>;
      date_range: {
        earliest: string;
        latest: string;
      };
    };
    notifications_for_frontend?: {
      type: "task_priority";
      priority: "critical" | "high" | "medium" | "low";
      title: string;
      message: string;
      action_data: {
        task_id: string;
        analysis_id: number;
        priority_rank: number;
        action_type: "view_task_details";
      };
      scheduled_datetime: string;
      location: string;
      context: {
        duration_minutes?: number;
        urgency_level: string;
        ai_confidence: number;
      };
    }[];
    ai_recommendations?: any[];
    ai_confidence_score?: number;
    priority_guidelines?: Record<string, string>;
  };
}

export interface DeleteTaskResponse {
  status: "success" | "error";
  message: string;
  data: {
    deleted_task: {
      task_id: string;
      title: string;
      description: string;
      start_time: string;
      location: string;
      priority: number;
      status: string;
    };
    deleted_at: string;
    deletion_reason: string;
  };
}

export const NotificationAPI = {
  // Delete single task with complete removal (deletes task AND updates AI analysis data)
  deleteTask: async (
    taskId: string,
    reason: string,
    analysisId: number,
    deletedBy = "user"
  ): Promise<DeleteTaskResponse> => {
    try {
      console.log(`🗑️ Deleting task ${taskId} with complete removal...`);
      console.log(`📊 Analysis ID: ${analysisId}, Reason: ${reason}`);
      
      // Use the new complete-removal endpoint
      const response = await api.delete(`/ai-analyses/tasks/${taskId}/complete-removal`, {
        data: {
          analysis_id: analysisId,
          reason: reason,
        },
      });

      if (response.data.status === "success") {
        console.log("✅ Task deleted successfully with complete removal");
        console.log("✅ Task removed from database AND AI analysis data");
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      console.error("❌ Error deleting task with complete removal:", error);
      throw error;
    }
  },

  // Remove task from AI analysis data only (cleanup operation)
  removeTaskFromAnalysis: async (
    analysisId: number,
    taskId: string
  ): Promise<{ status: string; message: string }> => {
    try {
      console.log(`🔄 Removing task ${taskId} from analysis ${analysisId}...`);
      
      const response = await api.patch(`/ai-analyses/${analysisId}/remove-task/${taskId}`);

      if (response.data.status === "success") {
        console.log("✅ Task removed from AI analysis data successfully");
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      console.error("❌ Error removing task from analysis:", error);
      throw error;
    }
  },

  // Bulk delete tasks (for future use)
  bulkDeleteTasks: async (
    taskIds: string[],
    analysisId: number,
    reason: string,
    confirm: boolean = true
  ): Promise<{ status: string; message: string; data: any }> => {
    try {
      console.log(`🗑️ Bulk deleting ${taskIds.length} tasks...`);
      console.log(`📊 Task IDs: ${taskIds.join(', ')}`);
      
      const response = await api.delete('/ai-analyses/tasks/bulk-delete', {
        data: {
          task_ids: taskIds,
          analysis_id: analysisId,
          reason: reason,
          confirm: confirm,
        },
      });

      if (response.data.status === "success") {
        console.log("✅ Bulk delete completed successfully");
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      console.error("❌ Error in bulk delete:", error);
      throw error;
    }
  },

  // Get AI analysis notifications for user
  getAINotifications: async (userId: number): Promise<AINotification[]> => {
    try {
      console.log("🔍 Fetching AI analysis notifications for user:", userId);

      // Get recent AI analyses
      const analysisResponse = await TaskSelectionAPI.getAnalysisHistory(
        userId,
        1,
        5
      );

      if (analysisResponse.status !== "success") {
        return [];
      }

      const notifications: AINotification[] = [];

      // Convert AI analyses to notifications
      analysisResponse.data.analyses.forEach(
        (analysis: AnalysisHistoryItem, index: number) => {
          // Main analysis completion notification
          notifications.push({
            id: `ai_analysis_${analysis.analysis_id}`,
            title: "🤖 Phân tích AI hoàn thành",
            description: `Phân tích cho ${analysis.task_summary?.selected_tasks_count || analysis.selected_tasks?.length || 'một số'} nhiệm vụ đã sẵn sàng`,
            time: formatTimeAgo(analysis.analyzed_at),
            type: "ai_analysis",
            isRead: false,
            priority: "cao",
            analysis_id: analysis.analysis_id,
            created_at: analysis.analyzed_at,
          });

          // Skip priority task notifications and conflict warnings 
          // since structured_response is not present in the API response
          // We'll rely on the Task Priority API for this data instead
          
          console.log('📋 Skipping structured_response processing (not present in API response)');
        }
      );

      // Sort notifications by creation time (newest first)
      notifications.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      console.log("✅ Generated AI notifications:", notifications.length);
      return notifications;
    } catch (error) {
      console.error("❌ Error fetching AI notifications:", error);
      return [];
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId: string): Promise<boolean> => {
    try {
      console.log("✅ Marking notification as read:", notificationId);
      // For now, we'll handle this locally
      // In a real app, you'd send this to the backend
      return true;
    } catch (error) {
      console.error("❌ Error marking notification as read:", error);
      return false;
    }
  },

  // Get unread notification count
  getUnreadCount: async (userId: number): Promise<number> => {
    try {
      const notifications = await NotificationAPI.getAINotifications(userId);
      return notifications.filter((n) => !n.isRead).length;
    } catch (error) {
      console.error("❌ Error getting unread count:", error);
      return 0;
    }
  },

  // Get Task Priority Recommendations from specific analysis
  getTaskPriorityRecommendations: async (
    analysisId: number
  ): Promise<TaskPriorityResponse | null> => {
    try {
      console.log(
        `🎯 Fetching task priority recommendations for analysis ID: ${analysisId}`
      );

      const response = await api.get(
        `/ai-analyses/${analysisId}/priority-recommendations`
      );

      if (response.data.status === "success") {
        console.log("✅ Task priority recommendations fetched successfully");
        return response.data;
      } else {
        console.error(
          "❌ Failed to fetch task priority recommendations:",
          response.data.message
        );
        return null;
      }
    } catch (error) {
      console.error("❌ Error fetching task priority recommendations:", error);
      return null;
    }
  },

  // Get Latest Task Priority Recommendations for user
  getLatestTaskPriorityRecommendations: async (
    userId: number
  ): Promise<TaskPriorityResponse | null> => {
    try {
      console.log(`🎯 ===== CALLING TASK PRIORITY API =====`);
      console.log(`🎯 User ID: ${userId}`);
      console.log(
        `🎯 Full URL: http://192.168.1.8:8000/api/v1/ai-analyses/user/${userId}/latest-priorities`
      );
      console.log(`🎯 Endpoint: /ai-analyses/user/${userId}/latest-priorities`);

      const response = await api.get(
        `/ai-analyses/user/${userId}/latest-priorities`
      );

      console.log(`🎯 ===== API RESPONSE =====`);
      console.log(`🎯 Status:`, response.status);
      console.log(`🎯 Response Data:`, JSON.stringify(response.data, null, 2));

      if (response.data.status === "success") {
        console.log(
          "✅ Latest task priority recommendations fetched successfully"
        );
        console.log(
          "✅ Number of tasks in priority_ranking:",
          response.data.data?.priority_ranking?.length || 0
        );
        console.log(
          "✅ Number of notifications_for_frontend:",
          response.data.data?.notifications_for_frontend?.length || 0
        );
        return response.data;
      } else {
        console.error(
          "❌ Failed to fetch latest task priority recommendations:",
          response.data.message
        );
        return null;
      }
    } catch (error: any) {
      console.error(`❌ ===== TASK PRIORITY API ERROR =====`);
      console.error("❌ Error Type:", error.constructor.name);
      console.error("❌ Error Message:", error.message);
      console.error("❌ Error Code:", error.code);
      console.error("❌ Response Status:", error.response?.status);
      console.error("❌ Response Data:", error.response?.data);
      console.error("❌ Request URL:", error.config?.url);
      console.error("❌ Full Error:", error);
      return null;
    }
  },

  // Convert Task Priority Response to Notifications
  convertTaskPriorityToNotifications: (
    priorityResponse: TaskPriorityResponse
  ): AINotification[] => {
    const notifications: AINotification[] = [];

    // Handle new API structure with combined_priorities
    if (!priorityResponse.data) {
      return notifications;
    }

    const data = priorityResponse.data;
    
    const urgencyToPriority = (
      urgency: string
    ): "thấp" | "trung bình" | "cao" | "rất cao" => {
      switch (urgency) {
        case "critical":
          return "rất cao";
        case "high":
          return "cao";
        case "medium":
          return "trung bình";
        case "low":
          return "thấp";
        default:
          return "trung bình";
      }
    };

    const getTypeIcon = (urgency: string): string => {
      switch (urgency) {
        case "critical":
          return "🔥";
        case "high":
          return "⭐";
        case "medium":
          return "📝";
        case "low":
          return "📌";
        default:
          return "📝";
      }
    };
    
    // Create notifications from combined priorities
    const combinedPriorities = data.combined_priorities || [];
    combinedPriorities.forEach((task, index) => {
      const notification: AINotification = {
        id: `priority_${task.task_id}`,
        title: `${getTypeIcon(task.urgency_level)} Nhiệm vụ #${task.rank}: ${task.title}`,
        description: `Mức độ ưu tiên: ${task.priority}\n` +
                    `Thời gian: ${new Date(task.start_datetime).toLocaleString('vi-VN')}\n` +
                    `Địa điểm: ${task.location || 'Không xác định'}\n` +
                    `Nguồn: ${task.source === 'manual' ? 'Thủ công' : 'Nhập từ CSV'}`,
        // time: formatTimeAgo(task.start_datetime),
        type: "priority_task",
        isRead: false,
        priority: urgencyToPriority(task.urgency_level),
        analysis_id: task.source === 'manual' ? data.manual_tasks?.analysis_id : data.csv_tasks?.analysis_id,
        task_id: task.task_id,
        created_at: task.start_datetime,
      };
      notifications.push(notification);
    });
    
    // Add a summary notification for highest priority task
    if (data.summary?.highest_priority_task) {
      const highestTask = data.summary.highest_priority_task;
      notifications.unshift({
        id: 'highest_priority_summary',
        title: `🔥 Nhiệm vụ quan trọng nhất: ${highestTask.title}`,
        description: `Mức độ ưu tiên: ${highestTask.priority} (${highestTask.urgency_level})\n` +
                    `Nguồn: ${highestTask.source === 'manual' ? 'Thủ công' : 'CSV'}\n` +
                    `Tổng số nhiệm vụ đã phân tích: ${data.summary.total_tasks}`,
        time: formatTimeAgo(new Date().toISOString()),
        type: "ai_analysis" as const,
        isRead: false,
        priority: "rất cao" as const,
        task_id: highestTask.task_id,
        created_at: new Date().toISOString(),
      });
    }
    
    // Add dashboard stats notification
    if (data.dashboard_stats) {
      const stats = data.dashboard_stats;
      notifications.push({
        id: 'dashboard_stats',
        title: '📊 Thống kê năng suất',
        description: `Nhiệm vụ đang hoạt động: ${stats.active_tasks}\n` +
                    `Nhắc nhở: ${stats.reminders}\n` +
                    `Điểm năng suất: ${stats.productivity_score}/100`,
        time: formatTimeAgo(new Date().toISOString()),
        type: "ai_analysis" as const,
        isRead: false,
        priority: "trung bình" as const,
        created_at: new Date().toISOString(),
      });
    }

    return notifications;
  },

  // Enhanced AI notifications with Task Priority integration
  getEnhancedAINotifications: async (
    userId: number
  ): Promise<AINotification[]> => {
    try {
      console.log("🔍 ===== ENHANCED NOTIFICATIONS START =====");
      console.log(
        "🔍 Fetching enhanced AI notifications with task priority for user:",
        userId
      );

      // Get existing AI notifications
      console.log("📋 Step 1: Getting existing AI notifications...");
      const aiNotifications = await NotificationAPI.getAINotifications(userId);
      console.log(
        "📋 Existing AI notifications count:",
        aiNotifications.length
      );

      // Get latest task priority recommendations
      console.log("📋 Step 2: Getting latest task priority recommendations...");
      const latestPriorities =
        await NotificationAPI.getLatestTaskPriorityRecommendations(userId);

      let priorityNotifications: AINotification[] = [];
      if (latestPriorities) {
        console.log(
          "📋 Step 3: Converting priority response to notifications..."
        );
        priorityNotifications =
          NotificationAPI.convertTaskPriorityToNotifications(latestPriorities);
        console.log(
          "📋 Priority notifications generated:",
          priorityNotifications.length
        );

        // Log each priority notification
        priorityNotifications.forEach((notif, index) => {
          console.log(`📋 Priority Notification ${index + 1}:`, {
            id: notif.id,
            title: notif.title,
            description: notif.description,
            type: notif.type,
            priority: notif.priority,
            task_id: notif.task_id,
            analysis_id: notif.analysis_id,
          });
        });
      } else {
        console.log("📋 No priority data received from API");
      }

      // Combine all notifications
      console.log("📋 Step 4: Combining notifications...");
      const allNotifications = [...priorityNotifications, ...aiNotifications];
      console.log("📋 Total before deduplication:", allNotifications.length);

      // Sort by creation time (newest first) and remove duplicates
      const uniqueNotifications = allNotifications.reduce(
        (acc, notification) => {
          const exists = acc.find((n) => n.id === notification.id);
          if (!exists) {
            acc.push(notification);
          }
          return acc;
        },
        [] as AINotification[]
      );

      uniqueNotifications.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      console.log("✅ ===== ENHANCED NOTIFICATIONS COMPLETE =====");
      console.log("✅ Final notification count:", uniqueNotifications.length);
      console.log("✅ Priority notifications:", priorityNotifications.length);
      console.log("✅ AI notifications:", aiNotifications.length);

      return uniqueNotifications;
    } catch (error) {
      console.error("❌ Error fetching enhanced AI notifications:", error);
      return await NotificationAPI.getAINotifications(userId); // Fallback to regular notifications
    }
  },
};

// Helper function to format time ago
function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMs = now.getTime() - date.getTime();

  const minutes = Math.floor(diffInMs / (1000 * 60));
  const hours = Math.floor(diffInMs / (1000 * 60 * 60));
  const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (minutes < 1) {
    return "Vừa xong";
  } else if (minutes < 60) {
    return `${minutes} phút trước`;
  } else if (hours < 24) {
    return `${hours} giờ trước`;
  } else {
    return `${days} ngày trước`;
  }
}

export default NotificationAPI;

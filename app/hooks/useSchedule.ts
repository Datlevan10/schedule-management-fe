import { useCallback, useState } from 'react';
import { ScheduleAPI, type CreateScheduleRequest, type Schedule, type ScheduleFilters } from '../api/schedule.api';
import { useFetch, useMutation } from './useFetch';

export const useSchedule = (filters?: ScheduleFilters) => {
  const {
    data: schedules,
    loading,
    error,
    refetch
  } = useFetch(() => ScheduleAPI.getAll(filters), {
    dependencies: [filters],
  });

  const createMutation = useMutation((data: CreateScheduleRequest) => 
    ScheduleAPI.create(data)
  );

  const updateMutation = useMutation(({ id, data }: { id: string; data: Partial<CreateScheduleRequest> }) =>
    ScheduleAPI.update(id, data)
  );

  const deleteMutation = useMutation((id: string) =>
    ScheduleAPI.delete(id)
  );

  const create = useCallback(async (data: CreateScheduleRequest) => {
    const result = await createMutation.mutate(data);
    if (result.success) {
      await refetch();
    }
    return result;
  }, [createMutation.mutate, refetch]);

  const update = useCallback(async (id: string, data: Partial<CreateScheduleRequest>) => {
    const result = await updateMutation.mutate({ id, data });
    if (result.success) {
      await refetch();
    }
    return result;
  }, [updateMutation.mutate, refetch]);

  const remove = useCallback(async (id: string) => {
    const result = await deleteMutation.mutate(id);
    if (result.success) {
      await refetch();
    }
    return result;
  }, [deleteMutation.mutate, refetch]);

  return {
    schedules: schedules || [],
    loading: loading || createMutation.loading || updateMutation.loading || deleteMutation.loading,
    error: error || createMutation.error || updateMutation.error || deleteMutation.error,
    refetch,
    create,
    update,
    remove,
    isCreating: createMutation.loading,
    isUpdating: updateMutation.loading,
    isDeleting: deleteMutation.loading,
  };
};

export const useScheduleDetail = (id: string) => {
  const {
    data: schedule,
    loading,
    error,
    refetch
  } = useFetch(() => ScheduleAPI.getById(id), {
    immediate: !!id,
    dependencies: [id],
  });

  return {
    schedule,
    loading,
    error,
    refetch,
  };
};

export const useUpcomingSchedules = (limit: number = 5) => {
  const {
    data: schedules,
    loading,
    error,
    refetch
  } = useFetch(() => ScheduleAPI.getUpcoming(limit));

  return {
    schedules: schedules || [],
    loading,
    error,
    refetch,
  };
};

export const useScheduleConflicts = () => {
  const [conflicts, setConflicts] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkConflicts = useCallback(async (startTime: string, endTime: string, excludeId?: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await ScheduleAPI.getConflicts(startTime, endTime, excludeId);
      setConflicts(response.data);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to check conflicts';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const clearConflicts = useCallback(() => {
    setConflicts([]);
    setError(null);
  }, []);

  return {
    conflicts,
    loading,
    error,
    checkConflicts,
    clearConflicts,
  };
};

export const useScheduleByDateRange = (startDate?: string, endDate?: string) => {
  const {
    data: schedules,
    loading,
    error,
    refetch
  } = useFetch(
    () => ScheduleAPI.getByDateRange(startDate!, endDate!),
    {
      immediate: !!(startDate && endDate),
      dependencies: [startDate, endDate],
    }
  );

  return {
    schedules: schedules || [],
    loading,
    error,
    refetch,
  };
};
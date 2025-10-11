import { useCallback } from 'react';
import { ReminderAPI, type CreateReminderRequest, type ReminderTemplate } from '../api/reminder.api';
import { useFetch, useMutation } from './useFetch';

export const useReminders = (scheduleId?: string) => {
  const {
    data: reminders,
    loading,
    error,
    refetch
  } = useFetch(
    () => ReminderAPI.getBySchedule(scheduleId!),
    {
      immediate: !!scheduleId,
      dependencies: [scheduleId],
    }
  );

  const createMutation = useMutation((data: CreateReminderRequest) =>
    ReminderAPI.create(data)
  );

  const updateMutation = useMutation(({ id, data }: { id: string; data: Partial<CreateReminderRequest> }) =>
    ReminderAPI.update(id, data)
  );

  const deleteMutation = useMutation((id: string) =>
    ReminderAPI.delete(id)
  );

  const toggleMutation = useMutation(({ id, isActive }: { id: string; isActive: boolean }) =>
    ReminderAPI.toggle(id, isActive)
  );

  const create = useCallback(async (data: CreateReminderRequest) => {
    const result = await createMutation.mutate(data);
    if (result.success) {
      await refetch();
    }
    return result;
  }, [createMutation.mutate, refetch]);

  const update = useCallback(async (id: string, data: Partial<CreateReminderRequest>) => {
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

  const toggle = useCallback(async (id: string, isActive: boolean) => {
    const result = await toggleMutation.mutate({ id, isActive });
    if (result.success) {
      await refetch();
    }
    return result;
  }, [toggleMutation.mutate, refetch]);

  return {
    reminders: reminders || [],
    loading: loading || createMutation.loading || updateMutation.loading || deleteMutation.loading || toggleMutation.loading,
    error: error || createMutation.error || updateMutation.error || deleteMutation.error || toggleMutation.error,
    refetch,
    create,
    update,
    remove,
    toggle,
    isCreating: createMutation.loading,
    isUpdating: updateMutation.loading,
    isDeleting: deleteMutation.loading,
    isToggling: toggleMutation.loading,
  };
};

export const useReminderTemplates = () => {
  const {
    data: templates,
    loading,
    error,
    refetch
  } = useFetch(() => ReminderAPI.getTemplates());

  const createMutation = useMutation((template: Omit<ReminderTemplate, 'id'>) =>
    ReminderAPI.createTemplate(template)
  );

  const updateMutation = useMutation(({ id, template }: { id: string; template: Partial<ReminderTemplate> }) =>
    ReminderAPI.updateTemplate(id, template)
  );

  const deleteMutation = useMutation((id: string) =>
    ReminderAPI.deleteTemplate(id)
  );

  const createTemplate = useCallback(async (template: Omit<ReminderTemplate, 'id'>) => {
    const result = await createMutation.mutate(template);
    if (result.success) {
      await refetch();
    }
    return result;
  }, [createMutation.mutate, refetch]);

  const updateTemplate = useCallback(async (id: string, template: Partial<ReminderTemplate>) => {
    const result = await updateMutation.mutate({ id, template });
    if (result.success) {
      await refetch();
    }
    return result;
  }, [updateMutation.mutate, refetch]);

  const removeTemplate = useCallback(async (id: string) => {
    const result = await deleteMutation.mutate(id);
    if (result.success) {
      await refetch();
    }
    return result;
  }, [deleteMutation.mutate, refetch]);

  return {
    templates: templates || [],
    loading: loading || createMutation.loading || updateMutation.loading || deleteMutation.loading,
    error: error || createMutation.error || updateMutation.error || deleteMutation.error,
    refetch,
    createTemplate,
    updateTemplate,
    removeTemplate,
    isCreating: createMutation.loading,
    isUpdating: updateMutation.loading,
    isDeleting: deleteMutation.loading,
  };
};

export const useReminderTest = () => {
  const testMutation = useMutation((id: string) =>
    ReminderAPI.testReminder(id)
  );

  const testReminder = useCallback(async (id: string) => {
    return await testMutation.mutate(id);
  }, [testMutation.mutate]);

  return {
    testReminder,
    loading: testMutation.loading,
    error: testMutation.error,
  };
};
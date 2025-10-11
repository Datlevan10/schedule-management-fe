import { useCallback } from 'react';
import {
  AIAPI,
  type NaturalLanguageRequest,
  type OptimizationRequest
} from '../api/ai.api';
import { useFetch, useMutation } from './useFetch';

export const useAISuggestions = (limit: number = 10) => {
  const {
    data: suggestions,
    loading,
    error,
    refetch
  } = useFetch(() => AIAPI.getSuggestions(limit));

  const applyMutation = useMutation((id: string) =>
    AIAPI.applySuggestion(id)
  );

  const dismissMutation = useMutation((id: string) =>
    AIAPI.dismissSuggestion(id)
  );

  const applySuggestion = useCallback(async (id: string) => {
    const result = await applyMutation.mutate(id);
    if (result.success) {
      await refetch();
    }
    return result;
  }, [applyMutation.mutate, refetch]);

  const dismissSuggestion = useCallback(async (id: string) => {
    const result = await dismissMutation.mutate(id);
    if (result.success) {
      await refetch();
    }
    return result;
  }, [dismissMutation.mutate, refetch]);

  return {
    suggestions: suggestions || [],
    loading: loading || applyMutation.loading || dismissMutation.loading,
    error: error || applyMutation.error || dismissMutation.error,
    refetch,
    applySuggestion,
    dismissSuggestion,
    isApplying: applyMutation.loading,
    isDismissing: dismissMutation.loading,
  };
};

export const useNaturalLanguageParsing = () => {
  const parseMutation = useMutation((data: NaturalLanguageRequest) =>
    AIAPI.parseNaturalLanguage(data)
  );

  const parseText = useCallback(async (text: string, context?: any) => {
    return await parseMutation.mutate({ text, context });
  }, [parseMutation.mutate]);

  return {
    parseText,
    parsedSchedule: parseMutation.data,
    loading: parseMutation.loading,
    error: parseMutation.error,
    reset: parseMutation.reset,
  };
};

export const useScheduleOptimization = () => {
  const optimizeMutation = useMutation((data: OptimizationRequest) =>
    AIAPI.optimizeSchedule(data)
  );

  const optimizeSchedule = useCallback(async (
    schedules: string[],
    criteria: OptimizationRequest['criteria'],
    constraints?: OptimizationRequest['constraints']
  ) => {
    return await optimizeMutation.mutate({ schedules, criteria, constraints });
  }, [optimizeMutation.mutate]);

  return {
    optimizeSchedule,
    optimizationResult: optimizeMutation.data,
    loading: optimizeMutation.loading,
    error: optimizeMutation.error,
    reset: optimizeMutation.reset,
  };
};

export const useAIInsights = (period: 'week' | 'month' | 'quarter') => {
  const {
    data: insights,
    loading,
    error,
    refetch
  } = useFetch(
    () => AIAPI.getInsights(period),
    {
      dependencies: [period],
    }
  );

  return {
    insights,
    loading,
    error,
    refetch,
  };
};

export const useBestTimePrediction = () => {
  const predictMutation = useMutation(({ title, duration, preferences }: {
    title: string;
    duration: number;
    preferences?: any;
  }) => AIAPI.predictBestTime(title, duration, preferences));

  const predictBestTime = useCallback(async (
    title: string,
    duration: number,
    preferences?: any
  ) => {
    return await predictMutation.mutate({ title, duration, preferences });
  }, [predictMutation.mutate]);

  return {
    predictBestTime,
    prediction: predictMutation.data,
    loading: predictMutation.loading,
    error: predictMutation.error,
    reset: predictMutation.reset,
  };
};

export const useProductivityAnalysis = () => {
  const analyzeMutation = useMutation(({ startDate, endDate }: {
    startDate: string;
    endDate: string;
  }) => AIAPI.analyzeProductivity(startDate, endDate));

  const analyzeProductivity = useCallback(async (startDate: string, endDate: string) => {
    return await analyzeMutation.mutate({ startDate, endDate });
  }, [analyzeMutation.mutate]);

  return {
    analyzeProductivity,
    analysis: analyzeMutation.data,
    loading: analyzeMutation.loading,
    error: analyzeMutation.error,
    reset: analyzeMutation.reset,
  };
};

export const useAISummary = () => {
  const generateMutation = useMutation((scheduleIds: string[]) =>
    AIAPI.generateSummary(scheduleIds)
  );

  const generateSummary = useCallback(async (scheduleIds: string[]) => {
    return await generateMutation.mutate(scheduleIds);
  }, [generateMutation.mutate]);

  return {
    generateSummary,
    summary: generateMutation.data,
    loading: generateMutation.loading,
    error: generateMutation.error,
    reset: generateMutation.reset,
  };
};
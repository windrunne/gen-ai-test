/**
 * Custom hook for experiment data (responses and metrics)
 */
import { useQuery } from '@tanstack/react-query'
import { responsesApi, metricsApi } from '../api'

const QUERY_KEYS = {
  responses: (experimentId: number) =>
    ['responses', 'experiment', experimentId] as const,
  metrics: (experimentId: number) =>
    ['metrics', 'experiment', experimentId] as const,
}

export const useExperimentResponses = (experimentId: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.responses(experimentId),
    queryFn: () => responsesApi.getByExperiment(experimentId),
    enabled: !!experimentId,
  })
}

export const useExperimentMetrics = (experimentId: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.metrics(experimentId),
    queryFn: () => metricsApi.getSummary(experimentId),
    enabled: !!experimentId,
  })
}

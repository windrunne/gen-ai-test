/**
 * Metrics API client
 */
import apiClient from './client'
import type { MetricsSummary } from '../types'

export const metricsApi = {
  /**
   * Get metrics summary for an experiment
   */
  getSummary: async (experimentId: number): Promise<MetricsSummary> => {
    const response = await apiClient.get<MetricsSummary>(
      `/metrics/experiment/${experimentId}/summary`
    )
    return response.data
  },
}

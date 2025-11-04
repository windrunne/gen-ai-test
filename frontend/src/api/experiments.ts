import apiClient from './client'

export interface ExperimentCreate {
  name: string
  prompt: string
  temperature_range: number[]
  top_p_range: number[]
  max_tokens?: number
}

export interface Experiment {
  id: number
  name: string
  prompt: string
  created_at: string
}

export interface ExperimentDetail extends Experiment {
  response_count: number
}

export interface Response {
  id: number
  experiment_id: number
  temperature: number
  top_p: number
  max_tokens: number
  text: string
  finish_reason: string | null
  created_at: string
  metrics: Array<{
    name: string
    value: number
    metadata?: any
  }>
}

export interface MetricsSummary {
  [metricName: string]: {
    mean: number
    median: number
    min: number
    max: number
    std_dev: number
    count: number
    responses: Array<{
      response_id: number
      temperature: number
      top_p: number
      value: number
    }>
  }
}

export const experimentsApi = {
  create: async (data: ExperimentCreate): Promise<Experiment> => {
    const response = await apiClient.post('/experiments/', data)
    return response.data
  },

  list: async (): Promise<Experiment[]> => {
    const response = await apiClient.get('/experiments/')
    return response.data
  },

  get: async (id: number): Promise<ExperimentDetail> => {
    const response = await apiClient.get(`/experiments/${id}`)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/experiments/${id}`)
  },

  getResponses: async (experimentId: number): Promise<Response[]> => {
    const response = await apiClient.get(`/responses/experiment/${experimentId}`)
    return response.data
  },

  getMetricsSummary: async (experimentId: number): Promise<MetricsSummary> => {
    const response = await apiClient.get(`/metrics/experiment/${experimentId}/summary`)
    return response.data
  },

  exportCSV: async (experimentId: number): Promise<Blob> => {
    const response = await apiClient.get(`/export/experiment/${experimentId}/csv`, {
      responseType: 'blob',
    })
    return response.data
  },

  exportJSON: async (experimentId: number): Promise<Blob> => {
    const response = await apiClient.get(`/export/experiment/${experimentId}/json`, {
      responseType: 'blob',
    })
    return response.data
  },
}

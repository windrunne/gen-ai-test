/**
 * Experiments API client
 */
import apiClient from './client'
import type { Experiment, ExperimentCreate, ExperimentDetail } from '../types'

export const experimentsApi = {
  /**
   * Create a new experiment
   */
  create: async (data: ExperimentCreate): Promise<Experiment> => {
    const response = await apiClient.post<Experiment>('/experiments/', data)
    return response.data
  },

  /**
   * List all experiments
   */
  list: async (): Promise<Experiment[]> => {
    const response = await apiClient.get<Experiment[]>('/experiments/')
    return response.data
  },

  /**
   * Get experiment by ID
   */
  get: async (id: number): Promise<ExperimentDetail> => {
    const response = await apiClient.get<ExperimentDetail>(`/experiments/${id}`)
    return response.data
  },

  /**
   * Delete experiment
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/experiments/${id}`)
  },
}
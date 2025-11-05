/**
 * Responses API client
 */
import apiClient from './client'
import type { Response } from '../types'

export const responsesApi = {
  /**
   * Get all responses for an experiment
   */
  getByExperiment: async (experimentId: number): Promise<Response[]> => {
    const response = await apiClient.get<Response[]>(
      `/responses/experiment/${experimentId}`
    )
    return response.data
  },

  /**
   * Get a single response by ID
   */
  get: async (responseId: number): Promise<Response> => {
    const response = await apiClient.get<Response>(`/responses/${responseId}`)
    return response.data
  },
}

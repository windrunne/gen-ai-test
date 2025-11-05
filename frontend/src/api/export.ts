/**
 * Export API client
 */
import apiClient from './client'
import { downloadBlob } from '../utils'

export const exportApi = {
  /**
   * Export experiment as CSV
   */
  exportCSV: async (experimentId: number): Promise<void> => {
    const response = await apiClient.get(`/export/experiment/${experimentId}/csv`, {
      responseType: 'blob',
    })
    downloadBlob(response.data, `experiment_${experimentId}.csv`)
  },

  /**
   * Export experiment as JSON
   */
  exportJSON: async (experimentId: number): Promise<void> => {
    const response = await apiClient.get(`/export/experiment/${experimentId}/json`, {
      responseType: 'blob',
    })
    downloadBlob(response.data, `experiment_${experimentId}.json`)
  },
}

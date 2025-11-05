/**
 * Custom hook for experiment operations
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { experimentsApi } from '../api/experiments'
import type { ExperimentCreate } from '../types'

const QUERY_KEYS = {
  experiments: ['experiments'] as const,
  experiment: (id: number) => ['experiments', id] as const,
}

export const useExperiments = () => {
  return useQuery({
    queryKey: QUERY_KEYS.experiments,
    queryFn: experimentsApi.list,
  })
}

export const useExperiment = (id: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.experiment(id),
    queryFn: () => experimentsApi.get(id),
    enabled: !!id,
  })
}

export const useCreateExperiment = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ExperimentCreate) => experimentsApi.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.experiments })
      navigate(`/experiments/${data.id}`)
    },
  })
}

export const useDeleteExperiment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => experimentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.experiments })
    },
  })
}

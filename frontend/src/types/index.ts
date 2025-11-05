/**
 * Type definitions for the LLM Lab application
 */

// Experiment types
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

// Response types
export interface ValidationMetadata {
  is_valid: boolean
  is_corrupted: boolean
  is_truncated: boolean
  corruption_score: number
  warnings: string[]
}

export interface MetricData {
  name: string
  value: number
  metadata?: Record<string, any>
}

export interface Response {
  id: number
  experiment_id: number
  temperature: number
  top_p: number
  max_tokens: number
  text: string
  finish_reason: string | null
  validation_metadata?: ValidationMetadata | null
  created_at: string
  metrics: MetricData[]
}

// Metrics types
export interface MetricResponseData {
  response_id: number
  temperature: number
  top_p: number
  value: number
}

export interface MetricSummary {
  mean: number
  median: number
  min: number
  max: number
  std_dev: number
  count: number
  responses: MetricResponseData[]
}

export interface MetricsSummary {
  [metricName: string]: MetricSummary
}

// UI Component types
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl'
export type ParameterType = 'temperature' | 'top_p'
export type SortDirection = 'asc' | 'desc'

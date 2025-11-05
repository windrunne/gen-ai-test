/**
 * Utility functions
 */
import { METRIC_DISPLAY } from '../constants'

/**
 * Format a number as a percentage
 */
export const formatPercentage = (
  value: number,
  decimals: number = METRIC_DISPLAY.DECIMAL_PLACES
): string => {
  return `${(value * METRIC_DISPLAY.PERCENTAGE_MULTIPLIER).toFixed(decimals)}%`
}

/**
 * Format metric name for display
 */
export const formatMetricName = (name: string): string => {
  return name
    .replace('_score', '')
    .replace('_', ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Validate temperature value
 */
export const validateTemperature = (value: number): boolean => {
  return value >= 0.0 && value <= 2.0
}

/**
 * Validate top_p value
 */
export const validateTopP = (value: number): boolean => {
  return value >= 0.0 && value <= 1.0
}

/**
 * Download blob as file
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * Format date string
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Check if response has warnings
 */
export const hasResponseWarnings = (
  validationMetadata?: {
    is_truncated?: boolean
    is_corrupted?: boolean
    warnings?: string[]
  } | null
): boolean => {
  if (!validationMetadata) return false
  return (
    validationMetadata.is_truncated === true ||
    validationMetadata.is_corrupted === true ||
    (validationMetadata.warnings?.length ?? 0) > 0
  )
}

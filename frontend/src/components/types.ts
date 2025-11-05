/**
 * Component-specific type definitions
 */
import type { Response, ModalSize, ParameterType } from '../types'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: ModalSize
  showCloseButton?: boolean
}

export interface ParameterModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (value: number) => void
  type: ParameterType
  existingValues: number[]
}

export interface ComparisonViewProps {
  responses: Response[]
}

export interface ResponseModalProps {
  response: Response | null
  onClose: () => void
}

export interface MetricsChartProps {
  metricsSummary: Record<string, any>
}

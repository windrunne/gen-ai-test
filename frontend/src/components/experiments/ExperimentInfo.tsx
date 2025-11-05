/**
 * Experiment Info Component
 */
import type { ExperimentDetail } from '../../types'
import { formatDate } from '../../utils'

interface ExperimentInfoProps {
  experiment: ExperimentDetail
}

export default function ExperimentInfo({ experiment }: ExperimentInfoProps) {
  return (
    <div className="card">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {experiment.name}
      </h1>
      <p className="text-gray-600 mb-4">{experiment.prompt}</p>
      <div className="flex items-center space-x-4 text-sm text-gray-500">
        <span>
          {experiment.response_count} response
          {experiment.response_count !== 1 ? 's' : ''}
        </span>
        <span>•</span>
        <span>Created {formatDate(experiment.created_at)}</span>
      </div>
    </div>
  )
}

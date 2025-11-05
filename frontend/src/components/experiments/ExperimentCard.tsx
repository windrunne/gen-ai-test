/**
 * Experiment Card Component
 */
import { Trash2 } from 'lucide-react'
import type { Experiment } from '../../types'
import { formatDate } from '../../utils'

interface ExperimentCardProps {
  experiment: Experiment
  onSelect: () => void
  onDelete: (e: React.MouseEvent) => void
}

export default function ExperimentCard({
  experiment,
  onSelect,
  onDelete,
}: ExperimentCardProps) {
  return (
    <div
      onClick={onSelect}
      className="card cursor-pointer hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between mb-2">
        <h2 className="text-xl font-semibold text-gray-900 flex-1 max-w-full overflow-hidden truncate">
          {experiment.name}
        </h2>
        <button
          onClick={onDelete}
          className="text-red-500 hover:text-red-700 p-1"
          aria-label="Delete experiment"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {experiment.prompt}
      </p>
      <p className="text-xs text-gray-500">
        {formatDate(experiment.created_at)}
      </p>
    </div>
  )
}

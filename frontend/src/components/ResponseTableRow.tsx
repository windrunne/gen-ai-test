/**
 * Response Table Row Component
 */
import { Eye } from 'lucide-react'
import type { Response } from '../types'
import { formatPercentage, hasResponseWarnings } from '../utils'

interface ResponseTableRowProps {
  response: Response
  metricNames: string[]
  onClick: () => void
}

export default function ResponseTableRow({
  response,
  metricNames,
  onClick,
}: ResponseTableRowProps) {
  const overall = response.metrics.find((m) => m.name === 'overall_score')
  const validation = response.validation_metadata
  const hasWarning = hasResponseWarnings(validation)

  return (
    <tr
      className={`hover:bg-gray-50 cursor-pointer transition-colors ${
        hasWarning ? 'bg-yellow-50' : ''
      }`}
      onClick={onClick}
    >
      {/* Overall Score */}
      <td className="px-4 py-3 text-sm">
        <div className="flex items-center space-x-2">
          <div className="font-semibold text-gray-900">
            {overall ? formatPercentage(overall.value) : 'N/A'}
          </div>
          {hasWarning && (
            <span
              className="text-yellow-600 text-xs"
              title={validation?.warnings?.join(', ') || 'Response quality warning'}
            >
              Warning
            </span>
          )}
          <ScoreBar value={overall?.value || 0} />
        </div>
      </td>

      {/* Temperature */}
      <td className="px-4 py-3 text-sm text-gray-600">
        {response.temperature}
      </td>

      {/* Top P */}
      <td className="px-4 py-3 text-sm text-gray-600">
        {response.top_p}
      </td>

      {/* Metric Columns */}
      {metricNames.map((name) => {
        const metric = response.metrics.find((m) => m.name === name)
        return (
          <td key={name} className="px-4 py-3 text-sm text-gray-600">
            {metric ? formatPercentage(metric.value) : 'N/A'}
          </td>
        )
      })}

      {/* View Icon */}
      <td className="px-4 py-3 text-sm text-gray-600">
        <Eye className="h-5 w-5 text-gray-500 hover:text-primary-600" />
      </td>
    </tr>
  )
}

/**
 * Score Bar Component
 */
interface ScoreBarProps {
  value: number
  className?: string
}

function ScoreBar({ value, className = '' }: ScoreBarProps) {
  return (
    <div
      className={`w-16 h-2 bg-gray-200 rounded-full overflow-hidden ${className}`}
      title={formatPercentage(value)}
    >
      <div
        className="bg-primary-600 h-2 rounded-full transition-all"
        style={{ width: `${value * 100}%` }}
      />
    </div>
  )
}

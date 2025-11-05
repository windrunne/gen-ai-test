/**
 * Metrics Statistics Table Component
 */
import type { MetricsSummary } from '../types'
import { formatPercentage, formatMetricName } from '../utils'

interface MetricsStatisticsTableProps {
  metricsSummary: MetricsSummary
}

export default function MetricsStatisticsTable({
  metricsSummary,
}: MetricsStatisticsTableProps) {
  return (
    <div className="mt-6 overflow-x-auto">
      <div className="mb-2 text-xs text-gray-500 italic">
        All scores are percentages (0-100%). Higher scores indicate better quality.
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Metric
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              title="Average score across all responses"
            >
              Mean
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              title="Middle value when scores are sorted"
            >
              Median
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              title="Lowest score found"
            >
              Min
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              title="Highest score found"
            >
              Max
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              title="Standard deviation - lower = more consistent"
            >
              Std Dev
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Object.entries(metricsSummary).map(([name, data]) => (
            <tr key={name}>
              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                {formatMetricName(name)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {formatPercentage(data.mean, 2)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {formatPercentage(data.median, 2)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {formatPercentage(data.min, 2)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {formatPercentage(data.max, 2)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {formatPercentage(data.std_dev, 2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

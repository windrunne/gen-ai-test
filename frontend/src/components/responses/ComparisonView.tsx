/**
 * Comparison View Component - Displays responses in a sortable table
 */
import { useState } from 'react'
import ResponseModal from './ResponseModal'
import SortableTableHeader from '../common/SortableTableHeader'
import ResponseTableRow from './ResponseTableRow'
import type { ComparisonViewProps } from '../types'
import type { Response } from '../../types'
import { useSortable } from '../../hooks/useSortable'

export default function ComparisonView({ responses }: ComparisonViewProps) {
  const [selectedResponse, setSelectedResponse] = useState<Response | null>(null)
  
  const { sortedData, sortConfig, handleSort } = useSortable<Response>({
    data: responses,
    getValue: (response, key) => {
      if (key === 'temperature') return response.temperature
      if (key === 'top_p') return response.top_p
      const metric = response.metrics.find((m) => m.name === key)
      return metric?.value || 0
    },
  })

  // Get all unique metric names for table headers, excluding overall_score
  const metricNames = Array.from(
    new Set(responses.flatMap((r) => r.metrics.map((m) => m.name)))
  )
    .filter((name) => name !== 'overall_score')
    .sort()

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortableTableHeader
                label="Overall Score"
                sortKey="overall_score"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableTableHeader
                label="Temp"
                sortKey="temperature"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableTableHeader
                label="Top P"
                sortKey="top_p"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              {metricNames.map((name) => (
                <SortableTableHeader
                  key={name}
                  label={name.replace('_score', '').replace('_', ' ')}
                  sortKey={name}
                  currentSort={sortConfig}
                  onSort={handleSort}
                />
              ))}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                View
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((response) => (
              <ResponseTableRow
                key={response.id}
                response={response}
                metricNames={metricNames}
                onClick={() => setSelectedResponse(response)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <ResponseModal
        response={selectedResponse}
        onClose={() => setSelectedResponse(null)}
      />
    </div>
  )
}

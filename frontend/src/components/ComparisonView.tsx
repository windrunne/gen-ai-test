/**
 * Comparison View Component - Displays responses in a sortable table
 */
import { useState } from 'react'
import { Eye, ChevronUp, ChevronDown } from 'lucide-react'
import Modal from './Modal'
import type { ComparisonViewProps, ResponseModalProps } from './types'
import type { Response, SortDirection } from '../types'
import { formatPercentage, hasResponseWarnings } from '../utils'

function ResponseModal({ response, onClose }: ResponseModalProps) {
  if (!response) return null

  const overallScore = response.metrics.find((m) => m.name === 'overall_score')
  const validation = response.validation_metadata

  return (
    <Modal
      isOpen={!!response}
      onClose={onClose}
      title="Response Details"
      size="xl"
    >
      <div className="p-6">
        {/* Validation Warnings */}
        {validation && hasResponseWarnings(validation) && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98 1.742 2.98H4.42c1.955 0 2.492-1.646 1.742-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Response Quality Warning
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc list-inside space-y-1">
                    {validation.warnings?.map((warning, idx) => (
                      <li key={idx}>{warning}</li>
                    ))}
                    {validation.is_truncated && (
                      <li>Response was cut off due to token limit</li>
                    )}
                    {validation.is_corrupted && (
                      <li>Response may contain corrupted or low-quality content</li>
                    )}
                  </ul>
                  {validation.corruption_score > 0 && (
                    <p className="mt-2 text-xs">
                      Corruption Score: {formatPercentage(validation.corruption_score)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-4 mb-6 text-sm text-gray-600 border-b border-gray-200 pb-4">
          <span>Temperature: {response.temperature}</span>
          <span>Top P: {response.top_p}</span>
          {overallScore && (
            <span className="font-semibold text-primary-600">
              Overall Score: {formatPercentage(overallScore.value)}
            </span>
          )}
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Response Text:</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 whitespace-pre-wrap">{response.text}</p>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-4">Metrics:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {response.metrics.map((metric) => (
              <div key={metric.name} className="bg-gray-50 p-4 rounded-lg">
                <div className="text-xs text-gray-500 mb-1 capitalize">
                  {metric.name.replace('_score', '').replace('_', ' ')}
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatPercentage(metric.value)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default function ComparisonView({ responses }: ComparisonViewProps) {
  const [selectedResponse, setSelectedResponse] = useState<Response | null>(null)
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: SortDirection
  } | null>(null)

  const sortedResponses = [...responses].sort((a, b) => {
    if (!sortConfig) return 0

    let aValue: number
    let bValue: number

    if (sortConfig.key === 'temperature') {
      aValue = a.temperature
      bValue = b.temperature
    } else if (sortConfig.key === 'top_p') {
      aValue = a.top_p
      bValue = b.top_p
    } else {
      const aMetric = a.metrics.find((m) => m.name === sortConfig.key)
      const bMetric = b.metrics.find((m) => m.name === sortConfig.key)
      aValue = aMetric?.value || 0
      bValue = bMetric?.value || 0
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  const handleSort = (key: string) => {
    let direction: SortDirection = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return null
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1" />
    )
  }

  // Get all unique metric names for table headers, excluding overall_score for individual columns
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
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('overall_score')}
              >
                <div className="flex items-center">
                  Overall Score {getSortIcon('overall_score')}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('temperature')}
              >
                <div className="flex items-center">
                  Temp {getSortIcon('temperature')}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('top_p')}
              >
                <div className="flex items-center">
                  Top P {getSortIcon('top_p')}
                </div>
              </th>
              {metricNames.map((name) => (
                <th
                  key={name}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort(name)}
                >
                  <div className="flex items-center">
                    {name.replace('_score', '').replace('_', ' ')} {getSortIcon(name)}
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                View
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedResponses.map((response) => {
              const overall = response.metrics.find((m) => m.name === 'overall_score')
              const validation = response.validation_metadata
              const hasWarning = hasResponseWarnings(validation)

              return (
                <tr
                  key={response.id}
                  className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                    hasWarning ? 'bg-yellow-50' : ''
                  }`}
                  onClick={() => setSelectedResponse(response)}
                >
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="font-semibold text-gray-900">
                        {overall ? formatPercentage(overall.value) : 'N/A'}
                      </div>
                      {hasWarning && (
                        <span
                          className="text-yellow-600"
                          title={validation?.warnings?.join(', ') || 'Response quality warning'}
                        >
                          Warning
                        </span>
                      )}
                      <div
                        className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden"
                        title={`${overall ? formatPercentage(overall.value) : '0%'}`}
                      >
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all"
                          style={{ width: `${(overall?.value || 0) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {response.temperature}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {response.top_p}
                  </td>
                  {metricNames.map((name) => {
                    const metric = response.metrics.find((m) => m.name === name)
                    return (
                      <td key={name} className="px-4 py-3 text-sm text-gray-600">
                        {metric ? formatPercentage(metric.value) : 'N/A'}
                      </td>
                    )
                  })}
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <Eye className="h-5 w-5 text-gray-500 hover:text-primary-600" />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <ResponseModal response={selectedResponse} onClose={() => setSelectedResponse(null)} />
    </div>
  )
}
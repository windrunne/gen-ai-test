import { useState } from 'react'
import { Response } from '../api/experiments'
import { Eye, TrendingUp } from 'lucide-react'
import Modal from './Modal'

interface ComparisonViewProps {
  responses: Response[]
}

interface ResponseModalProps {
  response: Response | null
  onClose: () => void
}

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
        {validation && (validation.is_truncated || validation.is_corrupted || validation.warnings.length > 0) && (
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
                    {validation.warnings.map((warning, idx) => (
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
                      Corruption Score: {(validation.corruption_score * 100).toFixed(1)}%
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
              Overall Score: {(overallScore.value * 100).toFixed(1)}%
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
                  {(metric.value * 100).toFixed(1)}%
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
    key: keyof Response | 'overall_score'
    direction: 'asc' | 'desc'
  }>({ key: 'overall_score', direction: 'desc' })

  // Sort responses
  const sortedResponses = [...responses].sort((a, b) => {
    let aValue: number
    let bValue: number

    if (sortConfig.key === 'overall_score') {
      const aOverall = a.metrics.find((m) => m.name === 'overall_score')?.value || 0
      const bOverall = b.metrics.find((m) => m.name === 'overall_score')?.value || 0
      aValue = aOverall
      bValue = bOverall
    } else if (sortConfig.key === 'temperature' || sortConfig.key === 'top_p') {
      aValue = a[sortConfig.key]
      bValue = b[sortConfig.key]
    } else {
      return 0
    }

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1
    }
    return 0
  })

  const handleSort = (key: keyof Response | 'overall_score') => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  const SortIcon = ({ columnKey }: { columnKey: keyof Response | 'overall_score' }) => {
    if (sortConfig.key !== columnKey) return null
    return sortConfig.direction === 'asc' ? '↑' : '↓'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <TrendingUp className="h-5 w-5 text-primary-600" />
        <h2 className="text-xl font-semibold">All Responses Comparison</h2>
        <span className="text-sm text-gray-500">({responses.length} responses)</span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 bg-white rounded-lg shadow">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('overall_score')}
              >
                <div className="flex items-center space-x-1">
                  <span>Overall Score</span>
                  <SortIcon columnKey="overall_score" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('temperature')}
              >
                <div className="flex items-center space-x-1">
                  <span>Temperature</span>
                  <SortIcon columnKey="temperature" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('top_p')}
              >
                <div className="flex items-center space-x-1">
                  <span>Top P</span>
                  <SortIcon columnKey="top_p" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Length Score
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Coherence
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Completeness
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Structure
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Readability
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedResponses.map((response) => {
              const overallScore = response.metrics.find((m) => m.name === 'overall_score')
              const lengthScore = response.metrics.find((m) => m.name === 'length_score')
              const coherenceScore = response.metrics.find((m) => m.name === 'coherence_score')
              const completenessScore = response.metrics.find((m) => m.name === 'completeness_score')
              const structureScore = response.metrics.find((m) => m.name === 'structure_score')
              const readabilityScore = response.metrics.find((m) => m.name === 'readability_score')
              const validation = response.validation_metadata
              const hasWarning = validation && (validation.is_truncated || validation.is_corrupted || validation.warnings.length > 0)

              return (
                <tr
                  key={response.id}
                  className={`hover:bg-gray-50 cursor-pointer transition-colors ${hasWarning ? 'bg-yellow-50' : ''}`}
                  onClick={() => setSelectedResponse(response)}
                >
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="font-semibold text-gray-900">
                        {overallScore ? `${(overallScore.value * 100).toFixed(1)}%` : 'N/A'}
                      </div>
                      {hasWarning && (
                        <span className="text-yellow-600" title={validation?.warnings.join(', ') || 'Response quality warning'}>
                          ⚠️
                        </span>
                      )}
                      <div
                        className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden"
                        title={`${overallScore ? (overallScore.value * 100).toFixed(1) : 0}%`}
                      >
                        <div
                          className="h-full bg-primary-600 transition-all"
                          style={{
                            width: `${overallScore ? overallScore.value * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{response.temperature}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{response.top_p}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {lengthScore ? `${(lengthScore.value * 100).toFixed(1)}%` : 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {coherenceScore ? `${(coherenceScore.value * 100).toFixed(1)}%` : 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {completenessScore ? `${(completenessScore.value * 100).toFixed(1)}%` : 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {structureScore ? `${(structureScore.value * 100).toFixed(1)}%` : 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {readabilityScore ? `${(readabilityScore.value * 100).toFixed(1)}%` : 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedResponse(response)
                      }}
                      className="btn-secondary text-sm flex items-center space-x-1"
                      aria-label="View response details"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {selectedResponse && (
        <ResponseModal
          response={selectedResponse}
          onClose={() => setSelectedResponse(null)}
        />
      )}
    </div>
  )
}
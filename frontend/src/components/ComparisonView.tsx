import { useState } from 'react'
import { Response } from '../api/experiments'
import { Eye, TrendingUp } from 'lucide-react'

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Response Details</h3>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
              <span>Temperature: {response.temperature}</span>
              <span>Top P: {response.top_p}</span>
              {overallScore && (
                <span className="font-semibold text-primary-600">
                  Overall Score: {(overallScore.value * 100).toFixed(1)}%
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        
        <div className="p-6">
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
      </div>
    </div>
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

              return (
                <tr
                  key={response.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedResponse(response)}
                >
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="font-semibold text-gray-900">
                        {overallScore ? `${(overallScore.value * 100).toFixed(1)}%` : 'N/A'}
                      </div>
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
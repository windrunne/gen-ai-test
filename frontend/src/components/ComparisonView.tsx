import { useState } from 'react'
import { Response } from '../api/experiments'
import { GitCompare, ChevronLeft, ChevronRight } from 'lucide-react'

interface ComparisonViewProps {
  responses: Response[]
}

export default function ComparisonView({ responses }: ComparisonViewProps) {
  const [selectedIndices, setSelectedIndices] = useState<[number, number]>([0, 1])

  const response1 = responses[selectedIndices[0]]
  const response2 = responses[selectedIndices[1]]

  const navigateComparison = (direction: 'prev' | 'next') => {
    if (direction === 'next') {
      if (selectedIndices[1] < responses.length - 1) {
        setSelectedIndices([selectedIndices[0], selectedIndices[1] + 1])
      } else if (selectedIndices[0] < responses.length - 2) {
        setSelectedIndices([selectedIndices[0] + 1, selectedIndices[0] + 2])
      }
    } else {
      if (selectedIndices[0] > 0) {
        setSelectedIndices([selectedIndices[0] - 1, selectedIndices[1] - 1])
      }
    }
  }

  const overall1 = response1.metrics.find((m) => m.name === 'overall_score')
  const overall2 = response2.metrics.find((m) => m.name === 'overall_score')

  return (
    <div className="space-y-4">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateComparison('prev')}
          disabled={selectedIndices[0] === 0}
          className="btn-secondary disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>
        <div className="flex items-center space-x-2">
          <GitCompare className="h-5 w-5 text-primary-600" />
          <span className="text-sm text-gray-600">
            Comparing {selectedIndices[0] + 1} and {selectedIndices[1] + 1} of{' '}
            {responses.length}
          </span>
        </div>
        <button
          onClick={() => navigateComparison('next')}
          disabled={selectedIndices[1] >= responses.length - 1}
          className="btn-secondary disabled:opacity-50"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Comparison Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Response 1 */}
        <div className="card border-2 border-primary-200">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Response {selectedIndices[0] + 1}</h3>
              {overall1 && (
                <span className="text-sm font-semibold text-primary-600">
                  Score: {(overall1.value * 100).toFixed(1)}%
                </span>
              )}
            </div>
            <div className="flex space-x-4 text-sm text-gray-600">
              <span>Temp: {response1.temperature}</span>
              <span>Top P: {response1.top_p}</span>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
            <p className="text-sm whitespace-pre-wrap">{response1.text}</p>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
            {response1.metrics.slice(0, 6).map((metric) => (
              <div key={metric.name} className="text-center">
                <div className="text-gray-500 capitalize">
                  {metric.name.replace('_score', '').replace('_', ' ')}
                </div>
                <div className="font-semibold">
                  {(metric.value * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Response 2 */}
        <div className="card border-2 border-blue-200">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Response {selectedIndices[1] + 1}</h3>
              {overall2 && (
                <span className="text-sm font-semibold text-blue-600">
                  Score: {(overall2.value * 100).toFixed(1)}%
                </span>
              )}
            </div>
            <div className="flex space-x-4 text-sm text-gray-600">
              <span>Temp: {response2.temperature}</span>
              <span>Top P: {response2.top_p}</span>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
            <p className="text-sm whitespace-pre-wrap">{response2.text}</p>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
            {response2.metrics.slice(0, 6).map((metric) => (
              <div key={metric.name} className="text-center">
                <div className="text-gray-500 capitalize">
                  {metric.name.replace('_score', '').replace('_', ' ')}
                </div>
                <div className="font-semibold">
                  {(metric.value * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

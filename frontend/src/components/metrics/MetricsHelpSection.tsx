/**
 * Metrics Help Section Component - Collapsible explanation of metrics
 */
import { useState } from 'react'
import { Info } from 'lucide-react'

export default function MetricsHelpSection() {
  const [showHelp, setShowHelp] = useState(false)

  return (
    <div className="mb-4">
      <button
        onClick={() => setShowHelp(!showHelp)}
        className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Info className="h-4 w-4" />
        <span>{showHelp ? 'Hide' : 'Show'} explanation</span>
      </button>

      {showHelp && (
        <div className="mt-2 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <h4 className="font-semibold mb-2 text-gray-900">Understanding the Statistics:</h4>
          <ul className="space-y-1 text-gray-700 mb-3">
            <li>
              <strong>Mean:</strong> Average score across all responses. Higher = better overall quality.
            </li>
            <li>
              <strong>Median:</strong> Middle value when scores are sorted. Less affected by outliers.
            </li>
            <li>
              <strong>Min:</strong> Lowest score found. Shows worst-case performance.
            </li>
            <li>
              <strong>Max:</strong> Highest score found. Shows best-case performance.
            </li>
            <li>
              <strong>Std Dev:</strong> Standard deviation - measures consistency. Lower = more consistent results.
            </li>
          </ul>
          <div className="pt-3 border-t border-blue-200">
            <h4 className="font-semibold mb-2 text-gray-900">What Each Metric Measures:</h4>
            <ul className="space-y-1 text-gray-700">
              <li>
                <strong>Length:</strong> Response length appropriateness (optimal: 50-2000 characters)
              </li>
              <li>
                <strong>Coherence:</strong> How well-structured and logically connected the text is
              </li>
              <li>
                <strong>Completeness:</strong> Whether the response fully addresses the prompt
              </li>
              <li>
                <strong>Structure:</strong> Text organization (paragraphs, lists, headers)
              </li>
              <li>
                <strong>Readability:</strong> How easy the text is to read (sentence/word length, vocabulary)
              </li>
              <li>
                <strong>Overall:</strong> Weighted average of all metrics (0-100%)
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

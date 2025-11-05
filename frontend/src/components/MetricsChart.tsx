import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Info } from 'lucide-react'
import { useState } from 'react'
import { MetricsSummary } from '../api/experiments'

interface MetricsChartProps {
  metricsSummary: MetricsSummary
}

export default function MetricsChart({ metricsSummary }: MetricsChartProps) {
  const [showHelp, setShowHelp] = useState(false)

  // Prepare data for chart
  const chartData = Object.entries(metricsSummary).map(([name, data]) => ({
    name: name.replace('_score', '').replace('_', ' ').toUpperCase(),
    mean: Number((data.mean * 100).toFixed(1)),
    min: Number((data.min * 100).toFixed(1)),
    max: Number((data.max * 100).toFixed(1)),
  }))

  return (
    <div className="w-full">
      {/* Help Section */}
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
              <li><strong>Mean:</strong> Average score across all responses. Higher = better overall quality.</li>
              <li><strong>Median:</strong> Middle value when scores are sorted. Less affected by outliers.</li>
              <li><strong>Min:</strong> Lowest score found. Shows worst-case performance.</li>
              <li><strong>Max:</strong> Highest score found. Shows best-case performance.</li>
              <li><strong>Std Dev:</strong> Standard deviation - measures consistency. Lower = more consistent results.</li>
            </ul>
            <div className="pt-3 border-t border-blue-200">
              <h4 className="font-semibold mb-2 text-gray-900">What Each Metric Measures:</h4>
              <ul className="space-y-1 text-gray-700">
                <li><strong>Length:</strong> Response length appropriateness (optimal: 50-2000 characters)</li>
                <li><strong>Coherence:</strong> How well-structured and logically connected the text is</li>
                <li><strong>Completeness:</strong> Whether the response fully addresses the prompt</li>
                <li><strong>Structure:</strong> Text organization (paragraphs, lists, headers)</li>
                <li><strong>Readability:</strong> How easy the text is to read (sentence/word length, vocabulary)</li>
                <li><strong>Overall:</strong> Weighted average of all metrics (0-100%)</li>
              </ul>
            </div>
          </div>
        )}
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={100}
            fontSize={12}
          />
          <YAxis
            label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }}
            domain={[0, 100]}
          />
          <Tooltip />
          <Legend />
          <Bar dataKey="mean" fill="#0ea5e9" name="Mean Score" />
          <Bar dataKey="min" fill="#94a3b8" name="Min" />
          <Bar dataKey="max" fill="#3b82f6" name="Max" />
        </BarChart>
      </ResponsiveContainer>

      {/* Statistics Table */}
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase" title="Average score across all responses">
                Mean
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase" title="Middle value when scores are sorted">
                Median
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase" title="Lowest score found">
                Min
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase" title="Highest score found">
                Max
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase" title="Standard deviation - lower = more consistent">
                Std Dev
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(metricsSummary).map(([name, data]) => (
              <tr key={name}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 capitalize">
                  {name.replace('_score', '').replace('_', ' ')}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {(data.mean * 100).toFixed(2)}%
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {(data.median * 100).toFixed(2)}%
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {(data.min * 100).toFixed(2)}%
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {(data.max * 100).toFixed(2)}%
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {(data.std_dev * 100).toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

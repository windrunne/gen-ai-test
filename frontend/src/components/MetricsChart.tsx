import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { MetricsSummary } from '../api/experiments'

interface MetricsChartProps {
  metricsSummary: MetricsSummary
}

export default function MetricsChart({ metricsSummary }: MetricsChartProps) {
  // Prepare data for chart
  const chartData = Object.entries(metricsSummary).map(([name, data]) => ({
    name: name.replace('_score', '').replace('_', ' ').toUpperCase(),
    mean: Number((data.mean * 100).toFixed(1)),
    min: Number((data.min * 100).toFixed(1)),
    max: Number((data.max * 100).toFixed(1)),
  }))

  return (
    <div className="w-full">
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
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Metric
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Mean
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Median
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Min
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Max
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
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

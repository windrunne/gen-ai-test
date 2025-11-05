/**
 * Metrics Bar Chart Component
 */
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { MetricsSummary } from '../types'
import { formatMetricName } from '../utils'
import { METRIC_DISPLAY } from '../constants'

interface MetricsBarChartProps {
  metricsSummary: MetricsSummary
}

export default function MetricsBarChart({ metricsSummary }: MetricsBarChartProps) {
  const chartData = Object.entries(metricsSummary).map(([name, data]) => ({
    name: formatMetricName(name).toUpperCase(),
    mean: Number((data.mean * METRIC_DISPLAY.PERCENTAGE_MULTIPLIER).toFixed(METRIC_DISPLAY.DECIMAL_PLACES)),
    min: Number((data.min * METRIC_DISPLAY.PERCENTAGE_MULTIPLIER).toFixed(METRIC_DISPLAY.DECIMAL_PLACES)),
    max: Number((data.max * METRIC_DISPLAY.PERCENTAGE_MULTIPLIER).toFixed(METRIC_DISPLAY.DECIMAL_PLACES)),
  }))

  return (
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
        <Bar dataKey="min" fill="#94a3b8" name="Min Score" />
        <Bar dataKey="max" fill="#3b82f6" name="Max Score" />
      </BarChart>
    </ResponsiveContainer>
  )
}

/**
 * Metrics Chart Component - Displays metrics summary with chart and table
 */
import type { MetricsChartProps } from './types'
import MetricsHelpSection from './MetricsHelpSection'
import MetricsBarChart from './MetricsBarChart'
import MetricsStatisticsTable from './MetricsStatisticsTable'

export default function MetricsChart({ metricsSummary }: MetricsChartProps) {
  return (
    <div className="w-full">
      <MetricsHelpSection />
      <MetricsBarChart metricsSummary={metricsSummary} />
      <MetricsStatisticsTable metricsSummary={metricsSummary} />
    </div>
  )
}
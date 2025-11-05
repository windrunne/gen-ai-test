/**
 * Experiment Detail Page - View experiment results
 */
import { useParams } from 'react-router-dom'
import { BarChart3 } from 'lucide-react'
import MetricsChart from '../components/metrics/MetricsChart'
import ComparisonView from '../components/responses/ComparisonView'
import ExperimentHeader from '../components/experiments/ExperimentHeader'
import ExperimentInfo from '../components/experiments/ExperimentInfo'
import LoadingSpinner from '../components/common/LoadingSpinner'
import {
  useExperiment,
  useExperimentResponses,
  useExperimentMetrics,
} from '../hooks'
import { exportApi } from '../api'

export default function ExperimentDetail() {
  const { id } = useParams<{ id: string }>()
  const experimentId = parseInt(id || '0')

  const { data: experiment, isLoading: expLoading } = useExperiment(experimentId)
  const { data: responses, isLoading: respLoading } = useExperimentResponses(experimentId)
  const { data: metricsSummary } = useExperimentMetrics(experimentId)

  const handleExportCSV = async () => {
    try {
      await exportApi.exportCSV(experimentId)
    } catch (error) {
      alert('Failed to export CSV: ' + (error as Error).message)
    }
  }

  const handleExportJSON = async () => {
    try {
      await exportApi.exportJSON(experimentId)
    } catch (error) {
      alert('Failed to export JSON: ' + (error as Error).message)
    }
  }

  if (expLoading || respLoading) {
    return <LoadingSpinner size="lg" className="h-64" />
  }

  if (!experiment) {
    return (
      <div className="card">
        <p className="text-red-700">Experiment not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ExperimentHeader
        onExportCSV={handleExportCSV}
        onExportJSON={handleExportJSON}
      />

      <ExperimentInfo experiment={experiment} />

      {metricsSummary && Object.keys(metricsSummary).length > 0 && (
        <div className="card">
          <div className="flex items-center mb-4">
            <BarChart3 className="h-6 w-6 text-primary-600 mr-2" />
            <h2 className="text-xl font-semibold">Metrics Summary</h2>
          </div>
          <MetricsChart metricsSummary={metricsSummary} />
        </div>
      )}

      {responses && responses.length > 0 ? (
        <div className="card">
          <ComparisonView responses={responses} />
        </div>
      ) : (
        <div className="card text-center py-8">
          <p className="text-gray-500">No responses generated yet</p>
        </div>
      )}
    </div>
  )
}
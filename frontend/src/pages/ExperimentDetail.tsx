/**
 * Experiment Detail Page - View experiment results
 */
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Loader2, BarChart3 } from 'lucide-react'
import MetricsChart from '../components/MetricsChart'
import ComparisonView from '../components/ComparisonView'
import {
  useExperiment,
  useExperimentResponses,
  useExperimentMetrics,
} from '../hooks'
import { exportApi } from '../api'
import { formatDate } from '../utils'

export default function ExperimentDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
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
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/experiments')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Experiments
        </button>
        <div className="flex space-x-2">
          <button onClick={handleExportCSV} className="btn-secondary">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
          <button onClick={handleExportJSON} className="btn-secondary">
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </button>
        </div>
      </div>

      {/* Experiment Info */}
      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {experiment.name}
        </h1>
        <p className="text-gray-600 mb-4">{experiment.prompt}</p>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span>
            {experiment.response_count} response
            {experiment.response_count !== 1 ? 's' : ''}
          </span>
          <span>•</span>
          <span>Created {formatDate(experiment.created_at)}</span>
        </div>
      </div>

      {/* Metrics Summary */}
      {metricsSummary && Object.keys(metricsSummary).length > 0 && (
        <div className="card">
          <div className="flex items-center mb-4">
            <BarChart3 className="h-6 w-6 text-primary-600 mr-2" />
            <h2 className="text-xl font-semibold">Metrics Summary</h2>
          </div>
          <MetricsChart metricsSummary={metricsSummary} />
        </div>
      )}

      {/* Comparison View - Shows all responses in table format */}
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
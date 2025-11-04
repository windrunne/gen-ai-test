import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  Download,
  Loader2,
  TrendingUp,
  BarChart3,
  FileText,
} from 'lucide-react'
import { experimentsApi, Response, MetricsSummary } from '../api/experiments'
import ResponseCard from '../components/ResponseCard'
import MetricsChart from '../components/MetricsChart'
import ComparisonView from '../components/ComparisonView'

export default function ExperimentDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const experimentId = parseInt(id || '0')

  const { data: experiment, isLoading: expLoading } = useQuery({
    queryKey: ['experiment', experimentId],
    queryFn: () => experimentsApi.get(experimentId),
    enabled: !!experimentId,
  })

  const { data: responses, isLoading: respLoading } = useQuery({
    queryKey: ['responses', experimentId],
    queryFn: () => experimentsApi.getResponses(experimentId),
    enabled: !!experimentId,
  })

  const { data: metricsSummary } = useQuery({
    queryKey: ['metrics', experimentId],
    queryFn: () => experimentsApi.getMetricsSummary(experimentId),
    enabled: !!experimentId,
  })

  const handleExportCSV = async () => {
    try {
      const blob = await experimentsApi.exportCSV(experimentId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `experiment_${experimentId}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      alert('Failed to export CSV: ' + (error as Error).message)
    }
  }

  const handleExportJSON = async () => {
    try {
      const blob = await experimentsApi.exportJSON(experimentId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `experiment_${experimentId}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
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
          <span>
            Created {new Date(experiment.created_at).toLocaleString()}
          </span>
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

      {/* Responses */}
      <div>
        <div className="flex items-center mb-4">
          <FileText className="h-6 w-6 text-primary-600 mr-2" />
          <h2 className="text-xl font-semibold">Responses</h2>
        </div>
        {responses && responses.length > 0 ? (
          <div className="space-y-4">
            {responses.map((response) => (
              <ResponseCard key={response.id} response={response} />
            ))}
          </div>
        ) : (
          <div className="card text-center py-8">
            <p className="text-gray-500">No responses generated yet</p>
          </div>
        )}
      </div>

      {/* Comparison View */}
      {responses && responses.length > 1 && (
        <div className="card">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-6 w-6 text-primary-600 mr-2" />
            <h2 className="text-xl font-semibold">Comparison View</h2>
          </div>
          <ComparisonView responses={responses} />
        </div>
      )}
    </div>
  )
}

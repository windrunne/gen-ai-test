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
import { experimentsApi, MetricsSummary } from '../api/experiments'
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate('/experiments')}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors group"
        >
          <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Experiments</span>
        </button>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={handleExportCSV} 
            className="btn-secondary flex items-center shadow-sm hover:shadow-md transition-shadow"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
          <button 
            onClick={handleExportJSON} 
            className="btn-secondary flex items-center shadow-sm hover:shadow-md transition-shadow"
          >
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </button>
        </div>
      </div>

      {/* Experiment Info */}
      <div className="card shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              {experiment.name}
            </h1>
            <p className="text-gray-700 text-lg leading-relaxed mb-6">{experiment.prompt}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-200">
          <div className="flex items-center text-sm text-gray-600">
            <FileText className="h-4 w-4 mr-2 text-primary-600" />
            <span className="font-medium">
              {experiment.response_count} response{experiment.response_count !== 1 ? 's' : ''}
            </span>
          </div>
          <span className="text-gray-300">•</span>
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2 text-primary-600" />
            <span>Created {new Date(experiment.created_at).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Metrics Summary */}
      {metricsSummary && Object.keys(metricsSummary).length > 0 && (
        <div className="card shadow-lg border-0">
          <div className="flex items-center mb-6 pb-4 border-b border-gray-200">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mr-4">
              <BarChart3 className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Metrics Summary</h2>
              <p className="text-sm text-gray-500 mt-1">Statistical overview of all responses</p>
            </div>
          </div>
          <MetricsChart metricsSummary={metricsSummary} />
        </div>
      )}

      {/* Comparison View - Shows all responses in table format */}
      {responses && responses.length > 0 ? (
        <div className="card shadow-lg border-0">
          <div className="flex items-center mb-6 pb-4 border-b border-gray-200">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mr-4">
              <TrendingUp className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Response Comparison</h2>
              <p className="text-sm text-gray-500 mt-1">{responses.length} responses generated</p>
            </div>
          </div>
          <ComparisonView responses={responses} />
        </div>
      ) : (
        <div className="card text-center py-12 bg-gray-50/50">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No responses generated yet</p>
          <p className="text-sm text-gray-500 mt-2">Responses will appear here once generation completes</p>
        </div>
      )}
    </div>
  )
}

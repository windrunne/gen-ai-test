import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { TestTube, Clock, Loader2 } from 'lucide-react'
import { experimentsApi } from '../api/experiments'

export default function ExperimentsList() {
  const { data: experiments, isLoading, error } = useQuery({
    queryKey: ['experiments'],
    queryFn: experimentsApi.list,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="card bg-red-50 border-red-200">
        <p className="text-red-700">Error loading experiments: {error.message}</p>
      </div>
    )
  }

  if (!experiments || experiments.length === 0) {
    return (
      <div className="text-center py-12">
        <TestTube className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          No Experiments Yet
        </h2>
        <p className="text-gray-600 mb-6">
          Create your first experiment to get started
        </p>
        <Link to="/" className="btn-primary inline-block">
          Create Experiment
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            Experiments
          </h1>
          <p className="text-gray-600">View and manage your LLM experiments</p>
        </div>
        <Link 
          to="/" 
          className="btn-primary flex items-center shadow-md hover:shadow-lg transition-all hover:scale-105"
        >
          <TestTube className="h-4 w-4 mr-2" />
          New Experiment
        </Link>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {experiments.map((experiment) => (
          <Link
            key={experiment.id}
            to={`/experiments/${experiment.id}`}
            className="card hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-0 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <TestTube className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                #{experiment.id}
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
              {experiment.name}
            </h3>
            <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
              {experiment.prompt}
            </p>
            <div className="flex items-center text-xs text-gray-500 pt-4 border-t border-gray-100">
              <Clock className="h-4 w-4 mr-1.5 text-primary-600" />
              <span>{new Date(experiment.created_at).toLocaleDateString()}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

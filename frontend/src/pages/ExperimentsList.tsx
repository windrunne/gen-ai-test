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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Experiments</h1>
        <Link to="/" className="btn-primary">
          + New Experiment
        </Link>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {experiments.map((experiment) => (
          <Link
            key={experiment.id}
            to={`/experiments/${experiment.id}`}
            className="card hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <TestTube className="h-6 w-6 text-primary-600" />
              <span className="text-xs text-gray-500">
                #{experiment.id}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {experiment.name}
            </h3>
            <p className="text-sm text-gray-600 mb-4 line-clamp-3">
              {experiment.prompt}
            </p>
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              {new Date(experiment.created_at).toLocaleDateString()}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

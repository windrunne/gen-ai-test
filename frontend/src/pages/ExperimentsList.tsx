/**
 * Experiments List Page - View all experiments
 */
import { useNavigate } from 'react-router-dom'
import { Loader2, Trash2, FileText } from 'lucide-react'
import { useExperiments, useDeleteExperiment } from '../hooks'
import { formatDate } from '../utils'

export default function ExperimentsList() {
  const navigate = useNavigate()
  const { data: experiments, isLoading } = useExperiments()
  const deleteExperiment = useDeleteExperiment()

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this experiment?')) {
      deleteExperiment.mutate(id)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Experiments</h1>
        <button
          onClick={() => navigate('/')}
          className="btn-primary"
        >
          + New Experiment
        </button>
      </div>

      {!experiments || experiments.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No experiments yet</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Create Your First Experiment
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {experiments.map((experiment) => (
            <div
              key={experiment.id}
              onClick={() => navigate(`/experiments/${experiment.id}`)}
              className="card cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-xl font-semibold text-gray-900 flex-1">
                  {experiment.name}
                </h2>
                <button
                  onClick={(e) => handleDelete(experiment.id, e)}
                  className="text-red-500 hover:text-red-700 p-1"
                  aria-label="Delete experiment"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {experiment.prompt}
              </p>
              <p className="text-xs text-gray-500">
                {formatDate(experiment.created_at)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
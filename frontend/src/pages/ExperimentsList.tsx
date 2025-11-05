/**
 * Experiments List Page - View all experiments
 */
import { useNavigate } from 'react-router-dom'
import { Trash2, FileText } from 'lucide-react'
import ExperimentCard from '../components/ExperimentCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { useExperiments, useDeleteExperiment } from '../hooks'

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
    return <LoadingSpinner size="lg" className="h-64" />
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Experiments</h1>
        <button onClick={() => navigate('/')} className="btn-primary">
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
            <ExperimentCard
              key={experiment.id}
              experiment={experiment}
              onSelect={() => navigate(`/experiments/${experiment.id}`)}
              onDelete={(e) => handleDelete(experiment.id, e)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
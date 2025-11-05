/**
 * Experiment Header Component
 */
import { ArrowLeft, Download } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface ExperimentHeaderProps {
  onExportCSV: () => void
  onExportJSON: () => void
}

export default function ExperimentHeader({
  onExportCSV,
  onExportJSON,
}: ExperimentHeaderProps) {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-between">
      <button
        onClick={() => navigate('/experiments')}
        className="flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Experiments
      </button>
      <div className="flex space-x-2">
        <button onClick={onExportCSV} className="btn-secondary flex gap-2 items-center">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </button>
        <button onClick={onExportJSON} className="btn-secondary flex gap-2 items-center">
          <Download className="h-4 w-4 mr-2" />
          Export JSON
        </button>
      </div>
    </div>
  )
}

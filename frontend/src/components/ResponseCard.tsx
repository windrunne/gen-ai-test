import { Response } from '../api/experiments'
import { Thermometer, Target, Zap } from 'lucide-react'

interface ResponseCardProps {
  response: Response
}

export default function ResponseCard({ response }: ResponseCardProps) {
  const overallScore = response.metrics.find((m) => m.name === 'overall_score')
  const coherenceScore = response.metrics.find((m) => m.name === 'coherence_score')
  const completenessScore = response.metrics.find((m) => m.name === 'completeness_score')

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm">
            <Thermometer className="h-4 w-4 text-orange-500" />
            <span className="font-medium">Temp: {response.temperature}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Target className="h-4 w-4 text-blue-500" />
            <span className="font-medium">Top P: {response.top_p}</span>
          </div>
        </div>
        {overallScore && (
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="font-semibold">
              Overall: {(overallScore.value * 100).toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      <div className="mb-4">
        <p className="text-gray-700 whitespace-pre-wrap">{response.text}</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
        {response.metrics.map((metric) => (
          <div key={metric.name} className="text-center">
            <div className="text-xs text-gray-500 mb-1 capitalize">
              {metric.name.replace('_', ' ')}
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {(metric.value * 100).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

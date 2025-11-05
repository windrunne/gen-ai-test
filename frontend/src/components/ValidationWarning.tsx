/**
 * Validation Warning Component - Displays response quality warnings
 */
import { formatPercentage } from '../utils'
import type { ValidationMetadata } from '../types'
import { FileWarningIcon } from 'lucide-react'

interface ValidationWarningProps {
  validation: ValidationMetadata
  className?: string
}

export default function ValidationWarning({ validation, className = '' }: ValidationWarningProps) {
  return (
    <div className={`p-4 bg-yellow-50 border border-yellow-200 rounded-lg ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <FileWarningIcon className="w-5 h-5 text-yellow-600"/>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Response Quality Warning
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <ul className="list-disc list-inside space-y-1">
              {validation.warnings.map((warning, idx) => (
                <li key={idx}>{warning}</li>
              ))}
              {validation.is_truncated && (
                <li>Response was cut off due to token limit</li>
              )}
              {validation.is_corrupted && (
                <li>Response may contain corrupted or low-quality content</li>
              )}
            </ul>
            {validation.corruption_score > 0 && (
              <p className="mt-2 text-xs">
                Corruption Score: {formatPercentage(validation.corruption_score)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

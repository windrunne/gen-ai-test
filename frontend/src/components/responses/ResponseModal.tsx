/**
 * Response Modal Component - Displays detailed response information
 */
import Modal from '../common/Modal'
import type { ResponseModalProps } from '../types'
import { formatPercentage, hasResponseWarnings, formatMetricName } from '../../utils'

export default function ResponseModal({ response, onClose }: ResponseModalProps) {
  if (!response) return null

  const overallScore = response.metrics.find((m) => m.name === 'overall_score')
  const validation = response.validation_metadata

  return (
    <Modal
      isOpen={!!response}
      onClose={onClose}
      title="Response Details"
      size="xl"
    >
      <div className="p-6">
        {/* Validation Warnings */}
        {validation && hasResponseWarnings(validation) && (
          <ValidationWarningBanner validation={validation} />
        )}

        {/* Response Header */}
        <ResponseHeader
          temperature={response.temperature}
          topP={response.top_p}
          overallScore={overallScore?.value}
        />

        {/* Response Text */}
        <ResponseTextSection text={response.text} />

        {/* Metrics Grid */}
        <MetricsGrid metrics={response.metrics} />
      </div>
    </Modal>
  )
}

/**
 * Validation Warning Banner Component
 */
interface ValidationWarningBannerProps {
  validation: {
    warnings?: string[]
    is_truncated?: boolean
    is_corrupted?: boolean
    corruption_score?: number
  }
}

function ValidationWarningBanner({ validation }: ValidationWarningBannerProps) {
  return (
    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98 1.742 2.98H4.42c1.955 0 2.492-1.646 1.742-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Response Quality Warning
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <ul className="list-disc list-inside space-y-1">
              {validation.warnings?.map((warning, idx) => (
                <li key={idx}>{warning}</li>
              ))}
              {validation.is_truncated && (
                <li>Response was cut off due to token limit</li>
              )}
              {validation.is_corrupted && (
                <li>Response may contain corrupted or low-quality content</li>
              )}
            </ul>
            {validation.corruption_score && validation.corruption_score > 0 && (
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

/**
 * Response Header Component
 */
interface ResponseHeaderProps {
  temperature: number
  topP: number
  overallScore?: number
}

function ResponseHeader({ temperature, topP, overallScore }: ResponseHeaderProps) {
  return (
    <div className="flex items-center space-x-4 mb-6 text-sm text-gray-600 border-b border-gray-200 pb-4">
      <span>Temperature: {temperature}</span>
      <span>Top P: {topP}</span>
      {overallScore !== undefined && (
        <span className="font-semibold text-primary-600">
          Overall Score: {formatPercentage(overallScore)}
        </span>
      )}
    </div>
  )
}

/**
 * Response Text Section Component
 */
interface ResponseTextSectionProps {
  text: string
}

function ResponseTextSection({ text }: ResponseTextSectionProps) {
  return (
    <div className="mb-6">
      <h4 className="text-sm font-semibold text-gray-700 mb-2">Response Text:</h4>
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-gray-700 whitespace-pre-wrap">{text}</p>
      </div>
    </div>
  )
}

/**
 * Metrics Grid Component
 */
interface MetricsGridProps {
  metrics: Array<{ name: string; value: number }>
}

function MetricsGrid({ metrics }: MetricsGridProps) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-700 mb-4">Metrics:</h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <div key={metric.name} className="bg-gray-50 p-4 rounded-lg">
            <div className="text-xs text-gray-500 mb-1 capitalize">
              {formatMetricName(metric.name)}
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatPercentage(metric.value)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

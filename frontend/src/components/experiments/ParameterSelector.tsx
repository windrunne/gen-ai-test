/**
 * Parameter Selector Component - Reusable for temperature and top_p
 */
import { X } from 'lucide-react'
import type { ParameterType } from '../../types'

interface ParameterSelectorProps {
  type: ParameterType
  values: number[]
  onAdd: () => void
  onRemove: (index: number) => void
  label: string
  description: string
}

export default function ParameterSelector({
  type,
  values,
  onAdd,
  onRemove,
  label,
  description,
}: ParameterSelectorProps) {
  const colorClass = type === 'temperature' ? 'bg-primary-100 text-primary-800' : 'bg-blue-100 text-blue-800'
  const buttonColorClass = type === 'temperature' ? 'text-primary-600 hover:text-primary-800' : 'text-blue-600 hover:text-blue-800'

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {values.map((value, index) => (
          <span
            key={index}
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${colorClass}`}
          >
            {value}
            <button
              type="button"
              onClick={() => onRemove(index)}
              className={`ml-2 ${buttonColorClass}`}
              aria-label={`Remove ${type} ${value}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="btn-secondary text-sm"
      >
        + Add {label} Value
      </button>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </div>
  )
}

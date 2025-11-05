import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface ParameterModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (value: number) => void
  type: 'temperature' | 'top_p'
  existingValues: number[]
}

export default function ParameterModal({
  isOpen,
  onClose,
  onAdd,
  type,
  existingValues,
}: ParameterModalProps) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setValue('')
      setError('')
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate input
    const numValue = parseFloat(value)
    
    if (!value.trim()) {
      setError('Please enter a value')
      return
    }

    if (isNaN(numValue)) {
      setError('Please enter a valid number')
      return
    }

    // Validate range
    if (type === 'temperature') {
      if (numValue < 0 || numValue > 2) {
        setError('Temperature must be between 0.0 and 2.0')
        return
      }
    } else {
      // top_p
      if (numValue < 0 || numValue > 1) {
        setError('Top P must be between 0.0 and 1.0')
        return
      }
    }

    // Check for duplicates
    if (existingValues.includes(numValue)) {
      setError(`This value is already added`)
      return
    }

    // Add the value
    onAdd(numValue)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Add {type === 'temperature' ? 'Temperature' : 'Top P'} Value
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-2">
              {type === 'temperature' ? 'Temperature' : 'Top P'} Value
            </label>
            <input
              type="number"
              id="value"
              step="0.1"
              min={type === 'temperature' ? 0 : 0}
              max={type === 'temperature' ? 2 : 1}
              value={value}
              onChange={(e) => {
                setValue(e.target.value)
                setError('')
              }}
              className={`input-field ${error ? 'border-red-500' : ''}`}
              placeholder={type === 'temperature' ? '0.0 - 2.0' : '0.0 - 1.0'}
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Valid range: {type === 'temperature' ? '0.0 to 2.0' : '0.0 to 1.0'}
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              Add Value
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

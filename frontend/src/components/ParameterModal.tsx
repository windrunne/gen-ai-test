import { useState, useEffect, useRef } from 'react'
import Modal from './Modal'

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
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setValue('')
      setError('')
      // Focus input when modal opens
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate input
    const numValue = parseFloat(value)
    
    if (!value.trim()) {
      setError('Please enter a value')
      inputRef.current?.focus()
      return
    }

    if (isNaN(numValue)) {
      setError('Please enter a valid number')
      inputRef.current?.focus()
      return
    }

    // Validate range
    if (type === 'temperature') {
      if (numValue < 0 || numValue > 2) {
        setError('Temperature must be between 0.0 and 2.0')
        inputRef.current?.focus()
        return
      }
    } else {
      // top_p
      if (numValue < 0 || numValue > 1) {
        setError('Top P must be between 0.0 and 1.0')
        inputRef.current?.focus()
        return
      }
    }

    // Check for duplicates
    if (existingValues.includes(numValue)) {
      setError(`This value is already added`)
      inputRef.current?.focus()
      return
    }

    // Add the value
    onAdd(numValue)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add ${type === 'temperature' ? 'Temperature' : 'Top P'} Value`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="p-6">
        <div className="mb-4">
          <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-2">
            {type === 'temperature' ? 'Temperature' : 'Top P'} Value
          </label>
          <input
            ref={inputRef}
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
            className={`input-field ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
            placeholder={type === 'temperature' ? '0.0 - 2.0' : '0.0 - 1.0'}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? 'value-error' : 'value-hint'}
          />
          {error && (
            <p id="value-error" className="mt-2 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <p id="value-hint" className="mt-2 text-xs text-gray-500">
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
    </Modal>
  )
}

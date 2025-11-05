import { useState, useEffect, useRef } from 'react'
import Modal from './Modal'
import type { ParameterModalProps } from './types'
import { PARAMETER_CONSTRAINTS } from '../constants'
import { validateTemperature, validateTopP } from '../utils'

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
    const constraints = type === 'temperature' 
      ? PARAMETER_CONSTRAINTS.TEMPERATURE 
      : PARAMETER_CONSTRAINTS.TOP_P
    
    const isValid = type === 'temperature' 
      ? validateTemperature(numValue) 
      : validateTopP(numValue)
    
    if (!isValid) {
      setError(`${type === 'temperature' ? 'Temperature' : 'Top P'} must be between ${constraints.MIN} and ${constraints.MAX}`)
      inputRef.current?.focus()
      return
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
            step={type === 'temperature' ? PARAMETER_CONSTRAINTS.TEMPERATURE.STEP : PARAMETER_CONSTRAINTS.TOP_P.STEP}
            min={type === 'temperature' ? PARAMETER_CONSTRAINTS.TEMPERATURE.MIN : PARAMETER_CONSTRAINTS.TOP_P.MIN}
            max={type === 'temperature' ? PARAMETER_CONSTRAINTS.TEMPERATURE.MAX : PARAMETER_CONSTRAINTS.TOP_P.MAX}
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setError('')
            }}
            className={`input-field ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
            placeholder={`${type === 'temperature' ? PARAMETER_CONSTRAINTS.TEMPERATURE.MIN : PARAMETER_CONSTRAINTS.TOP_P.MIN} - ${type === 'temperature' ? PARAMETER_CONSTRAINTS.TEMPERATURE.MAX : PARAMETER_CONSTRAINTS.TOP_P.MAX}`}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? 'value-error' : 'value-hint'}
          />
          {error && (
            <p id="value-error" className="mt-2 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <p id="value-hint" className="mt-2 text-xs text-gray-500">
            Valid range: {type === 'temperature' 
              ? `${PARAMETER_CONSTRAINTS.TEMPERATURE.MIN} to ${PARAMETER_CONSTRAINTS.TEMPERATURE.MAX}` 
              : `${PARAMETER_CONSTRAINTS.TOP_P.MIN} to ${PARAMETER_CONSTRAINTS.TOP_P.MAX}`}
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

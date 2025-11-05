import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Loader2 } from 'lucide-react'
import { experimentsApi, ExperimentCreate } from '../api/experiments'
import ParameterModal from '../components/ParameterModal'

export default function Home() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<ExperimentCreate>({
    name: '',
    prompt: '',
    temperature_range: [0.5, 1.0, 1.5],
    top_p_range: [0.8, 0.9, 1.0],
    max_tokens: 1000,
  })

  const createExperiment = useMutation({
    mutationFn: experimentsApi.create,
    onSuccess: (data) => {
      navigate(`/experiments/${data.id}`)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createExperiment.mutate(formData)
  }

  const [showTempModal, setShowTempModal] = useState(false)
  const [showTopPModal, setShowTopPModal] = useState(false)

  const addTempValue = (value: number) => {
    setFormData({
      ...formData,
      temperature_range: [...formData.temperature_range, value].sort(
        (a, b) => a - b
      ),
    })
  }

  const removeTempValue = (index: number) => {
    setFormData({
      ...formData,
      temperature_range: formData.temperature_range.filter((_, i) => i !== index),
    })
  }

  const addTopPValue = (value: number) => {
    setFormData({
      ...formData,
      top_p_range: [...formData.top_p_range, value].sort((a, b) => a - b),
    })
  }

  const removeTopPValue = (index: number) => {
    setFormData({
      ...formData,
      top_p_range: formData.top_p_range.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8 animate-fade-in">
        <Sparkles className="h-16 w-16 text-primary-600 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          LLM Experimental Console
        </h1>
        <p className="text-lg text-gray-600">
          Explore how temperature and top_p parameters affect LLM responses
        </p>
      </div>

      <div className="card animate-slide-up">
        <h2 className="text-2xl font-semibold mb-6">Create New Experiment</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Experiment Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Experiment Name
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="input-field"
              placeholder="e.g., Prompt Analysis Experiment 1"
            />
          </div>

          {/* Prompt */}
          <div>
            <label
              htmlFor="prompt"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Prompt
            </label>
            <textarea
              id="prompt"
              required
              rows={6}
              value={formData.prompt}
              onChange={(e) =>
                setFormData({ ...formData, prompt: e.target.value })
              }
              className="input-field"
              placeholder="Enter your prompt here..."
            />
          </div>

          {/* Temperature Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Temperature Values (0.0 - 2.0)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.temperature_range.map((temp, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-700"
                >
                  {temp}
                  <button
                    type="button"
                    onClick={() => removeTempValue(index)}
                    className="ml-2 text-primary-600 hover:text-primary-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowTempModal(true)}
              className="btn-secondary text-sm"
            >
              + Add Temperature Value
            </button>
            <p className="text-xs text-gray-500 mt-1">
              Higher values = more randomness. Lower values = more focused.
            </p>
          </div>

          {/* Top P Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Top P Values (0.0 - 1.0)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.top_p_range.map((topP, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-700"
                >
                  {topP}
                  <button
                    type="button"
                    onClick={() => removeTopPValue(index)}
                    className="ml-2 text-primary-600 hover:text-primary-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowTopPModal(true)}
              className="btn-secondary text-sm"
            >
              + Add Top P Value
            </button>
            <p className="text-xs text-gray-500 mt-1">
              Controls diversity via nucleus sampling.
            </p>
          </div>

          {/* Max Tokens */}
          <div>
            <label
              htmlFor="max_tokens"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Max Tokens
            </label>
            <input
              type="number"
              id="max_tokens"
              min="1"
              max="4000"
              value={formData.max_tokens}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  max_tokens: parseInt(e.target.value) || 1000,
                })
              }
              className="input-field"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={createExperiment.isPending}
            className="btn-primary w-full py-3 text-lg"
            aria-label="Start experiment and generate responses"
          >
            {createExperiment.isPending ? (
              <>
                <Loader2 className="h-5 w-5 inline-block mr-2 animate-spin" />
                Generating Responses...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 inline-block mr-2" />
                Start Experiment
              </>
            )}
          </button>

          {createExperiment.isError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              Error: {createExperiment.error?.message || 'Failed to create experiment'}
            </div>
          )}
        </form>
      </div>

      {/* Info Section */}
      <div className="mt-8 grid md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-semibold text-lg mb-2">About Temperature</h3>
          <p className="text-sm text-gray-600">
            Temperature controls randomness. Lower values (0.0-0.5) produce more
            deterministic outputs, while higher values (1.0-2.0) increase
            creativity and variation.
          </p>
        </div>
        <div className="card">
          <h3 className="font-semibold text-lg mb-2">About Top P</h3>
          <p className="text-sm text-gray-600">
            Top P (nucleus sampling) limits the token selection to the smallest
            set whose cumulative probability exceeds the threshold. Lower values
            focus on more likely tokens.
          </p>
        </div>
      </div>
    </div>
  )
}

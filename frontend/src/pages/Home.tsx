/**
 * Home Page - Create new experiments
 */
import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import ParameterModal from '../components/ParameterModal'
import ParameterSelector from '../components/ParameterSelector'
import FormField from '../components/FormField'
import InfoBox from '../components/InfoBox'
import { useCreateExperiment } from '../hooks'
import type { ExperimentCreate } from '../types'
import { PARAMETER_CONSTRAINTS } from '../constants'

export default function Home() {
  const [formData, setFormData] = useState<ExperimentCreate>({
    name: '',
    prompt: '',
    temperature_range: [...PARAMETER_CONSTRAINTS.TEMPERATURE.DEFAULT_VALUES],
    top_p_range: [...PARAMETER_CONSTRAINTS.TOP_P.DEFAULT_VALUES],
    max_tokens: PARAMETER_CONSTRAINTS.MAX_TOKENS.DEFAULT,
  })

  const [showTempModal, setShowTempModal] = useState(false)
  const [showTopPModal, setShowTopPModal] = useState(false)

  const createExperiment = useCreateExperiment()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createExperiment.mutate(formData)
  }

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
          <FormField
            label="Experiment Name"
            htmlFor="name"
            required
          >
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
          </FormField>

          {/* Prompt */}
          <FormField label="Prompt" htmlFor="prompt" required>
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
          </FormField>

          {/* Temperature Range */}
          <ParameterSelector
            type="temperature"
            values={formData.temperature_range}
            onAdd={() => setShowTempModal(true)}
            onRemove={removeTempValue}
            label="Temperature Range"
            description="Temperature controls randomness. Higher values (0.7-2.0) make output more creative, lower values (0.0-0.7) make it more focused."
          />

          {/* Top P Range */}
          <ParameterSelector
            type="top_p"
            values={formData.top_p_range}
            onAdd={() => setShowTopPModal(true)}
            onRemove={removeTopPValue}
            label="Top P Range"
            description="Top P (nucleus sampling) limits token selection to the smallest set whose cumulative probability exceeds the threshold. Lower values focus on more likely tokens."
          />

          {/* Max Tokens */}
          <FormField
            label="Max Tokens"
            htmlFor="max_tokens"
            description={`Maximum number of tokens in the response (${PARAMETER_CONSTRAINTS.MAX_TOKENS.MIN}-${PARAMETER_CONSTRAINTS.MAX_TOKENS.MAX})`}
          >
            <input
              type="number"
              id="max_tokens"
              min={PARAMETER_CONSTRAINTS.MAX_TOKENS.MIN}
              max={PARAMETER_CONSTRAINTS.MAX_TOKENS.MAX}
              value={formData.max_tokens}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  max_tokens: parseInt(e.target.value) || PARAMETER_CONSTRAINTS.MAX_TOKENS.DEFAULT,
                })
              }
              className="input-field"
            />
          </FormField>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="btn-primary"
              disabled={createExperiment.isPending}
            >
              {createExperiment.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Experiment'
              )}
            </button>
          </div>

          {createExperiment.isError && (
            <InfoBox variant="red">
              <p>
                Error: {createExperiment.error?.message || 'Failed to create experiment'}
              </p>
            </InfoBox>
          )}
        </form>

        {/* Info Section */}
        <div className="mt-8">
          <InfoBox variant="blue" title="About Parameters">
            <p className="mb-2">
              <strong>Temperature:</strong> Controls the randomness of the output. Higher
              values produce more diverse and creative responses, while lower values produce
              more focused and deterministic responses.
            </p>
            <p>
              <strong>Top P:</strong> (nucleus sampling) limits the token selection to the
              smallest set whose cumulative probability exceeds the threshold. Lower values
              focus on more likely tokens.
            </p>
          </InfoBox>
        </div>
      </div>

      {/* Parameter Modals */}
      <ParameterModal
        isOpen={showTempModal}
        onClose={() => setShowTempModal(false)}
        onAdd={addTempValue}
        type="temperature"
        existingValues={formData.temperature_range}
      />
      <ParameterModal
        isOpen={showTopPModal}
        onClose={() => setShowTopPModal(false)}
        onAdd={addTopPValue}
        type="top_p"
        existingValues={formData.top_p_range}
      />
    </div>
  )
}
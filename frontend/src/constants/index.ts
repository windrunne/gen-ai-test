/**
 * Application constants
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  TIMEOUT: 30000, // 30 seconds
} as const

// Parameter Constraints
export const PARAMETER_CONSTRAINTS = {
  TEMPERATURE: {
    MIN: 0.0,
    MAX: 2.0,
    DEFAULT_VALUES: [0.5, 1.0, 1.5],
    STEP: 0.1,
  },
  TOP_P: {
    MIN: 0.0,
    MAX: 1.0,
    DEFAULT_VALUES: [0.8, 0.9, 1.0],
    STEP: 0.05,
  },
  MAX_TOKENS: {
    MIN: 1,
    MAX: 4000,
    DEFAULT: 1000,
  },
} as const

// UI Constants
export const UI_CONFIG = {
  MODAL_SIZES: {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-4xl',
  },
  PAGINATION: {
    DEFAULT_LIMIT: 100,
    MAX_LIMIT: 1000,
  },
} as const

// Metric Display
export const METRIC_DISPLAY = {
  PERCENTAGE_MULTIPLIER: 100,
  DECIMAL_PLACES: 1,
} as const

// Validation
export const VALIDATION = {
  MIN_RESPONSE_LENGTH: 10,
  CORRUPTION_THRESHOLD: 0.6,
} as const

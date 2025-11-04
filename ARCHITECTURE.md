# LLM Lab - Architecture Documentation

## System Overview

LLM Lab is a full-stack web application designed to help users understand how different LLM parameters affect response quality. The system follows a clean architecture pattern with clear separation between frontend, backend, and data layers.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  React + TypeScript + Tailwind CSS + TanStack Query         │
│  - Home Page (Create Experiments)                            │
│  - Experiments List                                          │
│  - Experiment Detail (Metrics, Responses, Comparison)        │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST API
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                      Backend API                             │
│  FastAPI + SQLAlchemy + LangChain                            │
│  - Experiments API                                            │
│  - Responses API                                             │
│  - Metrics API                                               │
│  - Export API                                                │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
┌───────▼────────┐          ┌─────────▼──────────┐
│   Database     │          │   OpenAI API       │
│   SQLite       │          │   (via LangChain)  │
│   - Experiments│          │                     │
│   - Responses  │          │                     │
│   - Metrics    │          │                     │
└────────────────┘          └─────────────────────┘
```

## Backend Architecture

### Directory Structure

```
backend/
├── main.py                    # FastAPI application entry point
├── app/
│   ├── api/
│   │   └── routes/            # API route handlers
│   │       ├── experiments.py
│   │       ├── responses.py
│   │       ├── metrics.py
│   │       └── export.py
│   ├── core/
│   │   └── config.py         # Configuration management
│   ├── db/
│   │   ├── database.py        # Database connection & session
│   │   └── models.py         # SQLAlchemy models
│   └── services/
│       ├── llm_service.py    # LLM integration (OpenAI/LangChain)
│       └── metrics_service.py # Quality metrics calculation
└── requirements.txt
```

### Key Components

#### 1. API Routes (`app/api/routes/`)

**experiments.py**
- `POST /api/experiments/` - Create experiment and generate responses
- `GET /api/experiments/` - List all experiments
- `GET /api/experiments/{id}` - Get experiment details
- `DELETE /api/experiments/{id}` - Delete experiment

**responses.py**
- `GET /api/responses/experiment/{id}` - Get all responses for experiment
- `GET /api/responses/{id}` - Get single response with metrics

**metrics.py**
- `GET /api/metrics/experiment/{id}/summary` - Get aggregated metrics summary

**export.py**
- `GET /api/export/experiment/{id}/csv` - Export experiment as CSV
- `GET /api/export/experiment/{id}/json` - Export experiment as JSON

#### 2. Database Layer (`app/db/`)

**Models:**
- `Experiment`: Stores experiment metadata (name, prompt, timestamps)
- `Response`: Stores LLM responses with parameters (temperature, top_p, text)
- `Metric`: Stores calculated quality metrics for each response

**Database:**
- SQLite for development (easily switchable to PostgreSQL)
- SQLAlchemy ORM for database operations
- Automatic table creation on startup

#### 3. Services (`app/services/`)

**LLMService:**
- Handles OpenAI API integration via LangChain
- Manages API key authentication
- Error handling for rate limits and API errors
- Async support for concurrent requests

**MetricsService:**
- Calculates 6 custom quality metrics:
  1. Length Score: Response length appropriateness
  2. Coherence Score: Sentence structure and transitions
  3. Completeness Score: Conclusion and answer quality
  4. Structure Score: Paragraphs, lists, headers
  5. Readability Score: Flesch-like metrics
  6. Overall Score: Weighted average

### Data Flow

1. **Experiment Creation:**
   ```
   User Input → POST /api/experiments/
   → Create Experiment record
   → Generate parameter combinations (temp × top_p)
   → For each combination:
     → Call LLMService.generate_response()
     → Create Response record
     → Calculate metrics via MetricsService
     → Store metrics in Metric records
   → Return experiment
   ```

2. **Response Retrieval:**
   ```
   GET /api/responses/experiment/{id}
   → Query Response records
   → Query associated Metric records
   → Combine and return
   ```

3. **Metrics Summary:**
   ```
   GET /api/metrics/experiment/{id}/summary
   → Query all responses and metrics
   → Aggregate by metric name
   → Calculate statistics (mean, median, min, max, std_dev)
   → Return summary
   ```

## Frontend Architecture

### Directory Structure

```
frontend/
├── src/
│   ├── api/                   # API client
│   │   ├── client.ts         # Axios configuration
│   │   └── experiments.ts    # API functions
│   ├── components/            # Reusable components
│   │   ├── Layout.tsx
│   │   ├── ResponseCard.tsx
│   │   ├── MetricsChart.tsx
│   │   └── ComparisonView.tsx
│   ├── pages/                 # Page components
│   │   ├── Home.tsx          # Create experiment
│   │   ├── ExperimentsList.tsx
│   │   └── ExperimentDetail.tsx
│   ├── App.tsx               # Root component with routing
│   └── main.tsx             # Entry point
└── package.json
```

### Key Components

#### 1. API Client (`src/api/`)

- Axios-based HTTP client with interceptors
- Error handling and type-safe API functions
- Automatic request/response transformation

#### 2. Pages

**Home.tsx:**
- Form for creating new experiments
- Parameter input (temperature, top_p ranges)
- Real-time validation

**ExperimentsList.tsx:**
- Lists all experiments with TanStack Query
- Navigate to experiment details

**ExperimentDetail.tsx:**
- Displays experiment information
- Shows metrics summary chart
- Lists all responses with metrics
- Comparison view for side-by-side analysis
- Export functionality

#### 3. Components

**ResponseCard:**
- Displays single response with parameters
- Shows all calculated metrics
- Highlights overall score

**MetricsChart:**
- Bar chart using Recharts
- Statistics table
- Visual comparison of metrics

**ComparisonView:**
- Side-by-side response comparison
- Navigation between response pairs
- Parameter and metric comparison

### State Management

- **TanStack Query**: Server state management
  - Automatic caching
  - Background refetching
  - Loading/error states
- **React State**: Local component state
  - Form inputs
  - UI interactions

## Quality Metrics Design

### Rationale

All metrics are programmatically calculated without LLM evaluation calls, making them:
- Fast and cost-effective
- Reproducible
- Transparent and explainable

### Metric Formulas

1. **Length Score (0-1):**
   - Optimal: 50-2000 chars = 1.0
   - <50: Linear scale from 0-1
   - >2000: Gradual penalty (1 - excess/5000)

2. **Coherence Score (0-1):**
   - Structure: proper sentences (70%)
   - Transitions: transition word count (30%)

3. **Completeness Score (0-1):**
   - Conclusion indicators (40%)
   - Answer quality (30%)
   - Length factor (30%)

4. **Structure Score (0-1):**
   - Paragraph breaks (50%)
   - List items (30%)
   - Headers (20%)

5. **Readability Score (0-1):**
   - Sentence length (optimal: 10-20 words) (40%)
   - Word length (optimal: 4-5 chars) (30%)
   - Vocabulary diversity (30%)

6. **Overall Score (0-1):**
   - Weighted average:
     - Coherence: 25%
     - Readability: 25%
     - Completeness: 20%
     - Length: 15%
     - Structure: 15%

## Technology Choices

### Backend
- **FastAPI**: Modern async Python framework
  - Automatic API documentation
  - Type validation with Pydantic
  - High performance
- **LangChain**: LLM abstraction
  - Easy to switch providers
  - Consistent interface
- **SQLAlchemy**: ORM
  - Database abstraction
  - Easy migrations

### Frontend
- **React 18**: UI framework
  - Component-based architecture
  - Hooks for state management
- **TypeScript**: Type safety
  - Catch errors at compile time
  - Better IDE support
- **Tailwind CSS**: Utility-first CSS
  - Rapid development
  - Consistent design system
- **TanStack Query**: Server state
  - Efficient caching
  - Background updates

## Security Considerations

1. **API Key Management:**
   - Stored in environment variables
   - Never exposed to frontend
   - Validated on backend

2. **CORS:**
   - Configured for specific origins
   - Prevents unauthorized access

3. **Input Validation:**
   - Pydantic models for request validation
   - Type checking on frontend
   - SQL injection prevention via ORM

## Deployment Strategy

### Backend
- **Platform**: Railway, Render, or similar
- **Database**: SQLite (dev) or PostgreSQL (prod)
- **Process**: Uvicorn ASGI server
- **Environment Variables**: API keys, database URL, CORS origins

### Frontend
- **Platform**: Vercel (optimized for Vite)
- **Build**: Vite production build
- **Environment Variables**: API base URL
- **Proxy**: API requests proxied or direct CORS

## Performance Optimizations

1. **Database:**
   - Indexed foreign keys
   - Efficient queries with joins
   - Connection pooling

2. **API:**
   - Async request handling
   - Batch processing for multiple responses
   - Error handling to prevent crashes

3. **Frontend:**
   - Code splitting with React Router
   - TanStack Query caching
   - Optimistic updates where appropriate

## Error Handling

1. **API Errors:**
   - Global exception handler
   - Specific error messages
   - HTTP status codes

2. **LLM Errors:**
   - Rate limit handling
   - Authentication errors
   - Network failures

3. **Frontend Errors:**
   - Error boundaries
   - User-friendly error messages
   - Retry mechanisms

## Future Enhancements

1. **Scalability:**
   - Background job queue for long-running experiments
   - WebSocket for real-time progress
   - Database connection pooling

2. **Features:**
   - User authentication
   - Experiment sharing
   - Advanced filtering
   - More LLM providers

3. **Metrics:**
   - Semantic similarity
   - Fact-checking
   - Sentiment analysis

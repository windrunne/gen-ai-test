# LLM Lab - Comprehensive Documentation

## Table of Contents
1. [Architectural Approach and Key Decisions](#architectural-approach-and-key-decisions)
2. [UI/UX Design Rationale](#uiux-design-rationale)
3. [Quality Metrics Explanation](#quality-metrics-explanation)
4. [Deployment Choices](#deployment-choices)
5. [Assumptions Made](#assumptions-made)

---

## Architectural Approach and Key Decisions

### System Architecture Overview

The LLM Lab follows a **clean, layered architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Pages      │  │  Components  │  │   API Client │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP/REST
┌───────────────────────▼─────────────────────────────────┐
│              Backend (FastAPI)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Routes     │  │   Services   │  │ Repositories │   │
│  └──────┬───────┘  └──────┬───────┘  └───────┬──────┘   │
│         │                 │                  │          │
│         └─────────────────┼──────────────────┘          │
│                           │                             │
│                   ┌───────▼────────┐                    │
│                   │   Database     │                    │
│                   │  (PostgreSQL/  │                    │
│                   │    SQLite)     │                    │
│                   └────────────────┘                    │
└─────────────────────────────────────────────────────────┘
                        │
                        │ API Calls
                        ▼
                ┌──────────────┐
                │ OpenAI API   │
                └──────────────┘
```

### Backend Architecture

#### 1. **Layered Architecture**

**Routes Layer** (`app/api/routes/`)
- Handle HTTP requests/responses
- Input validation via Pydantic schemas
- Error handling and status codes
- **No business logic** - delegates to services

**Services Layer** (`app/services/`)
- Core business logic
- Orchestrates multiple repositories
- Handles async operations (LLM calls, batch processing)
- Key services:
  - `ExperimentService`: Manages experiment lifecycle
  - `LLMService`: OpenAI API integration
  - `MetricCalculator`: Quality metric calculations
  - `ResponseValidator`: Response validation
  - `MetricsAggregationService`: Aggregates metrics for analysis

**Repository Layer** (`app/repositories/`)
- Database access abstraction
- CRUD operations
- Query optimization
- **No business logic** - pure data access

**Database Layer** (`app/db/`)
- SQLAlchemy ORM models
- Database connection management
- Migration support (Alembic)

#### 2. **Data Flow**

##### Experiment Creation Flow:
```
User Input (Frontend)
    ↓
POST /api/experiments/
    ↓
ExperimentService.create_experiment()
    ├─→ Create Experiment record (DB)
    ├─→ Generate parameter combinations (Cartesian product)
    └─→ _generate_responses_batch()
        ├─→ Create async tasks for each parameter combination
        ├─→ Process in batches (DEFAULT_BATCH_SIZE = 5)
        └─→ For each response:
            ├─→ LLMService.generate_response()
            ├─→ ResponseValidator.validate_response()
            ├─→ MetricCalculator.calculate_all_metrics()
            └─→ Save to DB (Response + Metrics)
```

##### Data Retrieval Flow:
```
GET /api/responses/experiment/{id}
    ↓
ResponseService.get_experiment_responses_with_metrics()
    ├─→ ResponseRepository.get_by_experiment_id()
    └─→ MetricRepository.get_by_response_id() (for each)
        ↓
Frontend receives structured data with metrics
```

#### 3. **API Endpoints Structure**

**Experiments Endpoints** (`/api/experiments/`)
- `POST /` - Create new experiment (triggers response generation)
- `GET /` - List all experiments (paginated)
- `GET /{id}` - Get experiment details
- `DELETE /{id}` - Delete experiment (cascade deletes responses)

**Responses Endpoints** (`/api/responses/`)
- `GET /experiment/{id}` - Get all responses for an experiment
- `GET /{id}` - Get single response with metrics

**Metrics Endpoints** (`/api/metrics/`)
- `GET /experiment/{id}/summary` - Get aggregated metrics summary

**Export Endpoints** (`/api/export/`)
- `GET /experiment/{id}/csv` - Export as CSV
- `GET /experiment/{id}/json` - Export as JSON

#### 4. **Component Structure (Frontend)**

**Page Components** (`src/pages/`)
- `Home.tsx` - Experiment creation form
- `ExperimentsList.tsx` - List all experiments
- `ExperimentDetail.tsx` - View experiment with responses and metrics

**Feature Components** (`src/components/`)
- `experiments/` - Experiment-specific components
  - `ExperimentCard.tsx` - Experiment card display
  - `ExperimentHeader.tsx` - Experiment header with actions
  - `ParameterSelector.tsx` - Temperature/top_p value selector
  - `ParameterModal.tsx` - Modal for adding parameter values
- `responses/` - Response display components
  - `ResponseTableRow.tsx` - Table row for response
  - `ResponseModal.tsx` - Full response view modal
  - `ComparisonView.tsx` - Side-by-side response comparison
- `metrics/` - Metrics visualization
  - `MetricsChart.tsx` - Line/bar charts
  - `MetricsStatisticsTable.tsx` - Statistics table
  - `MetricsHelpSection.tsx` - Metric explanations

**Common Components** (`src/components/common/`)
- `FormField.tsx` - Reusable form field wrapper
- `Modal.tsx` - Reusable modal component
- `LoadingSpinner.tsx` - Loading indicator
- `InfoBox.tsx` - Information display box
- `ValidationWarning.tsx` - Validation warnings

**State Management**
- **TanStack Query** for server state (caching, refetching)
- **React Hooks** for local component state
- Custom hooks (`useExperiment.ts`, `useExperimentData.ts`) for data fetching

#### 5. **Key Architectural Decisions**

**1. Async Batch Processing**
- **Decision**: Process LLM responses in batches (default: 5 concurrent)
- **Rationale**: 
  - Respects OpenAI rate limits
  - Balances speed vs. API constraints
  - Prevents overwhelming the API
- **Implementation**: `asyncio.gather()` with batch slicing

**2. Separate Database Sessions per Response**
- **Decision**: Each async response generation uses its own DB session
- **Rationale**: 
  - Thread-safety for concurrent operations
  - Prevents connection pool exhaustion
  - Isolates failures (one failed response doesn't affect others)

**3. Repository Pattern**
- **Decision**: Abstract database access through repositories
- **Rationale**:
  - Easy to swap database backends
  - Testable (can mock repositories)
  - Clear separation of data access logic

**4. Pydantic Schemas**
- **Decision**: Use Pydantic for request/response validation
- **Rationale**:
  - Automatic OpenAPI documentation
  - Type safety
  - Automatic validation

**5. Service Layer Pattern**
- **Decision**: Business logic in services, not routes
- **Rationale**:
  - Reusable logic
  - Easier testing
  - Clear separation of HTTP concerns vs. business logic

---

## UI/UX Design Rationale

### Color Palette

The application uses a **professional, modern color scheme** inspired by scientific/research tools:

#### Primary Color (Sky Blue)
- **Purpose**: Primary actions, highlights, brand identity
- **Scale**: `primary-50` (lightest) to `primary-900` (darkest)
- **Usage**:
  - Primary buttons: `primary-600` (#0284c7)
  - Hover states: `primary-700` (#0369a1)
  - Active navigation: `primary-100` background with `primary-700` text
  - Icons and accents: `primary-600`

#### Neutral Colors (Gray Scale)
- **Background**: `gray-50` (#f9fafb) - Light, non-intrusive
- **Cards/Containers**: `white` with `gray-200` borders
- **Text**: 
  - Primary: `gray-900` (#111827)
  - Secondary: `gray-600` (#4b5563)
  - Muted: `gray-500` (#6b7280)

#### Semantic Colors
- **Success/Positive**: Green (implicit in success states)
- **Warning**: Yellow/Orange (for validation warnings)
- **Error**: Red (for error messages)
- **Info**: Blue (for information boxes)

### Design System

#### Typography
- **Headings**: Bold, clear hierarchy
  - `text-4xl` for main page titles
  - `text-2xl` for section headers
  - `text-lg` for subheadings
- **Body**: `text-base` (16px default)
- **Small text**: `text-sm` for descriptions, metadata

#### Spacing
- **Consistent spacing scale**: Uses Tailwind's spacing scale
- **Card padding**: `p-6` (24px)
- **Section spacing**: `mb-8` (32px) between major sections
- **Form spacing**: `space-y-6` (24px) between form fields

#### Components

**Cards**
- White background (`bg-white`)
- Rounded corners (`rounded-lg`)
- Subtle shadow (`shadow-md`)
- Border (`border border-gray-200`)
- Consistent padding (`p-6`)

**Buttons**
- **Primary**: `btn-primary` class
  - Blue background, white text
  - Smooth hover transitions
  - Disabled states with opacity
- **Secondary**: `btn-secondary` class
  - Gray background, darker text
  - Subtle hover effect

**Input Fields**
- `input-field` class
- Border with focus ring (`focus:ring-2 focus:ring-primary-500`)
- Smooth transitions
- Consistent sizing

### User Journey

#### 1. **Landing/Home Page**
- **Purpose**: Create new experiments
- **Flow**:
  1. User sees hero section with app title and description
  2. Form to enter experiment details:
     - Experiment name
     - Prompt text
     - Parameter ranges (temperature, top_p)
     - Max tokens
  3. Parameter selection via interactive badges
  4. Submit → Creates experiment and generates responses
  5. Redirects to experiment detail page

#### 2. **Experiments List Page**
- **Purpose**: Browse all experiments
- **Flow**:
  1. Grid/list of experiment cards
  2. Each card shows:
     - Experiment name
     - Prompt preview
     - Creation date
     - Response count
  3. Click card → Navigate to experiment detail
  4. Actions: Delete experiment

#### 3. **Experiment Detail Page**
- **Purpose**: Analyze experiment results
- **Flow**:
  1. Header with experiment info and actions (export, delete)
  2. Metrics summary section:
     - Statistics table (avg, min, max for each metric)
     - Bar charts showing metric distributions
  3. Responses table:
     - Sortable columns
     - Shows parameters, metrics, response preview
     - Click row → View full response
    4. Comparison view:
     - Side-by-side response comparison
     - Highlight differences
  5. Export options (CSV/JSON)

#### 4. **Interaction Patterns**

**Loading States**
- Spinner during API calls
- Disabled buttons during processing
- Progressive loading for large datasets

**Feedback**
- Success: Navigation or success message
- Error: Error boxes with clear messages
- Validation: Inline warnings/errors

**Modals**
- Parameter selection modals
- Response detail modals
- Confirmation dialogs

### Responsive Design

- **Mobile-first approach**: Base styles for mobile
- **Breakpoints**: Tailwind's default breakpoints
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px
- **Adaptive layouts**:
  - Cards stack on mobile
  - Tables scroll horizontally on small screens
  - Navigation adapts to screen size

### Animations

- **Fade-in**: `animate-fade-in` for page load
- **Slide-up**: `animate-slide-up` for cards
- **Smooth transitions**: All interactive elements have `transition-colors duration-200`
- **Purpose**: Subtle, professional animations that enhance UX without being distracting

---

## Quality Metrics Explanation

### Overview

The LLM Lab calculates **six quality metrics** for each LLM response:
1. Length Score
2. Coherence Score
3. Completeness Score
4. Structure Score
5. Readability Score
6. Overall Score (weighted combination)

All metrics are normalized to **0.0 - 1.0** range, where 1.0 is optimal.

### 1. Length Score

**Formula:**
```python
length = len(text)

if length < 50:
    score = max(0.0, length / 50.0)  # Linear scale from 0-50
elif length <= 2000:
    score = 1.0  # Optimal range
else:
    excess = length - 2000
    score = max(0.0, 1.0 - (excess / 5000.0))  # Gradual penalty
```

**Rationale:**
- **Optimal range**: 50-2000 characters
- Too short (< 50): May indicate incomplete responses
- Too long (> 2000): May be verbose or unfocused
- Gradual penalties for extremes

**Example:**
- 30 chars → 0.6 (60% of minimum)
- 500 chars → 1.0 (optimal)
- 3000 chars → 0.8 (20% penalty for 1000 excess chars)

**Limitations:**
- Doesn't consider content quality
- Optimal range is arbitrary (may vary by use case)
- Doesn't account for prompt complexity

### 2. Coherence Score

**Formula:**
```python
# Split sentences
sentences = re.split(r'[.!?]+', text)

# Transition word score (40% weight)
transition_words = ['however', 'therefore', 'furthermore', ...]
transition_count = count(transition_words in text)
transition_score = min(1.0, transition_count / sentence_count)

# Sentence length variation (60% weight)
sentence_lengths = [len(s.split()) for s in sentences]
variance = calculate_variance(sentence_lengths)
variation_score = min(1.0, variance / 100.0)

coherence = (transition_score * 0.4 + variation_score * 0.6)
```

**Rationale:**
- **Transition words**: Indicate logical flow between ideas
- **Sentence variation**: Uniform sentences may indicate lack of coherence
- Higher variance in sentence length suggests natural writing

**Example:**
- High transition words + varied sentence lengths → 0.9
- Few transitions + uniform sentences → 0.4

**Limitations:**
- Simple keyword matching (doesn't understand context)
- May penalize technical writing (often uses fewer transitions)
- Doesn't check semantic coherence

### 3. Completeness Score

**Formula:**
```python
# Check for conclusion indicators
conclusion_words = ['conclusion', 'summary', 'in summary', ...]
has_conclusion = any(word in text_lower)

# Check for questions (may indicate incomplete)
question_words = ['?', 'what', 'how', 'why', ...]
question_count = count(question_words)
has_questions = question_count > 3

# Length factor
length_factor = min(1.0, len(text) / 500.0)

# Calculate
if has_questions and not has_conclusion:
    completeness = 0.6 * length_factor
elif has_conclusion:
    completeness = 0.8 + (0.2 * length_factor)
else:
    completeness = 0.7 * length_factor
```

**Rationale:**
- **Conclusion indicators**: Suggest a complete answer
- **Question count**: Many questions may indicate the response is incomplete
- **Length factor**: Longer responses more likely to be complete

**Example:**
- Has conclusion + 600 chars → 0.92
- No conclusion, many questions → 0.4

**Limitations:**
- Keyword-based (doesn't understand meaning)
- May penalize exploratory prompts (which naturally have questions)
- Doesn't verify if questions are answered

### 4. Structure Score

**Formula:**
```python
# Paragraph count (40% weight)
paragraphs = text.split('\n\n')
paragraph_count = count(valid_paragraphs)
if 2 <= paragraph_count <= 5:
    structure_score = 0.4
elif paragraph_count > 5:
    structure_score = 0.3
else:
    structure_score = 0.1

# List items (30% weight)
list_items = count(bullet_points + numbered_lists)
if list_items > 0:
    structure_score += 0.3
elif paragraph_count > 1:
    structure_score += 0.2

# Headers (30% weight)
header_count = count(short_lines_that_look_like_headers)
if header_count > 0:
    structure_score += 0.3
else:
    structure_score += 0.1
```

**Rationale:**
- **Paragraphs**: Good organization uses multiple paragraphs
- **Lists**: Bullet/numbered lists improve readability
- **Headers**: Section headers improve structure

**Example:**
- 3 paragraphs + 5 list items + 2 headers → 1.0
- 1 paragraph, no lists → 0.2

**Limitations:**
- Simple pattern matching (doesn't understand actual structure)
- May penalize single-paragraph responses that are well-structured
- Header detection is heuristic-based

### 5. Readability Score

**Formula:**
```python
# Calculate averages
avg_sentence_length = word_count / sentence_count
avg_word_length = sum(len(word) for word in words) / word_count

# Optimal: 10-20 words/sentence, 4-5 chars/word
sentence_score = 1.0 - abs(avg_sentence_length - 15) / 30.0
word_score = 1.0 - abs(avg_word_length - 4.5) / 3.0

readability = (sentence_score * 0.6 + word_score * 0.4)
```

**Rationale:**
- **Sentence length**: Shorter sentences are easier to read
- **Word length**: Shorter words are more accessible
- Based on simplified Flesch-like metrics

**Example:**
- 15 words/sentence, 4.5 chars/word → 1.0
- 30 words/sentence, 6 chars/word → 0.5

**Limitations:**
- Simplified version of Flesch-Kincaid
- Doesn't account for vocabulary difficulty
- May penalize technical writing (longer words/sentences)

### 6. Overall Score

**Formula:**
```python
overall = (
    length_score * 0.15 +
    coherence_score * 0.25 +
    completeness_score * 0.20 +
    structure_score * 0.15 +
    readability_score * 0.25
)
```

**Weights:**
- **Coherence**: 25% (most important - text must flow)
- **Readability**: 25% (important for accessibility)
- **Completeness**: 20% (answers should be complete)
- **Length**: 15% (less critical)
- **Structure**: 15% (nice to have)

**Rationale:**
- Coherence and readability are weighted highest (core quality)
- Structure and length are lower (supporting factors)

### Metric Calculation Flow

```
LLM Response Text
    ↓
ResponseValidator.validate_response()
    ↓ (cleaned text)
MetricCalculator.calculate_all_metrics()
    ├─→ calculate_length_score()
    ├─→ calculate_coherence_score()
    ├─→ calculate_completeness_score()
    ├─→ calculate_structure_score()
    ├─→ calculate_readability_score()
    └─→ calculate_overall_score()
        (uses individual metrics, not recursive call)
```

### Limitations and Considerations

**General Limitations:**
1. **Heuristic-based**: All metrics use simple heuristics, not semantic understanding
2. **Context-agnostic**: Don't consider prompt type or domain
3. **Language-specific**: Designed for English (punctuation, word patterns)
4. **No semantic evaluation**: Don't check if content is correct or relevant

**Use Case Considerations:**
- **Technical writing**: May score lower on readability (longer words/sentences OK)
- **Creative writing**: May score lower on structure (poetry, prose)
- **Short answers**: May score lower on length/structure (but may be appropriate)

**Future Improvements:**
- Semantic similarity scoring (vs. reference)
- Domain-specific metrics
- Multi-language support
- Machine learning-based metrics

---

## Deployment Choices

### Backend Deployment

#### Platform: Railway / Render / Heroku-Compatible

**Decision**: Use `Procfile` for deployment (Railway/Render compatible)

**Configuration:**
```bash
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

**Rationale:**
- `Procfile` is standard for many platforms
- `$PORT` environment variable for platform flexibility
- `0.0.0.0` to accept connections from any interface

#### Database Options

**1. SQLite (Development)**
- **Default**: `sqlite:///./llm_lab.db`
- **Advantages**: 
  - No setup required
  - Good for development/testing
  - File-based (easy backup)
- **Limitations**:
  - Not suitable for production (concurrency issues)
  - Single-user

**2. PostgreSQL (Production)**
- **Configuration**: Via `DATABASE_URL` environment variable
- **Support**: SQLAlchemy with `psycopg2-binary`
- **Platforms**: Supabase, Railway, Render, Heroku
- **Advantages**:
  - Production-ready
  - Concurrent access
  - Better performance
  - Connection pooling

**Connection Pooling:**
```python
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,      # Verify connections
    pool_size=5,             # Base connections
    max_overflow=10,         # Additional connections
    echo=False
)
```

#### Environment Configuration

**Required Variables:**
```env
OPENAI_API_KEY=sk-...                    # OpenAI API key
OPENAI_MODEL=gpt-3.5-turbo              # Model name (default)
DATABASE_URL=postgresql://...           # PostgreSQL connection string
CORS_ORIGINS=["https://your-frontend"]  # Allowed origins
```

**Optional Variables:**
```env
MAX_CONCURRENT_REQUESTS=10              # Max concurrent LLM calls
REQUEST_TIMEOUT=60                      # Request timeout (seconds)
```

#### Startup Script

**`start.sh`** (for manual deployment):
```bash
#!/bin/bash
# Activate virtual environment if exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Run server
uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --reload
```

### Frontend Deployment

#### Platform: Vercel

**Decision**: Use Vercel for frontend hosting

**Configuration** (`vercel.json`):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ]
}
```

**Rationale:**
- **Excellent React/Vite support**: Automatic detection
- **Fast CDN**: Global edge network
- **Easy deployment**: Git integration
- **Free tier**: Good for projects
- **Environment variables**: Easy configuration

#### Build Configuration

**Vite Build** (`vite.config.ts`):
- Output: `dist/` directory
- TypeScript compilation
- Asset optimization
- Code splitting

**Environment Variables:**
```env
VITE_API_BASE_URL=https://your-backend-url.com
```

**Build Process:**
```bash
npm run build  # TypeScript compile + Vite build
```

#### CORS Configuration

**Backend CORS** (allows frontend):
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",  # All Vercel deployments
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Rationale:**
- Specific origins + Vercel regex for preview deployments
- Credentials allowed (for future auth)
- All methods/headers (REST API)

### Deployment Architecture

```
┌─────────────────────────────────────────────────┐
│            Vercel (Frontend)                    │
│  https://your-app.vercel.app                    │
│                                                 │
│  - React SPA                                    │
│  - CDN distribution                             │
│  - Environment: VITE_API_BASE_URL               │
└────────────────┬────────────────────────────────┘
                 │
                 │ HTTPS API Calls
                 │
┌────────────────▼────────────────────────────────┐
│      Railway/Render (Backend)                   │
│  https://your-api.railway.app                   │
│                                                 │
│  - FastAPI application                          │
│  - PostgreSQL database                          │
│  - Environment: OPENAI_API_KEY, DATABASE_URL   │
└────────────────┬────────────────────────────────┘
                 │
                 │ API Calls
                 │
┌────────────────▼────────────────────────────────┐
│            OpenAI API                            │
│  https://api.openai.com                         │
└─────────────────────────────────────────────────┘
```

### Deployment Steps

#### Backend Deployment (Railway/Render)

1. **Connect Repository**
   - Link GitHub/GitLab repository
   - Select backend directory

2. **Set Environment Variables**
   ```
   OPENAI_API_KEY=sk-...
   OPENAI_MODEL=gpt-3.5-turbo
   DATABASE_URL=postgresql://...  # If using PostgreSQL
   CORS_ORIGINS=["https://your-frontend.vercel.app"]
   ```

3. **Configure Build**
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

4. **Deploy**
   - Platform automatically detects `Procfile`
   - Builds and deploys application

#### Frontend Deployment (Vercel)

1. **Import Project**
   - Connect GitHub repository
   - Select frontend directory

2. **Configure Build**
   - Framework: Vite (auto-detected)
   - Build command: `npm run build`
   - Output directory: `dist`

3. **Set Environment Variables**
   ```
   VITE_API_BASE_URL=https://your-backend-url.com
   ```

4. **Deploy**
   - Vercel builds and deploys
   - Provides preview URLs for PRs

### Migration from SQLite to PostgreSQL

**For Production:**
1. Update `DATABASE_URL` to PostgreSQL connection string
2. Run migrations (Alembic) or create tables:
   ```python
   from app.db.database import init_db
   init_db()  # Creates tables
   ```
3. Migrate data (if needed) using SQL dump/import

**Note**: SQLAlchemy models support both databases (SQLite for dev, PostgreSQL for prod)

---

## Assumptions Made

### LLM API Assumptions

#### 1. **OpenAI API as Primary Provider**

**Assumption**: Application uses OpenAI API (GPT-3.5-turbo or GPT-4)

**Rationale:**
- Most widely used LLM API
- Good documentation and SDK support
- Reliable service

**Implementation:**
- Primary: OpenAI SDK (`openai>=1.54.0`)
- Fallback: LangChain (`langchain-openai>=0.2.0`)
- Service: `LLMService` abstracts API calls

**Code Evidence:**
```python
# app/services/llm_service.py
if USE_OPENAI_SDK:
    client = AsyncOpenAI(api_key=self.api_key)
    response = await client.chat.completions.create(...)
else:
    # Fallback to LangChain
    llm = ChatOpenAI(...)
```

**Limitations:**
- Currently only supports OpenAI
- No support for other providers (Anthropic, Cohere, etc.)
- Model is configurable but defaults to `gpt-3.5-turbo`

#### 2. **API Key Requirement**

**Assumption**: User provides their own OpenAI API key

**Rationale:**
- Avoids proxy costs
- User controls their usage/billing
- More secure (key not stored in app)

**Configuration:**
- Required environment variable: `OPENAI_API_KEY`
- Validated at startup (service initialization)

#### 3. **Rate Limits**

**Assumption**: OpenAI rate limits apply (varies by tier)

**Handling:**
- Batch processing (default: 5 concurrent requests)
- Error handling for rate limit errors
- Configurable batch size via `DEFAULT_BATCH_SIZE`

**Code Evidence:**
```python
# app/services/experiment_service.py
for i in range(0, len(tasks), DEFAULT_BATCH_SIZE):
    batch = tasks[i:i + DEFAULT_BATCH_SIZE]
    results = await asyncio.gather(*batch, return_exceptions=True)
```

### Data Assumptions

#### 1. **No Mock Data**

**Assumption**: All responses come from real LLM API calls

**Rationale:**
- Demonstrates real-world usage
- Tests actual API integration
- Provides genuine quality metrics

**Implications:**
- Requires valid API key
- Costs associated with API calls
- Slower testing (real API latency)

#### 2. **English Language Only**

**Assumption**: Application is designed for English text

**Evidence:**
- Metric calculations use English patterns:
  - Sentence splitting: `[.!?]+`
  - Transition words: English words
  - Punctuation: English conventions
  - Readability: English word/sentence patterns

**Limitations:**
- Metrics may not work well for other languages
- No internationalization (i18n)

#### 3. **Text-Only Responses**

**Assumption**: LLM responses are plain text (no markdown formatting considered in metrics)

**Rationale:**
- Simpler metric calculations
- Focus on content quality, not formatting

**Note**: Markdown is displayed correctly in UI, but metrics treat it as plain text

### Architecture Assumptions

#### 1. **Single-User Application**

**Assumption**: No authentication or user management

**Rationale:**
- Simpler architecture
- Focus on core functionality
- Can be extended later

**Implications:**
- All experiments are shared (if deployed)
- No user isolation
- No experiment ownership

#### 2. **Synchronous Experiment Creation**

**Assumption**: Experiment creation waits for all responses to generate

**Rationale:**
- Simpler UX (user sees complete experiment)
- No need for progress tracking
- Clear success/failure states

**Limitations:**
- Long wait times for large parameter grids
- No cancellation during generation
- No progress updates

**Future Improvement**: WebSocket for real-time progress

#### 3. **Database Persistence**

**Assumption**: All experiments are persisted to database

**Rationale:**
- Allows revisiting experiments
- Export functionality requires persistence
- Historical analysis

**Storage:**
- Experiment metadata
- Full response text
- All calculated metrics

### UI/UX Assumptions

#### 1. **Modern Browser Support**

**Assumption**: Users have modern browsers (Chrome, Firefox, Safari, Edge)

**Rationale:**
- React 18 requires modern browsers
- Uses modern CSS features (Tailwind)
- No IE11 support

#### 2. **Desktop-First (with Mobile Support)**

**Assumption**: Primary use case is desktop/laptop

**Rationale:**
- Data analysis tools are typically desktop
- Tables and charts need screen space
- Mobile is supported but not optimized

#### 3. **JavaScript Enabled**

**Assumption**: JavaScript is enabled (required for React SPA)

**Rationale:**
- Single Page Application (SPA)
- No server-side rendering
- API-driven frontend

### Metric Calculation Assumptions

#### 1. **Heuristic-Based Metrics**

**Assumption**: Simple heuristics are sufficient for quality assessment

**Rationale:**
- Fast calculation
- No external dependencies
- Interpretable results

**Trade-off**: Less accurate than semantic/ML-based metrics

#### 2. **Universal Optimal Ranges**

**Assumption**: Optimal ranges (e.g., 50-2000 chars) apply to all use cases

**Rationale:**
- Simpler implementation
- Reasonable defaults

**Limitations**: May not fit all use cases (e.g., short answers, long-form content)

#### 3. **Equal Importance of Metrics**

**Assumption**: Overall score weights are universal

**Rationale:**
- Based on general writing quality principles
- No domain-specific tuning

**Future**: Allow users to customize weights

### Deployment Assumptions

#### 1. **Environment Variables**

**Assumption**: Deployment platforms support environment variables

**Rationale:**
- Standard practice
- Secure configuration
- Platform-agnostic

#### 2. **HTTPS Required**

**Assumption**: Production uses HTTPS

**Rationale:**
- Security best practice
- Required for many features (CORS, secure cookies)
- Standard for modern web apps

#### 3. **No Database Migrations**

**Assumption**: Database schema is created via `init_db()` (not migrations)

**Rationale:**
- Simpler for initial deployment
- Alembic is available but not actively used

**Note**: Alembic is included in dependencies for future migration support

---

## Summary

This documentation covers:

1. **Architecture**: Clean layered architecture with clear separation of concerns, async batch processing, and repository pattern
2. **UI/UX**: Professional design system with sky blue primary color, responsive layout, and intuitive user journey
3. **Metrics**: Six heuristic-based quality metrics with formulas, examples, and limitations
4. **Deployment**: Railway/Render for backend, Vercel for frontend, with PostgreSQL support
5. **Assumptions**: OpenAI API, English-only, single-user, text-only responses, heuristic metrics

The application is designed to be **extensible** and **maintainable**, with clear patterns that allow for future enhancements (multi-provider LLM support, authentication, semantic metrics, etc.).


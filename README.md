# LLM Lab - Experimental Console

A full-stack web application for analyzing how different LLM parameters (temperature, top_p) affect response quality. This tool helps users understand the invisible effects of parameter tuning by generating multiple responses and analyzing them with custom quality metrics.

## 🚀 Features

- **Parameter Experimentation**: Test multiple combinations of temperature and top_p values
- **Custom Quality Metrics**: Programmatically calculated metrics including:
  - Length Score: Appropriateness of response length
  - Coherence Score: Sentence structure and transition word usage
  - Completeness Score: Presence of conclusion indicators and answer quality
  - Structure Score: Paragraph breaks, lists, and section headers
  - Readability Score: Simplified Flesch-like metrics
  - Overall Score: Weighted combination of all metrics
- **Visual Analytics**: Charts and comparison views for analyzing results
- **Data Persistence**: SQLite database for storing experiments
- **Export Functionality**: Export experiments as CSV or JSON
- **Modern UI/UX**: Responsive design with Tailwind CSS, smooth animations, and intuitive navigation

## 🏗️ Architecture

### Backend (FastAPI)
- **Framework**: FastAPI with Python 3.10+
- **Database**: SQLite (easily switchable to PostgreSQL)
- **LLM Integration**: OpenAI API via LangChain
- **Architecture**: Clean separation of concerns with routes, services, and models

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query for server state
- **Routing**: React Router
- **Charts**: Recharts for data visualization

## 📋 Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher
- OpenAI API key

## 🛠️ Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the backend directory:
```env
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
DATABASE_URL=sqlite:///./llm_lab.db
CORS_ORIGINS=["http://localhost:3000","http://localhost:5173"]
```

5. Run the backend server:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional, defaults to localhost:8000):
```env
VITE_API_BASE_URL=http://localhost:8000
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 📖 Usage

1. **Create an Experiment**: Enter a prompt and specify temperature/top_p ranges
2. **Generate Responses**: The system generates responses for all parameter combinations
3. **View Metrics**: Explore quality metrics for each response
4. **Compare Responses**: Use the comparison view to analyze differences
5. **Export Data**: Download experiments as CSV or JSON for further analysis

## 🔬 Quality Metrics Explained

### Length Score
Evaluates response length appropriateness:
- Optimal: 50-2000 characters
- Penalties for too short (<50) or too long (>2000) responses

### Coherence Score
Measures text coherence through:
- Sentence structure quality
- Transition word usage
- Proper punctuation and capitalization

### Completeness Score
Assesses response completeness:
- Presence of conclusion indicators
- Answer quality for questions
- Length-based completeness factor

### Structure Score
Evaluates text organization:
- Paragraph breaks
- List formatting
- Section headers

### Readability Score
Simplified readability metrics:
- Average sentence length (optimal: 10-20 words)
- Average word length (optimal: 4-5 characters)
- Vocabulary diversity

### Overall Score
Weighted average of all metrics:
- Coherence: 25%
- Readability: 25%
- Completeness: 20%
- Length: 15%
- Structure: 15%

## 📁 Project Structure

```
gen-ai/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/      # API endpoints
│   │   ├── core/
│   │   │   └── config.py    # Configuration
│   │   ├── db/
│   │   │   ├── database.py  # DB connection
│   │   │   └── models.py    # SQLAlchemy models
│   │   └── services/
│   │       ├── llm_service.py      # LLM integration
│   │       └── metrics_service.py  # Quality metrics
│   ├── main.py              # FastAPI app
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── api/             # API client
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   └── main.tsx         # Entry point
│   └── package.json
├── time_estimates.csv       # Time tracking
└── README.md
```

## 🚀 Deployment

### Backend Deployment (Railway/Render)

1. Set environment variables:
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL` (optional)
   - `DATABASE_URL` (for PostgreSQL)
   - `CORS_ORIGINS`

2. Build and deploy:
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Frontend Deployment (Vercel)

1. Connect your repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variable: `VITE_API_BASE_URL` (your backend URL)

## 🧪 Testing

The application includes error handling for:
- API rate limits
- Invalid inputs
- Network failures
- Database errors

## 📝 API Endpoints

### Experiments
- `POST /api/experiments/` - Create new experiment
- `GET /api/experiments/` - List all experiments
- `GET /api/experiments/{id}` - Get experiment details
- `DELETE /api/experiments/{id}` - Delete experiment

### Responses
- `GET /api/responses/experiment/{id}` - Get all responses for experiment
- `GET /api/responses/{id}` - Get single response

### Metrics
- `GET /api/metrics/experiment/{id}/summary` - Get metrics summary

### Export
- `GET /api/export/experiment/{id}/csv` - Export as CSV
- `GET /api/export/experiment/{id}/json` - Export as JSON

## 🎨 Design Decisions

- **FastAPI**: Chosen for async support, automatic API docs, and type safety
- **LangChain**: Provides abstraction over OpenAI API and future extensibility
- **SQLite**: Simple deployment, easily upgradeable to PostgreSQL
- **React + TypeScript**: Type safety and modern development experience
- **Tailwind CSS**: Rapid UI development with consistent design system
- **TanStack Query**: Efficient server state management and caching

## 🔮 Future Improvements

- [ ] User authentication and experiment ownership
- [ ] More sophisticated quality metrics (e.g., semantic similarity)
- [ ] Support for multiple LLM providers
- [ ] Batch experiment processing with progress tracking
- [ ] Advanced filtering and search
- [ ] Real-time response generation with WebSockets
- [ ] Experiment templates and presets

## 📄 License

This project is part of the GenAI-Labs Challenge submission.

## 👤 Author

Chris Lee - chris.lee0000@proton.me

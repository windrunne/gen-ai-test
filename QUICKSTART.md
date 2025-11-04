# Quick Start Guide

Get the LLM Lab up and running in 5 minutes.

## Prerequisites

- Python 3.10+
- Node.js 18+
- OpenAI API key

## Setup Steps

### 1. Clone and Navigate

```bash
git clone <your-repo-url>
cd gen-ai
```

### 2. Backend Setup (5 minutes)

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo "OPENAI_API_KEY=your_key_here" > .env
echo "OPENAI_MODEL=gpt-3.5-turbo" >> .env
echo "DATABASE_URL=sqlite:///./llm_lab.db" >> .env

# Start server
uvicorn main:app --reload
```

Backend running at: http://localhost:8000

### 3. Frontend Setup (3 minutes)

```bash
# Open new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend running at: http://localhost:3000

### 4. Test It Out

1. Open http://localhost:3000
2. Enter a prompt (e.g., "Explain quantum computing in simple terms")
3. Set temperature values: `0.5, 1.0, 1.5`
4. Set top_p values: `0.8, 0.9, 1.0`
5. Click "Start Experiment"
6. Wait for responses to generate
7. View metrics and compare responses!

## Common Issues

### Backend won't start
- Check Python version: `python --version` (should be 3.10+)
- Verify API key in `.env`
- Check if port 8000 is available

### Frontend won't start
- Check Node version: `node --version` (should be 18+)
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check if port 3000 is available

### API connection errors
- Verify backend is running on port 8000
- Check browser console for CORS errors
- Verify `VITE_API_BASE_URL` in frontend `.env` (if set)

### LLM API errors
- Verify OpenAI API key is correct
- Check API key has credits
- Verify model name is valid

## Next Steps

- Read [README.md](README.md) for full documentation
- Check [ARCHITECTURE.md](ARCHITECTURE.md) for system design
- See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment

## Need Help?

- Check the logs in terminal
- Review error messages
- Verify all environment variables are set

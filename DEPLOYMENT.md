# Deployment Guide

This guide covers deploying the LLM Lab application to production.

## Prerequisites

- GitHub/GitLab repository
- OpenAI API key
- Railway/Render account (backend)
- Vercel account (frontend)

## Backend Deployment (Railway/Render)

### Railway Deployment

1. **Create New Project:**
   - Go to Railway dashboard
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Select the `backend` directory as root

2. **Configure Environment Variables:**
   ```
   OPENAI_API_KEY=your_api_key_here
   OPENAI_MODEL=gpt-3.5-turbo
   DATABASE_URL=sqlite:///./llm_lab.db
   CORS_ORIGINS=["https://your-frontend.vercel.app"]
   PORT=8000
   ```

3. **Build Settings:**
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

4. **Deploy:**
   - Railway will automatically build and deploy
   - Note the generated URL (e.g., `https://your-app.railway.app`)

### Render Deployment

1. **Create New Web Service:**
   - Go to Render dashboard
   - Click "New" → "Web Service"
   - Connect your repository
   - Select the `backend` directory

2. **Configure:**
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Environment: Python 3

3. **Environment Variables:**
   - Same as Railway above

4. **Deploy:**
   - Render will automatically deploy
   - Note the generated URL

## Frontend Deployment (Vercel)

1. **Import Project:**
   - Go to Vercel dashboard
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Set root directory to `frontend`

2. **Configure Build Settings:**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Environment Variables:**
   ```
   VITE_API_BASE_URL=https://your-backend.railway.app
   ```

4. **Deploy:**
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - Note the generated URL (e.g., `https://your-app.vercel.app`)

5. **Update Backend CORS:**
   - Update `CORS_ORIGINS` in backend to include your Vercel URL

## PostgreSQL Setup (Optional)

For production, consider using PostgreSQL instead of SQLite:

1. **Create Database:**
   - Railway/Render can provision PostgreSQL
   - Note the connection string

2. **Update Environment:**
   ```
   DATABASE_URL=postgresql://user:pass@host:port/dbname
   ```

3. **Install psycopg2:**
   Add to `requirements.txt`:
   ```
   psycopg2-binary==2.9.9
   ```

## Health Checks

### Backend Health Check
```bash
curl https://your-backend.railway.app/health
```

Expected response:
```json
{"status": "healthy"}
```

### Frontend Health Check
- Visit: `https://your-frontend.vercel.app`
- Should load the application

## Troubleshooting

### Backend Issues

1. **API Key Not Found:**
   - Verify `OPENAI_API_KEY` is set in environment variables
   - Check variable name spelling

2. **CORS Errors:**
   - Ensure frontend URL is in `CORS_ORIGINS`
   - Check for trailing slashes

3. **Database Errors:**
   - Verify `DATABASE_URL` is correct
   - Check database permissions

### Frontend Issues

1. **API Connection Errors:**
   - Verify `VITE_API_BASE_URL` is set correctly
   - Check backend is running and accessible
   - Verify CORS configuration

2. **Build Errors:**
   - Check Node.js version (should be 18+)
   - Clear node_modules and reinstall

## Monitoring

### Backend Logs
- Railway: Dashboard → Service → Logs
- Render: Dashboard → Service → Logs

### Frontend Logs
- Vercel: Dashboard → Project → Functions/Logs

## Security Best Practices

1. **Never commit API keys:**
   - Use environment variables only
   - Add `.env` to `.gitignore`

2. **CORS Configuration:**
   - Only allow your frontend domain
   - Remove wildcard origins in production

3. **Rate Limiting:**
   - Consider adding rate limiting middleware
   - Monitor API usage

## Cost Estimation

### Free Tier Limits:
- **Railway**: $5/month free credit
- **Render**: Free tier available (with limitations)
- **Vercel**: Free tier for hobby projects
- **OpenAI**: Pay-as-you-go (typically $0.002 per 1K tokens)

### Typical Usage:
- Small experiments: ~$1-5/month
- Medium usage: ~$10-20/month
- Heavy usage: ~$50+/month

## Scaling Considerations

1. **Database:**
   - SQLite works for small scale
   - Switch to PostgreSQL for production

2. **Caching:**
   - Consider Redis for response caching
   - Reduce API calls

3. **Background Jobs:**
   - Use Celery/Redis for long-running experiments
   - Prevent timeout issues

## Update Deployment

1. **Backend:**
   - Push changes to GitHub
   - Railway/Render auto-deploys

2. **Frontend:**
   - Push changes to GitHub
   - Vercel auto-deploys

3. **Manual Deploy:**
   - Trigger redeploy from dashboard if needed

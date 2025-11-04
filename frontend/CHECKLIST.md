# Frontend Setup Checklist

## Before Running
- [ ] Node.js 18+ installed (`node --version`)
- [ ] Dependencies installed (`npm install`)
- [ ] Backend server running (optional, for API calls)

## Running the Dev Server
1. Open terminal in `frontend` directory
2. Run: `npm run dev`
3. Wait for: "ready in xxx ms"
4. Open browser to URL shown (usually http://localhost:3000)

## What You Should See
- Header with "LLM Lab" logo
- Navigation menu (Home, Experiments)
- "Create New Experiment" form
- Input fields for:
  - Experiment Name
  - Prompt
  - Temperature values
  - Top P values
  - Max Tokens

## If Page is Blank
1. **Open Browser Console (F12)**
   - Look for red errors
   - Common: "Cannot find module", "Failed to resolve"

2. **Check Terminal Output**
   - Any errors during `npm run dev`?
   - Is server running on correct port?

3. **Verify Files**
   - All component files exist?
   - No syntax errors?

4. **Try Hard Refresh**
   - Ctrl+Shift+R (Windows)
   - Cmd+Shift+R (Mac)

## Common Issues

### "Cannot find module 'react'"
```bash
cd frontend
npm install
```

### "Port 3000 already in use"
- Use different port: `npm run dev -- --port 3001`
- Or stop other process using port 3000

### "Failed to resolve import"
- Check file paths are correct
- Verify files exist in `src/` directory

### Styles not loading
- Verify `index.css` imported in `main.tsx`
- Check Tailwind config exists


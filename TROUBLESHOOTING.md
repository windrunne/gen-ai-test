# Troubleshooting Guide

## Empty Page Issue

If you're seeing a blank page, check the following:

### 1. Check Browser Console
Open browser DevTools (F12) and check the Console tab for errors.

Common errors:
- **Module not found**: Dependencies not installed
- **Import errors**: Missing files or incorrect paths
- **TypeScript errors**: Type issues

### 2. Verify Dev Server is Running
```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### 3. Check Dependencies
```bash
cd frontend
npm install
```

### 4. Verify Port 3000 is Available
If port 3000 is in use, Vite will try 3001, 3002, etc. Check the terminal output for the actual port.

### 5. Check for Import Errors
Open browser console and look for:
- `Failed to resolve import`
- `Cannot find module`
- `Unexpected token`

### 6. Test with Minimal Component
Temporarily replace `App.tsx` content with:

```tsx
function App() {
  return <div><h1>Test</h1></div>
}
export default App
```

If this works, the issue is in one of the imported components.

### 7. Check Tailwind CSS
If styles aren't loading, verify:
- `tailwind.config.js` exists
- `postcss.config.js` exists
- `index.css` has `@tailwind` directives

### 8. Clear Cache and Reinstall
```bash
cd frontend
rm -rf node_modules
rm package-lock.json
npm install
npm run dev
```

### 9. Check Backend Connection
The frontend should work even if backend is down. But if you see API errors in console, that's expected if backend isn't running.

### 10. Browser Compatibility
Ensure you're using a modern browser (Chrome, Firefox, Edge, Safari latest versions).

## Quick Fixes

### If nothing appears:
1. Open browser DevTools (F12)
2. Check Console for errors
3. Check Network tab - are files loading?
4. Verify you're accessing the correct URL (usually http://localhost:3000)

### If you see a React error:
- Check all component imports
- Verify all files exist
- Check for syntax errors in components

### If styles are missing:
- Verify Tailwind is configured
- Check `index.css` is imported in `main.tsx`
- Rebuild: `npm run dev`

## Still Having Issues?

1. Share the browser console errors
2. Share the terminal output from `npm run dev`
3. Verify you're in the correct directory
4. Check Node.js version: `node --version` (should be 18+)


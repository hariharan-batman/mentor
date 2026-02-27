# 🚀 Quick Start Guide - FounderDock AI

## Prerequisites
- Node.js 18+ installed
- Two terminal windows

## Installation Steps

### Step 1: Install Server Dependencies
```powershell
cd e:\start\mentor\server
npm install
```

### Step 2: Install Client Dependencies
```powershell
cd e:\start\mentor\client
npm install
```

## Running the Application

### Terminal 1: Start Backend Server
```powershell
cd e:\start\mentor\server
node index.js
```
✅ **Server should start on:** `http://localhost:5001`
✅ **You should see:** "🚀 FounderDock AI Server running on port 5001"

### Terminal 2: Start Frontend
```powershell
cd e:\start\mentor\client
npm run dev
```
✅ **Frontend should start on:** `http://localhost:3000`
✅ **You should see:** "VITE vX.X.X ready in XXXms"

## Access the Application
Open your browser and go to: **http://localhost:3000**

## Troubleshooting

### Port Already in Use (Backend)
If you see "EADDRINUSE" error:
```powershell
# Find process using port 5001
netstat -ano | findstr :5001

# Kill the process (replace PID with the actual process ID)
taskkill /PID <PID> /F
```

### Vite Not Found (Frontend)
```powershell
cd e:\start\mentor\client
npm install --save-dev vite
npm run dev
```

### Dependencies Issues
If npm install fails, try:
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json -Force
npm install
```

## Testing the Application

1. **Landing Page** - Should load with hero section and features
2. **Company Profile** - Fill in your startup details
3. **Run Diagnostic** - Click button to run AI analysis
4. **Dashboard** - View scores and recommendations
5. **Explore All Features** - Use sidebar navigation

## Features to Test

✅ **Company Profile Form** - Save your startup information
✅ **AI Diagnostic** - Generate comprehensive analysis
✅ **Dashboard** - View readiness & funding scores
✅ **Compliance Report** - Check legal requirements
✅ **Funding Score** - Assess investment readiness
✅ **Risk Analysis** - View risk assessments
✅ **90-Day Roadmap** - See personalized action plan
✅ **AI Chat** - Ask questions to AI mentor
✅ **Mentors** - Browse and book mentor sessions
✅ **Documents** - Generate legal templates

## Default Data

The application works with mock data by default. You'll see:
- 5 expert mentors with different specializations
- Realistic AI diagnostic responses
- Sample compliance checklists
- Personalized action plans

## Optional: Add Gemini AI Key

To use real Google Gemini AI instead of mock data:

1. Create `.env` file in server folder:
```
PORT=5001
GEMINI_API_KEY=your_actual_api_key_here
```

2. Restart the backend server

## Success Indicators

When everything is working:
- ✅ Backend console shows: "🚀 FounderDock AI Server running on port 5001"
- ✅ Frontend opens at localhost:3000
- ✅ Landing page loads with animations
- ✅ You can navigate between pages
- ✅ Forms accept and save data
- ✅ AI diagnostic completes successfully

## Need Help?

Check the main README.md for detailed documentation.

---

**Enjoy building your startup with FounderDock AI! 🚀**

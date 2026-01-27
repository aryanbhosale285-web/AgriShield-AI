# 🚀 AgriShield AI - Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites

- ✅ Node.js 18+ installed
- ✅ Python 3.9+ installed
- ✅ PostgreSQL 14+ installed
- ✅ Smartphone with Expo Go app

## Step 1: Frontend Setup (2 minutes)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Expo dev server
npm start
```

**On your phone:**
1. Install "Expo Go" from App Store/Play Store
2. Scan the QR code from terminal
3. App will load on your device

## Step 2: Backend Setup (2 minutes)

```bash
# Navigate to backend (new terminal)
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create database
createdb agrishield

# Start server
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`

## Step 3: Add Your Model (1 minute)

**CRITICAL:** The app needs a trained TensorFlow.js model.

### Option A: Use Placeholder (for testing UI only)
The app will show an error but you can test the UI.

### Option B: Add Real Model
1. Download/train a PlantVillage model
2. Convert to TensorFlow.js format
3. Copy to `frontend/assets/model/`:
   - `model.json`
   - `group1-shard.bin`

## Step 4: Test the App

1. **Open app** on your phone via Expo Go
2. **Grant permissions** (camera, location)
3. **Take a photo** of a plant leaf
4. **See results** with voice guidance
5. **Check history** to see saved scans

## 🎯 What Works Right Now

✅ Beautiful UI with dark green theme  
✅ Camera capture & gallery upload  
✅ Image preprocessing  
✅ Offline storage (SQLite)  
✅ Voice output (Hindi/Marathi)  
✅ Scan history  
✅ Background sync (when online)  
✅ Backend API  

⚠️ **AI Inference** - Requires real model files

## 🐛 Troubleshooting

### "Cannot find module" errors
```bash
cd frontend
npm install
```

### Backend won't start
```bash
# Check PostgreSQL is running
pg_isready

# Create database if missing
createdb agrishield
```

### Camera not working
1. Grant camera permission on device
2. Restart Expo app

### Model loading fails
- Ensure `model.json` exists in `frontend/assets/model/`
- Check model format is TensorFlow.js compatible

## 📱 Testing Without Model

You can test the UI without a real model:
1. The app will show an error on startup
2. But you can still navigate screens
3. Camera and UI will work
4. Just can't get real disease predictions

## 🔄 Update Backend URL

In `frontend/services/syncService.ts`, change:

```typescript
const BACKEND_URL = 'http://YOUR_IP:8000';
```

Replace `YOUR_IP` with your computer's local IP (not localhost).

## 📚 Full Documentation

- [Main README](./README.md)
- [Frontend README](./frontend/README.md)
- [Backend README](./backend/README.md)
- [Walkthrough](./walkthrough.md)

## 🎉 You're Ready!

The app is now running. Test it, customize it, and deploy it!

**Need help?** Check the full documentation or create an issue.

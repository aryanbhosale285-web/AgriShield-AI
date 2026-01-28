# AgriShield AI

**Production-Quality MVP**: Offline-first, on-device AI mobile application for crop disease detection with farmer-friendly UX and voice guidance in Hindi & Marathi.

![AgriShield AI](./frontend/assets/plant-placeholder.png)

## 🌾 Overview

AgriShield AI empowers farmers to detect crop diseases instantly using their smartphone camera. The app works 100% offline with on-device AI inference, stores data locally, and automatically syncs when internet becomes available.

### Key Features

✅ **100% Offline AI** - Disease detection works without internet  
✅ **On-Device Inference** - Privacy-first, no cloud processing  
✅ **Voice Guidance** - Hindi & Marathi TTS for treatment recommendations  
✅ **Farmer-Friendly UX** - Large buttons, icons, minimal text  
✅ **Auto-Sync** - Background sync when connectivity available  
✅ **GPS Tagging** - Privacy-preserving location tracking for outbreak monitoring  
✅ **Scan History** - SQLite-based offline storage  

## 🏗️ Architecture

```
AgriShield-AI/
├── frontend/          # React Native + Expo mobile app
│   ├── screens/       # Camera, Result, History screens
│   ├── services/      # AI classifier, voice, sync
│   ├── storage/       # SQLite offline storage
│   ├── utils/         # Image preprocessing, GPS
│   └── assets/        # TensorFlow.js model, labels
│
└── backend/           # FastAPI + PostgreSQL sync server
    ├── routers/       # Sync endpoints
    ├── database.py    # SQLAlchemy models
    └── schemas.py     # Pydantic validation
```

### Tech Stack

**Frontend:**
- React Native + Expo
- TensorFlow.js (on-device ML)
- SQLite (offline storage)
- Expo Speech (Hindi/Marathi TTS)
- Expo Camera & Location

**Backend:**
- FastAPI
- PostgreSQL
- SQLAlchemy
- Pydantic v2

**AI/ML:**
- MobileNetV2 / EfficientNet (quantized)
- PlantVillage dataset (38 disease classes)
- 100% on-device inference

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- PostgreSQL 14+ (for backend)
- Expo CLI: `npm install -g expo-cli`
- Android Studio / Xcode (for mobile development)

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Expo development server
npm run dev

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup PostgreSQL database
createdb agrishield

# Run server
uvicorn main:app --reload
```

## 📱 Model Setup

**IMPORTANT**: The app requires a trained TensorFlow.js model to function.

### Option 1: Use Pre-trained Model

1. Download a pre-trained PlantVillage model converted to TensorFlow.js
2. Place `model.json` and weight shards in `frontend/assets/model/`

### Option 2: Train Your Own

```bash
# Train with TensorFlow/Keras
python train_model.py

# Convert to TensorFlow.js
tensorflowjs_converter \
    --input_format=keras \
    ./model.h5 \
    ./frontend/assets/model/
```

### Labels Configuration

Update `frontend/assets/labels.json` with your disease classes, including:
- Disease names (English, Hindi, Marathi)
- Severity levels
- Treatment recommendations

## 🎨 UI Design

The app features a beautiful dark green theme inspired by agriculture:

- **Primary Color**: `#1a3a2e` (Dark Green)
- **Accent Color**: `#4ade80` (Vibrant Green)
- **Background**: `#0f1f1a` (Deep Dark)

### Screens

1. **Camera Screen** - Scan crop leaves with large capture button
2. **Result Screen** - Color-coded disease info with voice playback
3. **History Screen** - Past scans with sync status

## 🔊 Voice Features

- Automatic playback of results in selected language
- Support for Hindi (`hi-IN`) and Marathi (`mr-IN`)
- Treatment recommendations narrated clearly
- Replay button for farmers

## 📊 Data Privacy

- **GPS Rounding**: Coordinates rounded to ~1km precision
- **Anonymized Sync**: No personal data sent to server
- **Local-First**: All data stored on device first
- **Optional Sync**: Farmers control when to sync

## 🌐 API Endpoints

### POST `/api/sync`
Sync batch of offline scan data

**Request:**
```json
{
  "scans": [
    {
      "diseaseId": 5,
      "diseaseName": "Tomato Late Blight",
      "confidence": 94.5,
      "latitude": 18.52,
      "longitude": 73.85,
      "timestamp": 1706380800000
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "synced_count": 1,
  "message": "Successfully synced 1 scans"
}
```

### GET `/api/scans`
Retrieve recent scans for analytics

### GET `/api/scans/stats`
Get disease distribution statistics

## 🧪 Testing

### Frontend
```bash
cd frontend
npm run dev
# Use Expo Go app on your phone
```

### Backend
```bash
cd backend
pytest  # Add tests in tests/ directory
```

## 📦 Deployment

### Frontend (Mobile App)

```bash
cd frontend

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

### Backend (Server)

```bash
# Using Docker
docker build -t agrishield-backend .
docker run -p 8000:8000 agrishield-backend

# Or deploy to cloud (AWS, GCP, Azure, Heroku)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- PlantVillage dataset for disease images
- TensorFlow.js team for on-device ML
- Expo team for React Native framework
- Farmers who inspired this project

## 📞 Support

For issues or questions:
- Create an issue on GitHub
- Email: support@agrishield.ai

---

**Built with ❤️ for farmers**

# AgriShield AI - Frontend

React Native + Expo mobile application with offline-first AI disease detection.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## 📱 Requirements

- Node.js 18+
- Expo CLI
- Android Studio (for Android) or Xcode (for iOS)
- Physical device or emulator

## 🧠 Model Setup

**CRITICAL**: You must provide trained TensorFlow.js model files:

1. Place your trained model in `assets/model/`:
   - `model.json` - Model architecture
   - `group1-shard.bin` - Model weights (or multiple shards)

2. Update `assets/labels.json` with your disease classes

### Training a Model

```python
# Example using TensorFlow/Keras
import tensorflow as tf

# Train your model
model = tf.keras.applications.MobileNetV2(
    input_shape=(224, 224, 3),
    classes=38,  # PlantVillage classes
    weights=None
)

# Train on PlantVillage dataset
# ...

# Save model
model.save('model.h5')

# Convert to TensorFlow.js
!tensorflowjs_converter \
    --input_format=keras \
    model.h5 \
    ./assets/model/
```

## 🎨 Project Structure

```
frontend/
├── screens/
│   ├── CameraScreen.tsx      # Main camera interface
│   ├── ResultScreen.tsx      # Disease results display
│   └── HistoryScreen.tsx     # Scan history
│
├── services/
│   ├── classifier.ts         # TensorFlow.js inference
│   ├── voiceService.ts       # Hindi/Marathi TTS
│   └── syncService.ts        # Background sync
│
├── storage/
│   └── scanHistory.ts        # SQLite offline storage
│
├── utils/
│   ├── imagePreprocess.ts    # Image preprocessing
│   └── geoUtils.ts           # GPS utilities
│
├── assets/
│   ├── model/                # TensorFlow.js model
│   └── labels.json           # Disease labels
│
└── App.tsx                   # Main app component
```

## 🔧 Configuration

### Backend URL

Update the backend URL in `services/syncService.ts`:

```typescript
const BACKEND_URL = 'https://your-backend-url.com';
```

### Language Support

The app supports:
- English (`en`)
- Hindi (`hi`)
- Marathi (`mr`)

Add more languages in `services/voiceService.ts`.

## 📦 Dependencies

Key dependencies:
- `@tensorflow/tfjs` - On-device ML
- `@tensorflow/tfjs-react-native` - React Native support
- `expo-camera` - Camera access
- `expo-speech` - Text-to-speech
- `expo-sqlite` - Offline storage
- `expo-location` - GPS tagging

## 🧪 Testing

```bash
# Start Expo in development mode
npm start

# Test on physical device using Expo Go app
# Scan QR code from terminal
```

## 🏗️ Building

### Development Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for Android
eas build --platform android --profile development

# Build for iOS
eas build --platform ios --profile development
```

### Production Build

```bash
# Android APK
eas build --platform android --profile production

# iOS IPA
eas build --platform ios --profile production
```

## 🐛 Troubleshooting

### Model Loading Issues

If you see "Failed to load AI model":
1. Ensure `model.json` and weight files are in `assets/model/`
2. Check file paths in `services/classifier.ts`
3. Verify model format is TensorFlow.js compatible

### Camera Not Working

1. Check permissions in `app.json`
2. Grant camera permission on device
3. Restart app after granting permissions

### Voice Not Playing

1. Check device volume
2. Ensure language is supported by device TTS
3. Test with different languages

## 📱 Supported Platforms

- ✅ Android 5.0+
- ✅ iOS 12.0+
- ⚠️ Web (limited - camera may not work)

## 🎯 Performance Tips

1. **Model Size**: Use quantized models (<10MB)
2. **Image Size**: Resize to 224x224 before inference
3. **Memory**: Dispose tensors after use
4. **Storage**: Clean old scans periodically

## 📄 License

MIT License

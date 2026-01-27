import React, { useState, useEffect } from 'react';
import { CameraCapture } from './components/CameraCapture';
import { initializeClassifier, PredictionResult } from './services/classifier';
import { saveScan } from './services/storage';
import { ArrowLeft, Share2, Info } from 'lucide-react';

type Screen = 'camera' | 'result' | 'history';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('camera');
  const [scanResult, setScanResult] = useState<{ result: PredictionResult; imageUri: string } | null>(null);

  useEffect(() => {
    initializeClassifier();
  }, []);

  const handleCapture = (imageUri: string, result: PredictionResult) => {
    setScanResult({ imageUri, result });
    saveScan({
      disease: result.disease,
      confidence: result.confidence,
      imageUri,
      locationName: 'Detected Location' // Mock location
    });
    setCurrentScreen('result');
  };

  const handleBack = () => {
    setScanResult(null);
    setCurrentScreen('camera');
  };

  if (currentScreen === 'result' && scanResult) {
    const { result, imageUri } = scanResult;
    return (
      <div className="min-h-screen bg-nature-900 text-white pb-safe">
        {/* Header Image */}
        <div className="relative h-72 w-full">
          <img src={imageUri} alt="Scanned plant" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-nature-900 to-transparent" />
          <button
            onClick={handleBack}
            className="absolute top-4 left-4 p-2 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-black/50 transition"
          >
            <ArrowLeft size={24} />
          </button>
          <button
            className="absolute top-4 right-4 p-2 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-black/50 transition"
          >
            <Share2 size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 -mt-12 relative z-10">
          <div className="glass-card rounded-3xl p-6 mb-6">
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-3xl font-bold text-white capitalize">{result.disease.name}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${result.confidence > 80 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                {result.confidence.toFixed(1)}% Match
              </span>
            </div>
            <p className="text-nature-200 text-sm mb-4">Hindi: {result.disease.nameHindi}</p>

            <div className="flex gap-4 mb-4">
              <div className="flex-1 bg-nature-800/50 rounded-xl p-3 text-center border border-nature-600/30">
                <span className="block text-xs text-nature-300 uppercase tracking-wider mb-1">Severity</span>
                <span className={`font-bold capitalize ${result.disease.severity === 'high' ? 'text-red-400' :
                    result.disease.severity === 'medium' ? 'text-orange-400' : 'text-green-400'
                  }`}>
                  {result.disease.severity}
                </span>
              </div>
              <div className="flex-1 bg-nature-800/50 rounded-xl p-3 text-center border border-nature-600/30">
                <span className="block text-xs text-nature-300 uppercase tracking-wider mb-1">Type</span>
                <span className="font-bold text-white">Fungal</span>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-nature-400/20 rounded-lg">
                <Info size={20} className="text-nature-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Treatment</h2>
            </div>
            <p className="text-nature-100 leading-relaxed text-sm mb-6">
              {result.disease.treatment}
            </p>

            <h3 className="text-sm font-bold text-nature-300 mb-2 uppercase tracking-wide">In Hindi</h3>
            <p className="text-nature-100 leading-relaxed text-sm">
              {result.disease.treatmentHindi}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-nature-900">
      <CameraCapture onCapture={handleCapture} onError={(err) => alert(err)} />
    </div>
  );
}

export default App;

import React, { useRef, useState, useEffect } from 'react';
import { Camera, Upload, Leaf, Loader2 } from 'lucide-react';
import { classifyImage } from '../services/classifier';

interface CameraCaptureProps {
    onCapture: (imageUri: string, result: any) => void;
    onError: (error: string) => void;
}

export function CameraCapture({ onCapture, onError }: CameraCaptureProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsStreaming(true);
            }
        } catch (err) {
            console.error('Camera error:', err);
            onError('Could not access camera. Please allow permissions or use upload.');
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            setIsStreaming(false);
        }
    };

    const handleCapture = async () => {
        if (!videoRef.current || !canvasRef.current || isProcessing) return;

        setIsProcessing(true);
        try {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            // Set canvas dimensions to match video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Draw video frame to canvas
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                // Get data URL for display/storage
                const imageUri = canvas.toDataURL('image/jpeg');

                // Run classification directly on the canvas element
                const result = await classifyImage(canvas);

                onCapture(imageUri, result);
            }
        } catch (err) {
            console.error('Capture error:', err);
            onError('Failed to capture and analyze image.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsProcessing(true);
        const reader = new FileReader();

        reader.onload = async (e) => {
            const img = new Image();
            img.onload = async () => {
                try {
                    // Draw to canvas for consistent processing
                    const canvas = canvasRef.current;
                    if (canvas) {
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');
                        ctx?.drawImage(img, 0, 0);

                        const result = await classifyImage(canvas);
                        onCapture(img.src, result);
                    }
                } catch (err) {
                    onError('Failed to analyze uploaded image.');
                } finally {
                    setIsProcessing(false);
                }
            };
            img.src = e.target?.result as string;
        };

        reader.readAsDataURL(file);
    };

    return (
        <div className="relative h-full flex flex-col bg-nature-900">
            {/* Camera View */}
            <div className="flex-1 relative overflow-hidden">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-nature-900/40 via-transparent to-nature-900/90 pointer-events-none" />

                {/* Hidden Canvas for processing */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Scanning UI Overlay */}
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                    <div className="w-64 h-64 border-2 border-nature-400/50 rounded-3xl relative">
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-nature-400 -mt-1 -ml-1 rounded-tl-xl" />
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-nature-400 -mt-1 -mr-1 rounded-tr-xl" />
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-nature-400 -mb-1 -ml-1 rounded-bl-xl" />
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-nature-400 -mb-1 -mr-1 rounded-br-xl" />

                        {isProcessing && (
                            <div className="absolute inset-0 flex items-center justify-center bg-nature-900/50 backdrop-blur-sm rounded-2xl">
                                <Loader2 className="w-12 h-12 text-nature-400 animate-spin" />
                            </div>
                        )}
                    </div>
                    <p className="mt-4 text-nature-200 font-medium text-lg drop-shadow-md">
                        {isProcessing ? 'Analyzing plant...' : 'Align plant in frame'}
                    </p>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-nature-900/95 backdrop-blur-md p-6 pb-12 rounded-t-3xl border-t border-nature-700 -mt-6 z-10">
                <div className="flex items-center justify-center gap-8">
                    {/* Upload Button */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center gap-2 text-nature-200 hover:text-nature-400 transition-colors"
                        disabled={isProcessing}
                    >
                        <div className="w-12 h-12 rounded-full bg-nature-800 border border-nature-600 flex items-center justify-center">
                            <Upload size={24} />
                        </div>
                        <span className="text-sm font-medium">Upload</span>
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileUpload}
                    />

                    {/* Capture Button */}
                    <button
                        onClick={handleCapture}
                        disabled={isProcessing}
                        className="group relative"
                    >
                        <div className="w-20 h-20 rounded-full bg-nature-400/20 border-4 border-nature-400 flex items-center justify-center transition-transform group-active:scale-95">
                            <div className="w-16 h-16 rounded-full bg-nature-400 flex items-center justify-center shadow-lg shadow-nature-400/40">
                                <Camera size={32} className="text-nature-900" />
                            </div>
                        </div>
                    </button>

                    {/* History Button (Placeholder) */}
                    <button
                        className="flex flex-col items-center gap-2 text-nature-200 hover:text-nature-400 transition-colors"
                    >
                        <div className="w-12 h-12 rounded-full bg-nature-800 border border-nature-600 flex items-center justify-center">
                            <Leaf size={24} />
                        </div>
                        <span className="text-sm font-medium">Details</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

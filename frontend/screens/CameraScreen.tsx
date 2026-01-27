import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
    Dimensions,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { classifyDisease } from '../services/classifier';
import { getCurrentLocation, getLocationName } from '../utils/geoUtils';
import { saveScan } from '../storage/scanHistory';

const { width, height } = Dimensions.get('window');

export default function CameraScreen({ navigation }: any) {
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [isProcessing, setIsProcessing] = useState(false);
    const [language, setLanguage] = useState<'en' | 'hi' | 'mr'>('hi');
    const cameraRef = useRef<any>(null);

    useEffect(() => {
        requestPermission();
    }, []);

    if (!permission) {
        return <View style={styles.container} />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.permissionText}>Camera permission required</Text>
                <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                    <Text style={styles.permissionButtonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const takePicture = async () => {
        if (!cameraRef.current || isProcessing) return;

        try {
            setIsProcessing(true);
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.8,
            });

            await processImage(photo.uri);
        } catch (error) {
            console.error('Error taking picture:', error);
            Alert.alert('Error', 'Failed to capture image');
            setIsProcessing(false);
        }
    };

    const pickImage = async () => {
        if (isProcessing) return;

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setIsProcessing(true);
                await processImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to select image');
        }
    };

    const processImage = async (imageUri: string) => {
        try {
            const location = await getCurrentLocation();
            const locationName = await getLocationName(location);

            const result = await classifyDisease(imageUri);

            await saveScan({
                diseaseId: result.disease.id,
                diseaseName: result.disease.name,
                confidence: result.confidence,
                imageUri,
                latitude: location?.latitude || null,
                longitude: location?.longitude || null,
                locationName,
                timestamp: Date.now(),
            });

            navigation.navigate('Result', {
                result,
                imageUri,
                location: locationName,
                language,
            });
        } catch (error) {
            console.error('Error processing image:', error);
            Alert.alert('Error', 'Failed to analyze image. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const cycleLanguage = () => {
        const languages: Array<'en' | 'hi' | 'mr'> = ['en', 'hi', 'mr'];
        const currentIndex = languages.indexOf(language);
        const nextIndex = (currentIndex + 1) % languages.length;
        setLanguage(languages[nextIndex]);
    };

    const getLanguageLabel = () => {
        switch (language) {
            case 'en':
                return 'English';
            case 'hi':
                return 'हिंदी';
            case 'mr':
                return 'मराठी';
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['rgba(26, 58, 46, 0.95)', 'rgba(26, 58, 46, 0.7)']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <Text style={styles.logo}>Kisan{'\n'}kavach</Text>
                    <TouchableOpacity style={styles.languageButton} onPress={cycleLanguage}>
                        <Text style={styles.languageText}>{getLanguageLabel()}</Text>
                        <Ionicons name="chevron-down" size={16} color="#fff" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
                <View style={styles.cameraOverlay}>
                    <View style={styles.scanButtonContainer}>
                        <TouchableOpacity
                            style={styles.scanButton}
                            onPress={takePicture}
                            disabled={isProcessing}
                        >
                            <View style={styles.scanButtonInner}>
                                <Ionicons name="camera" size={60} color="#fff" />
                                <Ionicons
                                    name="leaf"
                                    size={24}
                                    color="#4ade80"
                                    style={styles.leafIcon}
                                />
                            </View>
                            <Text style={styles.scanButtonText}>scan{'\n'}plant</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.uploadButton}
                        onPress={pickImage}
                        disabled={isProcessing}
                    >
                        <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
                        <Text style={styles.uploadButtonText}>upload image</Text>
                    </TouchableOpacity>

                    <View style={styles.bottomSection}>
                        <View style={styles.plantImageContainer}>
                            <Image
                                source={require('../assets/plant-placeholder.png')}
                                style={styles.plantImage}
                                defaultSource={require('../assets/plant-placeholder.png')}
                            />
                        </View>

                        <TouchableOpacity style={styles.detectButton} onPress={() => navigation.navigate('History')}>
                            <Ionicons name="analytics" size={24} color="#fff" />
                            <Text style={styles.detectButtonText}>detect dec</Text>
                        </TouchableOpacity>

                        <View style={styles.locationContainer}>
                            <Ionicons name="location-sharp" size={16} color="#4ade80" />
                            <Text style={styles.locationText}>Detecting location...</Text>
                        </View>
                    </View>
                </View>
            </CameraView>

            {isProcessing && (
                <View style={styles.loadingOverlay}>
                    <View style={styles.loadingBox}>
                        <ActivityIndicator size="large" color="#4ade80" />
                        <Text style={styles.loadingText}>Analyzing leaf...</Text>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a3a2e',
    },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        zIndex: 10,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    logo: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        lineHeight: 32,
    },
    languageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 4,
    },
    languageText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    camera: {
        flex: 1,
    },
    cameraOverlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    scanButtonContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -100,
    },
    scanButton: {
        alignItems: 'center',
        gap: 12,
    },
    scanButtonInner: {
        width: 160,
        height: 160,
        borderRadius: 30,
        backgroundColor: 'rgba(26, 58, 46, 0.9)',
        borderWidth: 3,
        borderColor: 'rgba(74, 222, 128, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    leafIcon: {
        position: 'absolute',
        top: 20,
        right: 20,
    },
    scanButtonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        textTransform: 'lowercase',
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(26, 58, 46, 0.9)',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
        alignSelf: 'center',
        gap: 8,
        marginBottom: 20,
    },
    uploadButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    bottomSection: {
        backgroundColor: 'rgba(26, 58, 46, 0.95)',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingTop: 20,
        paddingBottom: 40,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    plantImageContainer: {
        width: 120,
        height: 120,
        marginTop: -60,
        marginBottom: 20,
    },
    plantImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    detectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        gap: 8,
        marginBottom: 16,
    },
    detectButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    locationText: {
        color: '#e0e0e0',
        fontSize: 18,
        fontWeight: '600',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    loadingBox: {
        backgroundColor: '#1a3a2e',
        padding: 30,
        borderRadius: 20,
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    permissionText: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 20,
    },
    permissionButton: {
        backgroundColor: '#4ade80',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 25,
    },
    permissionButtonText: {
        color: '#1a3a2e',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

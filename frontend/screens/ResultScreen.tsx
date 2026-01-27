import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { speakDiseaseResult, stop } from '../services/voiceService';
import labels from '../assets/labels.json';

const { width } = Dimensions.get('window');

export default function ResultScreen({ route, navigation }: any) {
    const { result, imageUri, location, language } = route.params;
    const [isSpeaking, setIsSpeaking] = useState(false);

    const disease = result.disease;
    const confidence = result.confidence;

    const severityColor = labels.severityColors[disease.severity as keyof typeof labels.severityColors];

    useEffect(() => {
        playVoice();

        return () => {
            stop();
        };
    }, []);

    const playVoice = async () => {
        setIsSpeaking(true);
        const diseaseName = language === 'hi' ? disease.nameHindi : language === 'mr' ? disease.nameMarathi : disease.name;
        const treatment = language === 'hi' ? disease.treatmentHindi : language === 'mr' ? disease.treatmentMarathi : disease.treatment;

        await speakDiseaseResult(diseaseName, treatment, language);
        setIsSpeaking(false);
    };

    const getSeverityLabel = () => {
        switch (disease.severity) {
            case 'none':
                return language === 'hi' ? 'स्वस्थ' : language === 'mr' ? 'निरोगी' : 'Healthy';
            case 'low':
                return language === 'hi' ? 'कम' : language === 'mr' ? 'कमी' : 'Low';
            case 'medium':
                return language === 'hi' ? 'मध्यम' : language === 'mr' ? 'मध्यम' : 'Medium';
            case 'high':
                return language === 'hi' ? 'उच्च' : language === 'mr' ? 'उच्च' : 'High';
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['rgba(26, 58, 46, 0.95)', 'rgba(26, 58, 46, 0.7)']}
                style={styles.header}
            >
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {language === 'hi' ? 'परिणाम' : language === 'mr' ? 'निकाल' : 'Result'}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('History')} style={styles.historyButton}>
                    <Ionicons name="time-outline" size={28} color="#fff" />
                </TouchableOpacity>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.imageContainer}>
                    <Image source={{ uri: imageUri }} style={styles.leafImage} />
                    <View style={[styles.confidenceBadge, { backgroundColor: severityColor }]}>
                        <Text style={styles.confidenceText}>{confidence.toFixed(1)}%</Text>
                    </View>
                </View>

                <View style={styles.diseaseCard}>
                    <View style={[styles.severityIndicator, { backgroundColor: severityColor }]} />
                    <View style={styles.diseaseInfo}>
                        <Text style={styles.diseaseLabel}>
                            {language === 'hi' ? 'रोग' : language === 'mr' ? 'रोग' : 'Disease'}
                        </Text>
                        <Text style={styles.diseaseName}>
                            {language === 'hi' ? disease.nameHindi : language === 'mr' ? disease.nameMarathi : disease.name}
                        </Text>
                        <View style={styles.severityRow}>
                            <Text style={styles.severityLabel}>
                                {language === 'hi' ? 'गंभीरता:' : language === 'mr' ? 'तीव्रता:' : 'Severity:'}
                            </Text>
                            <View style={[styles.severityBadge, { backgroundColor: severityColor }]}>
                                <Text style={styles.severityText}>{getSeverityLabel()}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.treatmentCard}>
                    <View style={styles.treatmentHeader}>
                        <Ionicons name="medical" size={24} color="#4ade80" />
                        <Text style={styles.treatmentTitle}>
                            {language === 'hi' ? 'उपचार' : language === 'mr' ? 'उपचार' : 'Treatment'}
                        </Text>
                    </View>
                    <Text style={styles.treatmentText}>
                        {language === 'hi' ? disease.treatmentHindi : language === 'mr' ? disease.treatmentMarathi : disease.treatment}
                    </Text>
                </View>

                <View style={styles.locationCard}>
                    <Ionicons name="location" size={20} color="#4ade80" />
                    <Text style={styles.locationText}>{location}</Text>
                </View>

                <TouchableOpacity
                    style={[styles.voiceButton, isSpeaking && styles.voiceButtonActive]}
                    onPress={playVoice}
                    disabled={isSpeaking}
                >
                    <Ionicons
                        name={isSpeaking ? 'volume-high' : 'volume-medium-outline'}
                        size={28}
                        color="#fff"
                    />
                    <Text style={styles.voiceButtonText}>
                        {isSpeaking
                            ? language === 'hi'
                                ? 'बोल रहा है...'
                                : language === 'mr'
                                    ? 'बोलत आहे...'
                                    : 'Speaking...'
                            : language === 'hi'
                                ? 'फिर से सुनें'
                                : language === 'mr'
                                    ? 'पुन्हा ऐका'
                                    : 'Play Voice'}
                    </Text>
                </TouchableOpacity>

                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('Camera')}
                    >
                        <Ionicons name="camera-outline" size={24} color="#fff" />
                        <Text style={styles.actionButtonText}>
                            {language === 'hi' ? 'नया स्कैन' : language === 'mr' ? 'नवीन स्कॅन' : 'New Scan'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.actionButtonSecondary]}
                        onPress={() => navigation.navigate('History')}
                    >
                        <Ionicons name="list-outline" size={24} color="#4ade80" />
                        <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>
                            {language === 'hi' ? 'इतिहास' : language === 'mr' ? 'इतिहास' : 'History'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f1f1a',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    historyButton: {
        padding: 8,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    imageContainer: {
        width: '100%',
        height: 300,
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 20,
        position: 'relative',
    },
    leafImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    confidenceBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    confidenceText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    diseaseCard: {
        flexDirection: 'row',
        backgroundColor: '#1a3a2e',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        overflow: 'hidden',
    },
    severityIndicator: {
        width: 6,
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
    },
    diseaseInfo: {
        flex: 1,
        marginLeft: 16,
    },
    diseaseLabel: {
        fontSize: 14,
        color: '#9ca3af',
        marginBottom: 4,
    },
    diseaseName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 12,
    },
    severityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    severityLabel: {
        fontSize: 14,
        color: '#9ca3af',
    },
    severityBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    severityText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    treatmentCard: {
        backgroundColor: '#1a3a2e',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    treatmentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    treatmentTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    treatmentText: {
        fontSize: 16,
        color: '#e0e0e0',
        lineHeight: 24,
    },
    locationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a3a2e',
        borderRadius: 12,
        padding: 16,
        gap: 8,
        marginBottom: 20,
    },
    locationText: {
        fontSize: 16,
        color: '#e0e0e0',
    },
    voiceButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4ade80',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 12,
        marginBottom: 20,
    },
    voiceButtonActive: {
        backgroundColor: '#22c55e',
    },
    voiceButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 30,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a3a2e',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 8,
    },
    actionButtonSecondary: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#4ade80',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    actionButtonTextSecondary: {
        color: '#4ade80',
    },
});

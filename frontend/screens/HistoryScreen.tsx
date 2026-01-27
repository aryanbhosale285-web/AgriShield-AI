import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getAllScans, getScanStats, ScanRecord } from '../storage/scanHistory';
import { getSyncStatus, syncNow } from '../services/syncService';
import labels from '../assets/labels.json';

export default function HistoryScreen({ navigation }: any) {
    const [scans, setScans] = useState<ScanRecord[]>([]);
    const [stats, setStats] = useState({ total: 0, synced: 0, unsynced: 0 });
    const [syncStatus, setSyncStatus] = useState({ isConnected: false, isSyncing: false, unsyncedCount: 0 });
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const scanData = await getAllScans(50);
        const statsData = await getScanStats();
        const syncData = await getSyncStatus();

        setScans(scanData);
        setStats(statsData);
        setSyncStatus(syncData);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const handleSync = async () => {
        const success = await syncNow();
        if (success) {
            await loadData();
        }
    };

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getSeverityColor = (diseaseId: number) => {
        const disease = labels.labels.find(l => l.id === diseaseId);
        if (!disease) return '#9ca3af';
        return labels.severityColors[disease.severity as keyof typeof labels.severityColors];
    };

    const renderScanItem = ({ item }: { item: ScanRecord }) => {
        const severityColor = getSeverityColor(item.diseaseId);

        return (
            <TouchableOpacity style={styles.scanCard}>
                <View style={[styles.severityBar, { backgroundColor: severityColor }]} />

                <Image source={{ uri: item.imageUri }} style={styles.scanImage} />

                <View style={styles.scanInfo}>
                    <Text style={styles.diseaseName} numberOfLines={1}>
                        {item.diseaseName}
                    </Text>
                    <Text style={styles.confidence}>{item.confidence.toFixed(1)}% confidence</Text>
                    <View style={styles.scanMeta}>
                        <Ionicons name="location-outline" size={14} color="#9ca3af" />
                        <Text style={styles.location} numberOfLines={1}>
                            {item.locationName}
                        </Text>
                    </View>
                    <Text style={styles.date}>{formatDate(item.timestamp)}</Text>
                </View>

                <View style={styles.syncIndicator}>
                    {item.synced ? (
                        <Ionicons name="cloud-done" size={24} color="#4ade80" />
                    ) : (
                        <Ionicons name="cloud-offline" size={24} color="#9ca3af" />
                    )}
                </View>
            </TouchableOpacity>
        );
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
                <Text style={styles.headerTitle}>Scan History</Text>
                <TouchableOpacity onPress={handleSync} style={styles.syncButton}>
                    <Ionicons
                        name={syncStatus.isSyncing ? 'sync' : 'cloud-upload-outline'}
                        size={28}
                        color="#fff"
                    />
                </TouchableOpacity>
            </LinearGradient>

            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{stats.total}</Text>
                    <Text style={styles.statLabel}>Total Scans</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={[styles.statValue, { color: '#4ade80' }]}>{stats.synced}</Text>
                    <Text style={styles.statLabel}>Synced</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={[styles.statValue, { color: '#fbbf24' }]}>{stats.unsynced}</Text>
                    <Text style={styles.statLabel}>Pending</Text>
                </View>
            </View>

            <View style={[styles.connectionBanner, syncStatus.isConnected ? styles.connected : styles.offline]}>
                <Ionicons
                    name={syncStatus.isConnected ? 'wifi' : 'wifi-outline'}
                    size={16}
                    color="#fff"
                />
                <Text style={styles.connectionText}>
                    {syncStatus.isConnected ? 'Online - Auto-sync enabled' : 'Offline - Data saved locally'}
                </Text>
            </View>

            {scans.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="leaf-outline" size={64} color="#4ade80" />
                    <Text style={styles.emptyText}>No scans yet</Text>
                    <Text style={styles.emptySubtext}>Start scanning crop leaves to detect diseases</Text>
                    <TouchableOpacity
                        style={styles.scanNowButton}
                        onPress={() => navigation.navigate('Camera')}
                    >
                        <Ionicons name="camera" size={20} color="#fff" />
                        <Text style={styles.scanNowText}>Scan Now</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={scans}
                    renderItem={renderScanItem}
                    keyExtractor={item => item.id?.toString() || Math.random().toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4ade80" />
                    }
                />
            )}
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
    syncButton: {
        padding: 8,
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#1a3a2e',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#9ca3af',
    },
    connectionBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        gap: 8,
        marginHorizontal: 20,
        marginBottom: 16,
        borderRadius: 8,
    },
    connected: {
        backgroundColor: '#22c55e',
    },
    offline: {
        backgroundColor: '#6b7280',
    },
    connectionText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    listContent: {
        padding: 20,
        paddingTop: 0,
    },
    scanCard: {
        flexDirection: 'row',
        backgroundColor: '#1a3a2e',
        borderRadius: 16,
        marginBottom: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    severityBar: {
        width: 4,
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
    },
    scanImage: {
        width: 80,
        height: 80,
        marginLeft: 4,
        borderRadius: 12,
        margin: 12,
    },
    scanInfo: {
        flex: 1,
        paddingVertical: 12,
        paddingRight: 12,
    },
    diseaseName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    confidence: {
        fontSize: 14,
        color: '#4ade80',
        marginBottom: 4,
    },
    scanMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 4,
    },
    location: {
        fontSize: 12,
        color: '#9ca3af',
        flex: 1,
    },
    date: {
        fontSize: 12,
        color: '#6b7280',
    },
    syncIndicator: {
        position: 'absolute',
        top: 12,
        right: 12,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 16,
        color: '#9ca3af',
        textAlign: 'center',
        marginBottom: 24,
    },
    scanNowButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4ade80',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
        gap: 8,
    },
    scanNowText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { progressAPI, gamificationAPI } from '../services/api';
import { getBadgeById, getBadgesByCategory, BadgeCategory } from '../utils/badges';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function ProgressScreen() {
  const [progress, setProgress] = useState<any>(null);
  const [gamification, setGamification] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<BadgeCategory>('poseEstimation');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [progressData, gamificationData] = await Promise.all([
        progressAPI.loadProgress().catch(() => ({ progress: {} })),
        gamificationAPI.getStats().catch(() => ({ gamification: {} })),
      ]);
      setProgress(progressData.progress || {});
      setGamification(gamificationData.gamification || {});
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  // Get categorized progress
  const poseProgress = progress?.poseEstimation || {};
  const cardioProgress = progress?.cardio || {};
  const arProgress = progress?.ar || {};
  
  // Legacy support
  const completedDrills = poseProgress.completedDrills || progress.completedDrills || [];
  const scores = poseProgress.scores || progress.scores || {};
  const badges = poseProgress.badges || progress.badges || [];
  const points = gamification.points || 0;
  const streak = gamification.streak || 0;
  
  // Get current category data
  const getCurrentCategoryData = () => {
    switch (activeTab) {
      case 'poseEstimation':
        return {
          title: 'Pose Estimation',
          completed: poseProgress.completedDrills || [],
          scores: poseProgress.scores || {},
          totalTime: poseProgress.totalTime || 0,
          sessions: poseProgress.sessions || 0,
          badges: poseProgress.badges || [],
        };
      case 'cardio':
        return {
          title: 'Cardio',
          completed: cardioProgress.completedWorkouts || [],
          scores: {},
          totalTime: cardioProgress.totalTime || 0,
          sessions: cardioProgress.sessions || 0,
          calories: cardioProgress.calories || 0,
          badges: cardioProgress.badges || [],
        };
      case 'ar':
        return {
          title: 'AR',
          completed: arProgress.completedModules || [],
          scores: {},
          totalTime: arProgress.totalTime || 0,
          sessions: arProgress.sessions || 0,
          badges: arProgress.badges || [],
        };
    }
  };
  
  const currentData = getCurrentCategoryData();
  
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.title}>Progress</Text>
        
        {/* Category Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'poseEstimation' && styles.tabActive]}
            onPress={() => setActiveTab('poseEstimation')}
          >
            <Text style={[styles.tabText, activeTab === 'poseEstimation' && styles.tabTextActive]}>
              Pose
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'cardio' && styles.tabActive]}
            onPress={() => setActiveTab('cardio')}
          >
            <Text style={[styles.tabText, activeTab === 'cardio' && styles.tabTextActive]}>
              Cardio
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'ar' && styles.tabActive]}
            onPress={() => setActiveTab('ar')}
          >
            <Text style={[styles.tabText, activeTab === 'ar' && styles.tabTextActive]}>
              AR
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{currentData.completed.length}</Text>
            <Text style={styles.statLabel}>
              {activeTab === 'poseEstimation' ? 'Drills' : activeTab === 'cardio' ? 'Workouts' : 'Modules'}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatTime(currentData.totalTime)}</Text>
            <Text style={styles.statLabel}>Total Time</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{currentData.sessions}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{currentData.badges.length}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>
          {activeTab === 'cardio' && currentData.calories > 0 && (
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{currentData.calories}</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {activeTab === 'poseEstimation' ? 'Completed Drills' : 
             activeTab === 'cardio' ? 'Completed Workouts' : 
             'Completed Modules'}
          </Text>
          {currentData.completed.length > 0 ? (
            currentData.completed.map((item: string, index: number) => (
              <View key={index} style={styles.item}>
                <Text style={styles.itemText}>✓ {item}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>
              {activeTab === 'poseEstimation' ? 'No drills completed yet' :
               activeTab === 'cardio' ? 'No workouts completed yet' :
               'No modules completed yet'}
            </Text>
          )}
        </View>

        {activeTab === 'poseEstimation' && Object.keys(currentData.scores).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Scores</Text>
            {Object.entries(currentData.scores).map(([key, value]: [string, any]) => {
              const scoresArray = Array.isArray(value) ? value : [value];
              const avgScore = scoresArray.reduce((sum: number, s: number) => sum + s, 0) / scoresArray.length;
              const bestScore = Math.max(...scoresArray);
              return (
                <View key={key} style={styles.item}>
                  <Text style={styles.itemText}>
                    {key}: Avg {avgScore.toFixed(0)}%, Best {bestScore.toFixed(0)}%
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Badges</Text>
          {currentData.badges.length > 0 ? (
            <View style={styles.badgesContainer}>
              {currentData.badges.map((badgeId: string, index: number) => {
                const badge = getBadgeById(badgeId);
                return (
                  <View key={index} style={styles.badge}>
                    <Icon name={badge?.icon || 'emoji-events'} size={32} color={badge?.color || '#FFD700'} />
                    <View style={styles.badgeTextContainer}>
                      <Text style={styles.badgeText}>{badge?.name || badgeId}</Text>
                      <Text style={styles.badgeDescription}>{badge?.description || ''}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={styles.emptyText}>No badges earned yet</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  item: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemText: {
    fontSize: 14,
    color: '#333',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#fff',
  },
  badge: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: '45%',
    marginBottom: 8,
  },
  badgeTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  badgeText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  badgeDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});


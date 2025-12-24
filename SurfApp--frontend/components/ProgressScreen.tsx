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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { progressAPI, gamificationAPI } from '../services/api';
import { getBadgeById, getBadgesByCategory, BadgeCategory } from '../utils/badges';
import { formatProgress } from '../utils/progressFormatter';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialIcons';

const WORKOUT_PROGRESS_KEY = '@workout_progress';

export default function ProgressScreen() {
  const [progress, setProgress] = useState<any>(null);
  const [gamification, setGamification] = useState<any>(null);
  const [cardioWorkouts, setCardioWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<BadgeCategory>('poseEstimation');

  useEffect(() => {
    loadData();
  }, []);

  const loadCardioWorkouts = async () => {
    try {
      const data = await AsyncStorage.getItem(WORKOUT_PROGRESS_KEY);
      if (data) {
        const workouts = JSON.parse(data);
        setCardioWorkouts(workouts || []);
      }
    } catch (error) {
      console.error('Error loading cardio workouts:', error);
      setCardioWorkouts([]);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [progressData, gamificationData] = await Promise.all([
        progressAPI.loadProgress().catch(() => ({ progress: {} })),
        gamificationAPI.getStats().catch(() => ({ gamification: {} })),
      ]);
      setProgress(progressData.progress || {});
      setGamification(gamificationData.gamification || {});
      await loadCardioWorkouts();
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
  
  // Calculate cardio stats from local workouts
  const calculateStreak = (workouts: any[]): number => {
    if (workouts.length === 0) return 0;
    const sorted = [...workouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const workout of sorted) {
      const workoutDate = new Date(workout.date);
      workoutDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((currentDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === streak) {
        streak++;
        currentDate = new Date(workoutDate);
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (diffDays > streak) {
        break;
      }
    }
    return streak;
  };
  
  const calculateLongestStreak = (workouts: any[]): number => {
    if (workouts.length === 0) return 0;
    const sorted = [...workouts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let longestStreak = 1;
    let currentStreak = 1;
    
    for (let i = 1; i < sorted.length; i++) {
      const prevDate = new Date(sorted[i - 1].date);
      const currDate = new Date(sorted[i].date);
      const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }
    return longestStreak;
  };

  const cardioStats = {
    workoutsCompleted: cardioWorkouts.length,
    totalMinutes: cardioWorkouts.reduce((sum, w) => sum + (w.durationCompleted || 0), 0),
    currentStreak: calculateStreak(cardioWorkouts),
    longestStreak: calculateLongestStreak(cardioWorkouts),
  };

  // Get current category data
  const getCurrentCategoryData = () => {
    switch (activeTab) {
      case 'poseEstimation':
        const poseFormatted = formatProgress('pose', {
          totalTime: poseProgress.totalTime || 0,
          sessions: poseProgress.sessions || 0,
          scores: poseProgress.scores || {},
        });
        return {
          title: 'Pose Estimation',
          completed: poseProgress.completedDrills || [],
          scores: poseProgress.scores || {},
          totalTime: poseProgress.totalTime || 0,
          sessions: poseProgress.sessions || 0,
          badges: poseProgress.badges || [],
          formatted: poseFormatted,
        };
      case 'cardio':
        const cardioFormatted = formatProgress('cardio', {
          totalMinutes: cardioStats.totalMinutes,
          workoutsCompleted: cardioStats.workoutsCompleted,
          averageCompletionRate: cardioWorkouts.length > 0
            ? cardioWorkouts.reduce((sum, w) => sum + (w.completionRate || 0), 0) / cardioWorkouts.length
            : 0,
        });
        return {
          title: 'Cardio',
          completed: cardioWorkouts.map((w, i) => ({ id: i, name: w.planName })),
          scores: {},
          totalTime: cardioStats.totalMinutes * 60, // Convert to seconds
          sessions: cardioStats.workoutsCompleted,
          calories: 0,
          badges: [],
          streak: cardioStats.currentStreak,
          longestStreak: cardioStats.longestStreak,
          formatted: cardioFormatted,
        };
      case 'ar':
        const arFormatted = formatProgress('ar', {
          totalTime: arProgress.totalTime || 0,
          sessions: arProgress.sessions || 0,
          spatialAccuracy: arProgress.spatialAccuracy || 0,
        });
        return {
          title: 'AR',
          completed: arProgress.completedModules || [],
          scores: {},
          totalTime: arProgress.totalTime || 0,
          sessions: arProgress.sessions || 0,
          badges: arProgress.badges || [],
          formatted: arFormatted,
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
            <Text style={styles.statValue}>
              {currentData.formatted ? currentData.formatted.time.split(' ')[0] : formatTime(currentData.totalTime).split(' ')[0]}
            </Text>
            <Text style={styles.statLabel}>Total Time (min)</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {currentData.formatted ? currentData.formatted.sessions.split(' ')[0] : currentData.sessions}
            </Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          {currentData.formatted?.completion && (
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{currentData.formatted.completion}</Text>
              <Text style={styles.statLabel}>Completion</Text>
            </View>
          )}
          {currentData.formatted?.accuracy && (
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{currentData.formatted.accuracy}</Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>
          )}
          {activeTab === 'cardio' && currentData.streak !== undefined && (
            <>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{currentData.streak}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{currentData.longestStreak || 0}</Text>
                <Text style={styles.statLabel}>Longest Streak</Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {activeTab === 'poseEstimation' ? 'Completed Drills' : 
             activeTab === 'cardio' ? 'Recent Workouts' : 
             'Completed Modules'}
          </Text>
          {activeTab === 'cardio' && cardioWorkouts.length > 0 ? (
            cardioWorkouts.slice(0, 10).map((workout, index) => {
              const activities = workout.activities || [];
              const completedActivities = activities.filter((a: any) => a.status === 'completed');
              const skippedActivities = activities.filter((a: any) => a.status === 'skipped');
              
              return (
                <View key={index} style={styles.item}>
                  <Text style={styles.itemText}>
                    {new Date(workout.date).toLocaleDateString()} - {workout.planName}
                  </Text>
                  <Text style={[styles.itemText, { fontSize: 12, color: '#666', marginTop: 4 }]}>
                    {workout.durationCompleted || workout.totalDurationActual || 0} min • 
                    {completedActivities.length} completed • 
                    {skippedActivities.length} skipped • 
                    {workout.completionRate || 0}% complete
                  </Text>
                  
                  {/* Individual Activity Details */}
                  {activities && activities.length > 0 && (
                    <View style={styles.activityDetailsContainer}>
                      <Text style={styles.activityDetailsTitle}>Activities:</Text>
                      {activities.slice(0, 5).map((activity: any, actIndex: number) => (
                        <View key={actIndex} style={styles.activityDetailItem}>
                          <Icon 
                            name={activity.status === 'completed' ? 'check-circle' : activity.status === 'skipped' ? 'cancel' : 'radio-button-unchecked'} 
                            size={16} 
                            color={activity.status === 'completed' ? '#4CAF50' : activity.status === 'skipped' ? '#FF3B30' : '#ccc'} 
                          />
                          <Text style={styles.activityDetailText}>
                            {activity.name} 
                            {activity.status === 'completed' && activity.durationActual && 
                              ` (${activity.durationActual}s)`}
                            {activity.status === 'skipped' && ' (skipped)'}
                          </Text>
                        </View>
                      ))}
                      {activities.length > 5 && (
                        <Text style={styles.activityDetailText}>
                          ... and {activities.length - 5} more activities
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              );
            })
          ) : currentData.completed.length > 0 ? (
            currentData.completed.map((item: any, index: number) => (
              <View key={index} style={styles.item}>
                <Text style={styles.itemText}>✓ {typeof item === 'string' ? item : item.name}</Text>
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
  activityDetailsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  activityDetailsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  activityDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  activityDetailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
});


import React from 'react';
import {
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../src/constants/colors';
import { useWorkoutSummary } from '../../src/hooks/useWorkout';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';

export default function WorkoutSummaryScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { data: summary, isLoading } = useWorkoutSummary(id ?? '');

  // Mock data if no real summary yet
  const displayData = summary ?? {
    duration: 3240,      // seconds
    totalSets: 18,
    totalReps: 148,
    totalVolume: 14200,  // lbs
    exercisesCompleted: 6,
    personalRecords: [
      { exerciseName: 'Bench Press', type: '1rm', value: 225, previousValue: 215 },
    ],
  };

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const mins = m % 60;
    return h > 0 ? `${h}h ${mins}m` : `${m}m`;
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Just crushed a workout on GymOS!\n💪 ${displayData.exercisesCompleted} exercises | ${displayData.totalSets} sets | ${formatDuration(displayData.duration)}\nDownload GymOS to track your fitness journey.`,
      });
    } catch {
      // ignore share errors
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Celebration Header */}
        <View style={styles.celebrationSection}>
          <View style={styles.celebrationIcon}>
            <Text style={styles.celebrationEmoji}>🏆</Text>
          </View>
          <Text style={styles.celebrationTitle}>Workout Complete!</Text>
          <Text style={styles.celebrationSubtitle}>Outstanding effort. Every rep counts.</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {[
            { icon: 'time-outline', label: 'Duration', value: formatDuration(displayData.duration), color: Colors.primary[500] },
            { icon: 'layers-outline', label: 'Total Sets', value: displayData.totalSets.toString(), color: Colors.energy },
            { icon: 'refresh-outline', label: 'Total Reps', value: displayData.totalReps.toString(), color: Colors.success },
            { icon: 'barbell-outline', label: 'Volume', value: `${(displayData.totalVolume / 1000).toFixed(1)}k lbs`, color: Colors.muscle },
          ].map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <View style={[styles.statIconBg, { backgroundColor: stat.color + '15' }]}>
                <Ionicons name={stat.icon as any} size={20} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Personal Records */}
        {(displayData.personalRecords?.length ?? 0) > 0 && (
          <Card style={styles.prCard}>
            <View style={styles.prHeader}>
              <View style={styles.prBadge}>
                <Ionicons name="trophy" size={14} color={Colors.warning} />
                <Text style={styles.prBadgeText}>NEW RECORD{displayData.personalRecords.length > 1 ? 'S' : ''}</Text>
              </View>
            </View>
            {displayData.personalRecords.map((pr) => (
              <View key={pr.exerciseName} style={styles.prRow}>
                <View style={styles.prLeft}>
                  <Ionicons name="flame" size={18} color={Colors.warning} />
                  <View>
                    <Text style={styles.prName}>{pr.exerciseName}</Text>
                    <Text style={styles.prType}>
                      {pr.type === '1rm' ? 'Estimated 1RM' : pr.type === 'max-reps' ? 'Max Reps' : 'Max Volume'}
                    </Text>
                  </View>
                </View>
                <View style={styles.prRight}>
                  <Text style={styles.prNew}>{pr.value} lbs</Text>
                  <Text style={styles.prPrev}>was {pr.previousValue}</Text>
                </View>
              </View>
            ))}
          </Card>
        )}

        {/* Exercises Completed */}
        <Card style={styles.exercisesCard}>
          <Text style={styles.sectionTitle}>
            {displayData.exercisesCompleted} Exercises Completed
          </Text>
          <View style={styles.exerciseCompleteSummary}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={styles.exerciseCompleteText}>
              All planned exercises finished
            </Text>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title="Share Workout"
            variant="secondary"
            onPress={handleShare}
            icon={<Ionicons name="share-social-outline" size={18} color={Colors.primary[600]} />}
            iconPosition="left"
            style={{ marginBottom: 12 }}
          />
          <Button
            title="Back to Home"
            onPress={() => router.replace('/(tabs)/')}
            icon={<Ionicons name="home-outline" size={18} color={Colors.white} />}
            iconPosition="left"
          />
        </View>

        {/* Motivational quote */}
        <View style={styles.quoteCard}>
          <Ionicons name="sparkles" size={16} color={Colors.primary[400]} />
          <Text style={styles.quote}>
            "The pain you feel today will be the strength you feel tomorrow."
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20, paddingBottom: 48 },

  celebrationSection: { alignItems: 'center', paddingVertical: 32 },
  celebrationIcon: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: Colors.warning + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  celebrationEmoji: { fontSize: 52 },
  celebrationTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  celebrationSubtitle: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  statCard: {
    width: '47%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4 },
  statLabel: { fontSize: 12, color: Colors.textTertiary, fontWeight: '500' },

  prCard: { marginBottom: 16, borderWidth: 1, borderColor: Colors.warning + '30', backgroundColor: Colors.warningLight },
  prHeader: { marginBottom: 12 },
  prBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: Colors.warning + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  prBadgeText: { fontSize: 11, fontWeight: '800', color: Colors.warning, letterSpacing: 0.5 },
  prRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  prLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  prName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  prType: { fontSize: 12, color: Colors.textTertiary, marginTop: 2 },
  prRight: { alignItems: 'flex-end' },
  prNew: { fontSize: 20, fontWeight: '800', color: Colors.warning },
  prPrev: { fontSize: 12, color: Colors.textTertiary },

  exercisesCard: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  exerciseCompleteSummary: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  exerciseCompleteText: { fontSize: 14, color: Colors.textSecondary },

  actions: { marginBottom: 20 },

  quoteCard: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: Colors.primary[50],
    borderRadius: 14,
    padding: 16,
  },
  quote: {
    flex: 1,
    fontSize: 13,
    color: Colors.primary[600],
    fontStyle: 'italic',
    lineHeight: 20,
  },
});

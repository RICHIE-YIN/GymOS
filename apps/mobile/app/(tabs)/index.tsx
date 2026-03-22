import React from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { Colors } from '../../src/constants/colors';
import { useAppStore } from '../../src/lib/store';
import { useMacros } from '../../src/hooks/useMacros';
import { useTodayWorkout } from '../../src/hooks/useWorkout';
import { useProgress } from '../../src/hooks/useProgress';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { MacroRing } from '../../src/components/ui/MacroRing';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { CardSkeleton } from '../../src/components/ui/LoadingSkeleton';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const { user } = useAppStore();
  const { log, isLoadingLog, targets, refetch } = useMacros();
  const { data: todayWorkout, isLoading: isLoadingWorkout, refetch: refetchWorkout } = useTodayWorkout();
  const { summary } = useProgress();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchWorkout()]);
    setRefreshing(false);
  };

  const firstName = user?.name?.split(' ')[0] ?? 'Athlete';
  const today = format(new Date(), 'EEEE, MMMM d');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary[500]} />}
      >
        {/* ── Header ─────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingText}>{greeting()},</Text>
            <Text style={styles.nameText}>{firstName} 👋</Text>
            <Text style={styles.dateText}>{today}</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={22} color={Colors.textPrimary} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        {/* ── Streak + Quick Stats ────────────────────────────────── */}
        <View style={styles.statsRow}>
          <View style={[styles.statChip, { backgroundColor: Colors.energy + '15' }]}>
            <Ionicons name="flame" size={16} color={Colors.energy} />
            <Text style={[styles.statChipText, { color: Colors.energy }]}>
              {summary?.weeksActive ?? 0}w Streak
            </Text>
          </View>
          <View style={[styles.statChip, { backgroundColor: Colors.success + '15' }]}>
            <Ionicons name="barbell-outline" size={16} color={Colors.success} />
            <Text style={[styles.statChipText, { color: Colors.success }]}>
              {summary?.workoutsCompleted ?? 0} Workouts
            </Text>
          </View>
          <View style={[styles.statChip, { backgroundColor: Colors.primary[100] }]}>
            <Ionicons name="trending-down" size={16} color={Colors.primary[500]} />
            <Text style={[styles.statChipText, { color: Colors.primary[600] }]}>
              {summary?.weightChange !== undefined
                ? `${summary.weightChange > 0 ? '+' : ''}${summary.weightChange} lbs`
                : '-- lbs'}
            </Text>
          </View>
        </View>

        {/* ── Today's Workout ─────────────────────────────────────── */}
        {isLoadingWorkout ? (
          <CardSkeleton />
        ) : todayWorkout ? (
          <Card elevated style={styles.workoutCard}>
            <View style={styles.workoutCardHeader}>
              <View style={[styles.workoutTypeBadge, { backgroundColor: Colors.primary[100] }]}>
                <Ionicons name="barbell-outline" size={14} color={Colors.primary[600]} />
                <Text style={styles.workoutTypeText}>{todayWorkout.type.toUpperCase()}</Text>
              </View>
              {todayWorkout.isCompleted && (
                <View style={styles.completedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                  <Text style={styles.completedText}>Done</Text>
                </View>
              )}
            </View>
            <Text style={styles.workoutName}>{todayWorkout.name}</Text>
            <View style={styles.workoutMeta}>
              <View style={styles.workoutMetaItem}>
                <Ionicons name="list-outline" size={14} color={Colors.textTertiary} />
                <Text style={styles.workoutMetaText}>
                  {todayWorkout.exercises.length} exercises
                </Text>
              </View>
              <View style={styles.workoutMetaItem}>
                <Ionicons name="time-outline" size={14} color={Colors.textTertiary} />
                <Text style={styles.workoutMetaText}>~{todayWorkout.estimatedDuration} min</Text>
              </View>
            </View>
            {!todayWorkout.isCompleted && (
              <Button
                title="Start Workout"
                onPress={() => router.push('/workout/active')}
                icon={<Ionicons name="play" size={16} color={Colors.white} />}
                iconPosition="left"
                size="md"
                style={{ marginTop: 14 }}
              />
            )}
          </Card>
        ) : (
          <Card style={styles.restCard}>
            <Ionicons name="bed-outline" size={28} color={Colors.textTertiary} />
            <Text style={styles.restTitle}>Rest Day</Text>
            <Text style={styles.restSubtitle}>Recovery is part of progress</Text>
          </Card>
        )}

        {/* ── Daily Macros ─────────────────────────────────────────── */}
        <Card style={styles.macroCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Daily Nutrition</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/nutrition')}>
              <Text style={styles.seeAll}>See details</Text>
            </TouchableOpacity>
          </View>

          {isLoadingLog ? (
            <View style={{ height: 200, alignItems: 'center', justifyContent: 'center' }}>
              <CardSkeleton />
            </View>
          ) : log && targets ? (
            <>
              <MacroRing
                calories={log.consumed.calories}
                caloriesTarget={targets.calories}
                protein={log.consumed.protein}
                proteinTarget={targets.protein}
                carbs={log.consumed.carbs}
                carbsTarget={targets.carbs}
                fat={log.consumed.fat}
                fatTarget={targets.fat}
                size={180}
              />
              <View style={styles.macroBarsSection}>
                {[
                  { label: 'Protein', consumed: log.consumed.protein, target: targets.protein, color: Colors.protein },
                  { label: 'Carbs', consumed: log.consumed.carbs, target: targets.carbs, color: Colors.carbs },
                  { label: 'Fat', consumed: log.consumed.fat, target: targets.fat, color: Colors.fat },
                ].map((m) => (
                  <View key={m.label} style={styles.macroBarRow}>
                    <View style={styles.macroBarLabel}>
                      <View style={[styles.dot, { backgroundColor: m.color }]} />
                      <Text style={styles.macroBarText}>{m.label}</Text>
                    </View>
                    <ProgressBar
                      value={(m.consumed / (m.target || 1)) * 100}
                      color={m.color}
                      height={6}
                      style={{ flex: 1 }}
                    />
                    <Text style={styles.macroBarValue}>
                      {m.consumed}<Text style={styles.macroBarTarget}>/{m.target}g</Text>
                    </Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <Text style={styles.emptyText}>No nutrition data yet. Log your meals!</Text>
          )}
        </Card>

        {/* ── Today's Meals ────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Meals</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/nutrition')}>
            <Text style={styles.seeAll}>Log food</Text>
          </TouchableOpacity>
        </View>

        {(['breakfast', 'lunch', 'dinner'] as const).map((mealType) => {
          const meal = log?.meals.find((m) => m.type === mealType);
          const mealColors: Record<string, string> = {
            breakfast: Colors.warning,
            lunch: Colors.energy,
            dinner: Colors.muscle,
          };
          const color = mealColors[mealType];
          return (
            <Card key={mealType} style={styles.mealSlot}>
              <View style={[styles.mealSlotIcon, { backgroundColor: color + '15' }]}>
                <Ionicons
                  name={mealType === 'breakfast' ? 'sunny-outline' : mealType === 'lunch' ? 'partly-sunny-outline' : 'moon-outline'}
                  size={20}
                  color={color}
                />
              </View>
              <View style={styles.mealSlotInfo}>
                <Text style={styles.mealSlotType}>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</Text>
                {meal ? (
                  <Text style={styles.mealSlotName}>{meal.name}</Text>
                ) : (
                  <Text style={styles.mealSlotEmpty}>Tap to log</Text>
                )}
              </View>
              {meal ? (
                <Text style={styles.mealSlotCal}>{meal.macros.calories} kcal</Text>
              ) : (
                <Ionicons name="add-circle-outline" size={24} color={Colors.primary[400]} />
              )}
            </Card>
          );
        })}

        {/* ── AI Coach Card ────────────────────────────────────────── */}
        {user?.subscription !== 'free' && (
          <Card elevated style={styles.aiCard}>
            <View style={styles.aiHeader}>
              <View style={styles.aiIconWrapper}>
                <Ionicons name="sparkles" size={20} color={Colors.white} />
              </View>
              <View>
                <Text style={styles.aiTitle}>AI Coach Insight</Text>
                <Text style={styles.aiSubtitle}>Based on your last 7 days</Text>
              </View>
            </View>
            <Text style={styles.aiMessage}>
              Your protein intake has been consistent — great work! Consider adding 10% more carbs on workout days to maximize performance and recovery.
            </Text>
            <TouchableOpacity style={styles.aiAction}>
              <Text style={styles.aiActionText}>View full recommendation</Text>
              <Ionicons name="arrow-forward" size={14} color={Colors.primary[500]} />
            </TouchableOpacity>
          </Card>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greetingText: { fontSize: 14, color: Colors.textSecondary, marginBottom: 2 },
  nameText: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  dateText: { fontSize: 13, color: Colors.textTertiary, marginTop: 2 },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },

  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statChipText: { fontSize: 12, fontWeight: '700' },

  workoutCard: { marginBottom: 16, backgroundColor: Colors.primary[600] },
  workoutCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  workoutTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  workoutTypeText: { fontSize: 11, fontWeight: '700', color: Colors.white, letterSpacing: 0.5 },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.successLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  completedText: { fontSize: 11, fontWeight: '700', color: Colors.success },
  workoutName: { fontSize: 22, fontWeight: '800', color: Colors.white, marginBottom: 10 },
  workoutMeta: { flexDirection: 'row', gap: 16 },
  workoutMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  workoutMetaText: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },

  restCard: {
    marginBottom: 16,
    alignItems: 'center',
    paddingVertical: 24,
    gap: 6,
  },
  restTitle: { fontSize: 18, fontWeight: '700', color: Colors.textSecondary },
  restSubtitle: { fontSize: 13, color: Colors.textTertiary },

  macroCard: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  seeAll: { fontSize: 14, color: Colors.primary[500], fontWeight: '600' },
  macroBarsSection: { marginTop: 16, gap: 10 },
  macroBarRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  macroBarLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, width: 64 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  macroBarText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  macroBarValue: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary, width: 64, textAlign: 'right' },
  macroBarTarget: { fontWeight: '400', color: Colors.textTertiary },
  emptyText: { fontSize: 14, color: Colors.textTertiary, textAlign: 'center', paddingVertical: 20 },

  mealSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
  },
  mealSlotIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealSlotInfo: { flex: 1 },
  mealSlotType: { fontSize: 11, fontWeight: '700', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5 },
  mealSlotName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginTop: 2 },
  mealSlotEmpty: { fontSize: 13, color: Colors.textTertiary, marginTop: 2 },
  mealSlotCal: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },

  aiCard: {
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: Colors.primary[50],
    borderWidth: 1,
    borderColor: Colors.primary[100],
  },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  aiIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  aiSubtitle: { fontSize: 12, color: Colors.textTertiary },
  aiMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 21,
    marginBottom: 12,
  },
  aiAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  aiActionText: { fontSize: 13, fontWeight: '600', color: Colors.primary[500] },
});

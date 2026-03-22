import React, { useState } from 'react';
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
import { Colors } from '../../src/constants/colors';
import { useWorkoutProgram, useTodayWorkout } from '../../src/hooks/useWorkout';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { ExerciseCard } from '../../src/components/workout/ExerciseCard';
import { CardSkeleton } from '../../src/components/ui/LoadingSkeleton';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const todayDow = new Date().getDay();

const typeColors: Record<string, string> = {
  strength: Colors.primary[500],
  cardio: Colors.energy,
  rest: Colors.gray[300],
  'active-recovery': Colors.recovery,
  mobility: Colors.muscle,
};

export default function WorkoutScreen() {
  const { data: program, isLoading: isLoadingProgram, refetch: refetchProgram } = useWorkoutProgram();
  const { data: todayWorkout, isLoading: isLoadingToday, refetch: refetchToday } = useTodayWorkout();
  const [selectedDow, setSelectedDow] = useState(todayDow);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchProgram(), refetchToday()]);
    setRefreshing(false);
  };

  const selectedDay = program?.days.find((d) => d.dayOfWeek === selectedDow);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary[500]} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Program</Text>
          <TouchableOpacity style={styles.historyBtn}>
            <Ionicons name="time-outline" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Program info */}
        {isLoadingProgram ? (
          <CardSkeleton />
        ) : program ? (
          <Card elevated style={styles.programCard}>
            <View style={styles.programHeader}>
              <View style={styles.programBadge}>
                <Text style={styles.programBadgeText}>WEEK {program.currentWeek}/{program.durationWeeks}</Text>
              </View>
              <View style={styles.programProgress}>
                <View
                  style={[
                    styles.programProgressFill,
                    { width: `${(program.currentWeek / program.durationWeeks) * 100}%` },
                  ]}
                />
              </View>
            </View>
            <Text style={styles.programName}>{program.name}</Text>
            <Text style={styles.programDesc} numberOfLines={2}>{program.description}</Text>
          </Card>
        ) : null}

        {/* Day selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.dayScroll}
          contentContainerStyle={styles.dayScrollContent}
        >
          {DAY_LABELS.map((label, i) => {
            const day = program?.days.find((d) => d.dayOfWeek === i);
            const isToday = i === todayDow;
            const isSelected = i === selectedDow;
            const isRest = day?.type === 'rest' || !day;
            const dotColor = day ? typeColors[day.type] ?? Colors.primary[500] : Colors.gray[300];

            return (
              <TouchableOpacity
                key={label}
                style={[styles.dayBtn, isSelected && styles.dayBtnActive, isToday && !isSelected && styles.dayBtnToday]}
                onPress={() => setSelectedDow(i)}
              >
                <Text style={[styles.dayLabel, isSelected && styles.dayLabelActive]}>{label}</Text>
                <View style={[styles.dayDot, { backgroundColor: isSelected ? Colors.white : dotColor }]} />
                {day?.isCompleted && (
                  <Ionicons
                    name="checkmark"
                    size={10}
                    color={isSelected ? Colors.white : Colors.success}
                    style={{ marginTop: 2 }}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Selected day content */}
        {selectedDay ? (
          <View>
            <View style={styles.dayHeader}>
              <View>
                <View style={[styles.dayTypeBadge, { backgroundColor: (typeColors[selectedDay.type] ?? Colors.primary[500]) + '15' }]}>
                  <Text style={[styles.dayTypeText, { color: typeColors[selectedDay.type] ?? Colors.primary[500] }]}>
                    {selectedDay.type.replace('-', ' ').toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.dayName}>{selectedDay.name}</Text>
              </View>
              <View style={styles.dayMeta}>
                <Ionicons name="time-outline" size={14} color={Colors.textTertiary} />
                <Text style={styles.dayMetaText}>~{selectedDay.estimatedDuration} min</Text>
              </View>
            </View>

            {selectedDay.type === 'rest' ? (
              <Card style={styles.restCard}>
                <Ionicons name="leaf-outline" size={32} color={Colors.success} />
                <Text style={styles.restTitle}>Rest & Recover</Text>
                <Text style={styles.restSubtitle}>
                  Take today to rest. Light stretching or a walk is encouraged.
                </Text>
              </Card>
            ) : (
              <>
                {selectedDay.exercises.map((ex, i) => (
                  <ExerciseCard
                    key={ex.id}
                    exercise={ex}
                    isActive={false}
                  />
                ))}

                {selectedDow === todayDow && !selectedDay.isCompleted && (
                  <Button
                    title="Start Today's Workout"
                    onPress={() => router.push('/workout/active')}
                    icon={<Ionicons name="play-circle" size={20} color={Colors.white} />}
                    iconPosition="left"
                    style={{ marginTop: 8 }}
                  />
                )}

                {selectedDay.isCompleted && (
                  <View style={styles.completedBanner}>
                    <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
                    <Text style={styles.completedText}>Workout completed!</Text>
                  </View>
                )}
              </>
            )}
          </View>
        ) : (
          <Card style={styles.restCard}>
            <Ionicons name="bed-outline" size={32} color={Colors.textTertiary} />
            <Text style={styles.restTitle}>No workout scheduled</Text>
            <Text style={styles.restSubtitle}>Enjoy your rest day</Text>
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
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  historyBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  programCard: { marginBottom: 20, backgroundColor: Colors.primary[700] },
  programHeader: { marginBottom: 10 },
  programBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  programBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.white, letterSpacing: 0.5 },
  programProgress: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  programProgressFill: {
    height: 4,
    backgroundColor: Colors.white,
    borderRadius: 2,
  },
  programName: { fontSize: 20, fontWeight: '800', color: Colors.white, marginBottom: 4 },
  programDesc: { fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 20 },

  dayScroll: { marginHorizontal: -20, marginBottom: 20 },
  dayScrollContent: { paddingHorizontal: 20, gap: 8 },
  dayBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: Colors.white,
    minWidth: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  dayBtnActive: { backgroundColor: Colors.primary[500] },
  dayBtnToday: { borderWidth: 1.5, borderColor: Colors.primary[500] },
  dayLabel: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, marginBottom: 4 },
  dayLabelActive: { color: Colors.white },
  dayDot: { width: 6, height: 6, borderRadius: 3 },

  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  dayTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 6,
  },
  dayTypeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  dayName: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  dayMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  dayMetaText: { fontSize: 13, color: Colors.textTertiary },

  restCard: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  restTitle: { fontSize: 18, fontWeight: '700', color: Colors.textSecondary, marginTop: 4 },
  restSubtitle: { fontSize: 13, color: Colors.textTertiary, textAlign: 'center' },

  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.successLight,
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
  },
  completedText: { fontSize: 15, fontWeight: '700', color: Colors.success },
});

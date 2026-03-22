import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { WorkoutExercise, WorkoutSet } from '../../hooks/useWorkout';

interface ExerciseCardProps {
  exercise: WorkoutExercise;
  isActive?: boolean;
  onPress?: () => void;
  onLogSet?: (set: WorkoutSet) => void;
}

export function ExerciseCard({ exercise, isActive = false, onPress }: ExerciseCardProps) {
  const completedSets = exercise.sets.filter((s) => s.completed).length;
  const totalSets = exercise.sets.length;
  const allDone = completedSets === totalSets;

  return (
    <TouchableOpacity
      style={[styles.card, isActive && styles.activeCard, allDone && styles.doneCard]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Status indicator */}
      <View style={[styles.statusDot, allDone && styles.statusDotDone, isActive && styles.statusDotActive]} />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {exercise.exercise.name}
          </Text>
          {allDone && (
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
          )}
        </View>

        <View style={styles.muscleRow}>
          {exercise.exercise.muscleGroups.slice(0, 3).map((m) => (
            <View key={m} style={styles.muscleTag}>
              <Text style={styles.muscleText}>{m}</Text>
            </View>
          ))}
        </View>

        <View style={styles.setRow}>
          <Text style={styles.setInfo}>
            {totalSets} sets × {exercise.sets[0]?.targetReps ?? 0} reps
          </Text>
          {exercise.previousPerformance && (
            <Text style={styles.prevPerf}>
              Prev: {exercise.previousPerformance.weight} lb × {exercise.previousPerformance.reps}
            </Text>
          )}
        </View>

        {/* Sets progress */}
        <View style={styles.setsBar}>
          {exercise.sets.map((s, i) => (
            <View
              key={i}
              style={[
                styles.setBlock,
                s.completed && styles.setBlockDone,
                isActive && i === completedSets && styles.setBlockActive,
              ]}
            />
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  activeCard: {
    borderColor: Colors.primary[400],
    backgroundColor: Colors.primary[50],
  },
  doneCard: {
    borderColor: Colors.successLight,
    backgroundColor: '#F0FDF4',
    opacity: 0.9,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.gray[200],
    marginTop: 4,
    marginRight: 12,
  },
  statusDotActive: { backgroundColor: Colors.primary[500] },
  statusDotDone: { backgroundColor: Colors.success },
  content: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  muscleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 8 },
  muscleTag: {
    backgroundColor: Colors.primary[50],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  muscleText: { fontSize: 11, color: Colors.primary[600], fontWeight: '600' },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  setInfo: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  prevPerf: { fontSize: 12, color: Colors.textTertiary },
  setsBar: { flexDirection: 'row', gap: 4 },
  setBlock: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.gray[200],
  },
  setBlockDone: { backgroundColor: Colors.success },
  setBlockActive: { backgroundColor: Colors.primary[400] },
});

import React, { useState, useEffect, useRef } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../src/constants/colors';
import { useTodayWorkout, useWorkoutSession } from '../../src/hooks/useWorkout';
import { WorkoutExercise } from '../../src/hooks/useWorkout';
import { RestTimer } from '../../src/components/workout/RestTimer';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { Button } from '../../src/components/ui/Button';

export default function ActiveWorkoutScreen() {
  const { data: todayWorkout } = useTodayWorkout();
  const { startSession, logSet, completeSession, isLoggingSet, isCompleting } = useWorkoutSession();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [currentSetIdx, setCurrentSetIdx] = useState(0);
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [showRest, setShowRest] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const exercises: WorkoutExercise[] = todayWorkout?.exercises ?? [];
  const currentEx = exercises[currentExIdx];
  const currentSet = currentEx?.sets[currentSetIdx];
  const totalExercises = exercises.length;
  const completedExercises = exercises.filter((e) => e.sets.every((s) => s.completed)).length;
  const overallProgress = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

  // Elapsed timer
  useEffect(() => {
    intervalRef.current = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(intervalRef.current!);
  }, []);

  // Auto-populate with previous performance
  useEffect(() => {
    if (currentSet) {
      setReps(currentSet.targetReps.toString());
      setWeight(currentEx?.previousPerformance?.weight?.toString() ?? '');
    }
  }, [currentExIdx, currentSetIdx]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleCompleteSet = async () => {
    if (!currentEx || !currentSet) return;

    const actualWeight = parseFloat(weight) || 0;
    const actualReps = parseInt(reps) || 0;

    if (sessionId) {
      await logSet({
        sessionId,
        exerciseId: currentEx.id,
        setNumber: currentSet.setNumber,
        actualReps,
        actualWeight,
      });
    }

    const nextSetIdx = currentSetIdx + 1;
    if (nextSetIdx < currentEx.sets.length) {
      setCurrentSetIdx(nextSetIdx);
      setShowRest(true);
    } else {
      // Move to next exercise
      const nextExIdx = currentExIdx + 1;
      if (nextExIdx < exercises.length) {
        setCurrentExIdx(nextExIdx);
        setCurrentSetIdx(0);
        setShowRest(true);
      } else {
        // Workout complete
        handleFinish();
      }
    }
  };

  const handleFinish = async () => {
    Alert.alert(
      'Finish Workout',
      'Great job! Are you ready to finish?',
      [
        { text: 'Keep Going', style: 'cancel' },
        {
          text: 'Finish',
          onPress: async () => {
            if (sessionId) {
              await completeSession(sessionId);
            }
            router.replace('/workout/summary');
          },
        },
      ],
    );
  };

  const handleQuit = () => {
    Alert.alert(
      'Quit Workout',
      'Progress will not be saved. Are you sure?',
      [
        { text: 'Continue Workout', style: 'cancel' },
        { text: 'Quit', style: 'destructive', onPress: () => router.back() },
      ],
    );
  };

  if (!currentEx) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No workout available today</Text>
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleQuit} style={styles.quitBtn}>
          <Ionicons name="close" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.timerDisplay}>
          <Ionicons name="timer-outline" size={14} color={Colors.textTertiary} />
          <Text style={styles.timerText}>{formatTime(elapsedSeconds)}</Text>
        </View>

        <TouchableOpacity onPress={handleFinish} style={styles.finishBtn}>
          <Text style={styles.finishText}>Finish</Text>
        </TouchableOpacity>
      </View>

      {/* Overall Progress */}
      <View style={styles.progressSection}>
        <ProgressBar
          value={overallProgress}
          color={Colors.primary[500]}
          height={4}
        />
        <Text style={styles.progressLabel}>
          {completedExercises}/{totalExercises} exercises
        </Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Exercise Name */}
          <View style={styles.exerciseHeader}>
            <View style={styles.exerciseNumber}>
              <Text style={styles.exerciseNumberText}>{currentExIdx + 1}/{totalExercises}</Text>
            </View>
            <Text style={styles.exerciseName}>{currentEx.exercise.name}</Text>
            <View style={styles.muscleTagRow}>
              {currentEx.exercise.muscleGroups.map((m) => (
                <View key={m} style={styles.muscleTag}>
                  <Text style={styles.muscleTagText}>{m}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Set Counter */}
          <View style={styles.setSection}>
            <Text style={styles.setCounter}>
              Set {currentSetIdx + 1} of {currentEx.sets.length}
            </Text>
            <View style={styles.setDots}>
              {currentEx.sets.map((s, i) => (
                <View
                  key={i}
                  style={[
                    styles.setDot,
                    i < currentSetIdx && styles.setDotDone,
                    i === currentSetIdx && styles.setDotActive,
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Previous Performance */}
          {currentEx.previousPerformance && (
            <View style={styles.prevPerf}>
              <Ionicons name="time-outline" size={14} color={Colors.textTertiary} />
              <Text style={styles.prevPerfText}>
                Last time: {currentEx.previousPerformance.weight} lbs × {currentEx.previousPerformance.reps} reps
              </Text>
            </View>
          )}

          {/* Inputs */}
          <View style={styles.inputsRow}>
            <View style={styles.inputBlock}>
              <Text style={styles.inputLabel}>WEIGHT</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.bigInput}
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={Colors.gray[300]}
                  selectTextOnFocus
                />
                <Text style={styles.inputUnit}>lbs</Text>
              </View>
              <View style={styles.inputAdjust}>
                <TouchableOpacity
                  style={styles.adjBtn}
                  onPress={() => setWeight((w) => Math.max(0, parseFloat(w || '0') - 5).toString())}
                >
                  <Ionicons name="remove" size={16} color={Colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.adjBtn}
                  onPress={() => setWeight((w) => (parseFloat(w || '0') + 5).toString())}
                >
                  <Ionicons name="add" size={16} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputDivider} />

            <View style={styles.inputBlock}>
              <Text style={styles.inputLabel}>REPS</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.bigInput}
                  value={reps}
                  onChangeText={setReps}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={Colors.gray[300]}
                  selectTextOnFocus
                />
                <Text style={styles.inputUnit}>reps</Text>
              </View>
              <View style={styles.inputAdjust}>
                <TouchableOpacity
                  style={styles.adjBtn}
                  onPress={() => setReps((r) => Math.max(0, parseInt(r || '0') - 1).toString())}
                >
                  <Ionicons name="remove" size={16} color={Colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.adjBtn}
                  onPress={() => setReps((r) => (parseInt(r || '0') + 1).toString())}
                >
                  <Ionicons name="add" size={16} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Complete Set Button */}
          <Button
            title={`Complete Set ${currentSetIdx + 1}`}
            onPress={handleCompleteSet}
            loading={isLoggingSet}
            size="lg"
            style={styles.completeBtn}
            icon={<Ionicons name="checkmark" size={20} color={Colors.white} />}
            iconPosition="left"
          />

          {/* Skip exercise */}
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={() => {
              const nextExIdx = currentExIdx + 1;
              if (nextExIdx < exercises.length) {
                setCurrentExIdx(nextExIdx);
                setCurrentSetIdx(0);
              } else {
                handleFinish();
              }
            }}
          >
            <Text style={styles.skipText}>Skip Exercise</Text>
            <Ionicons name="play-skip-forward" size={14} color={Colors.textTertiary} />
          </TouchableOpacity>

          {/* Upcoming exercises */}
          {exercises.slice(currentExIdx + 1, currentExIdx + 3).length > 0 && (
            <View style={styles.upcomingSection}>
              <Text style={styles.upcomingTitle}>Up Next</Text>
              {exercises.slice(currentExIdx + 1, currentExIdx + 3).map((ex, i) => (
                <View key={ex.id} style={styles.upcomingRow}>
                  <View style={styles.upcomingNum}>
                    <Text style={styles.upcomingNumText}>{currentExIdx + 2 + i}</Text>
                  </View>
                  <Text style={styles.upcomingName}>{ex.exercise.name}</Text>
                  <Text style={styles.upcomingMeta}>
                    {ex.sets.length}×{ex.sets[0]?.targetReps}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Rest Timer Modal */}
      <Modal
        visible={showRest}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRest(false)}
      >
        <View style={styles.restOverlay}>
          <View style={styles.restSheet}>
            <Text style={styles.restHeader}>Set Complete!</Text>
            <RestTimer
              seconds={currentEx?.restSeconds ?? 90}
              onComplete={() => setShowRest(false)}
              onSkip={() => setShowRest(false)}
              autoStart
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  quitBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  timerDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timerText: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, fontVariant: ['tabular-nums'] },
  finishBtn: {
    backgroundColor: Colors.primary[500],
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  finishText: { fontSize: 14, fontWeight: '700', color: Colors.white },

  progressSection: { paddingHorizontal: 20, marginBottom: 8 },
  progressLabel: { fontSize: 11, color: Colors.textTertiary, marginTop: 4, textAlign: 'right' },

  scroll: { padding: 20 },

  exerciseHeader: { marginBottom: 24 },
  exerciseNumber: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary[50],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 10,
  },
  exerciseNumberText: { fontSize: 12, fontWeight: '700', color: Colors.primary[500] },
  exerciseName: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  muscleTagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  muscleTag: {
    backgroundColor: Colors.gray[100],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  muscleTagText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },

  setSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  setCounter: { fontSize: 16, fontWeight: '700', color: Colors.textSecondary },
  setDots: { flexDirection: 'row', gap: 8 },
  setDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.gray[200] },
  setDotDone: { backgroundColor: Colors.success },
  setDotActive: { backgroundColor: Colors.primary[500], transform: [{ scale: 1.2 }] },

  prevPerf: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.gray[50],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 24,
  },
  prevPerfText: { fontSize: 13, color: Colors.textTertiary },

  inputsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  inputBlock: { flex: 1, alignItems: 'center' },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textTertiary,
    letterSpacing: 1,
    marginBottom: 8,
  },
  inputWrapper: { alignItems: 'center', marginBottom: 12 },
  bigInput: {
    fontSize: 56,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    minWidth: 80,
    letterSpacing: -2,
  },
  inputUnit: { fontSize: 13, color: Colors.textTertiary, fontWeight: '500', marginTop: -8 },
  inputAdjust: { flexDirection: 'row', gap: 8 },
  adjBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputDivider: { width: 1, backgroundColor: Colors.border, marginVertical: 8 },

  completeBtn: {
    backgroundColor: Colors.primary[500],
    marginBottom: 16,
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    marginBottom: 24,
  },
  skipText: { fontSize: 14, color: Colors.textTertiary, fontWeight: '500' },

  upcomingSection: { gap: 10 },
  upcomingTitle: { fontSize: 13, fontWeight: '700', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  upcomingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 12,
  },
  upcomingNum: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  upcomingNumText: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },
  upcomingName: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  upcomingMeta: { fontSize: 12, color: Colors.textTertiary },

  // Rest modal
  restOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  restSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 48,
  },
  restHeader: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  emptyText: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center' },
});

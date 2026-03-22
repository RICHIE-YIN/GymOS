import React, { useState } from 'react';
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation } from '@tanstack/react-query';
import { Colors } from '../../src/constants/colors';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { apiPost } from '../../src/lib/api';
import { useAppStore } from '../../src/lib/store';

const { width } = Dimensions.get('window');

const TOTAL_STEPS = 9;

// ── Step data ──────────────────────────────────────────────────────────────
const GOALS = [
  { id: 'fat_loss', label: 'Lose Fat', icon: 'flame-outline', desc: 'Burn calories, shed body fat' },
  { id: 'muscle_gain', label: 'Build Muscle', icon: 'barbell-outline', desc: 'Increase muscle mass and strength' },
  { id: 'maintain', label: 'Stay Healthy', icon: 'heart-outline', desc: 'Maintain current fitness level' },
  { id: 'endurance', label: 'Boost Endurance', icon: 'bicycle-outline', desc: 'Improve cardio and stamina' },
  { id: 'strength', label: 'Get Stronger', icon: 'trophy-outline', desc: 'Max strength and power gains' },
  { id: 'flexibility', label: 'Flexibility', icon: 'body-outline', desc: 'Mobility and injury prevention' },
];

const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Sedentary', desc: 'Little to no exercise', multiplier: '1.2x' },
  { id: 'lightly_active', label: 'Lightly Active', desc: '1-2 days/week', multiplier: '1.375x' },
  { id: 'moderately_active', label: 'Moderately Active', desc: '3-4 days/week', multiplier: '1.55x' },
  { id: 'very_active', label: 'Very Active', desc: '5-6 days/week', multiplier: '1.725x' },
  { id: 'extra_active', label: 'Athlete', desc: 'Twice daily training', multiplier: '1.9x' },
];

const EXPERIENCE_LEVELS = [
  { id: 'beginner', label: 'Beginner', desc: 'Less than 1 year', icon: 'star-outline' },
  { id: 'intermediate', label: 'Intermediate', desc: '1-3 years', icon: 'star-half-outline' },
  { id: 'advanced', label: 'Advanced', desc: '3+ years', icon: 'star' },
];

const EQUIPMENT = [
  { id: 'full_gym', label: 'Full Gym', icon: 'business-outline', desc: 'All equipment available' },
  { id: 'home_gym', label: 'Home Gym', icon: 'home-outline', desc: 'Basic weights & equipment' },
  { id: 'bodyweight', label: 'Bodyweight', icon: 'body-outline', desc: 'No equipment needed' },
  { id: 'resistance_bands', label: 'Bands', icon: 'git-pull-request-outline', desc: 'Resistance bands only' },
];

const DIETARY = [
  'No Restrictions', 'Vegetarian', 'Vegan', 'Gluten-Free',
  'Dairy-Free', 'Keto', 'Paleo', 'Halal', 'Kosher', 'Low Sodium',
];

const DAYS_OPTIONS = [3, 4, 5, 6];
const DURATION_OPTIONS = [30, 45, 60, 75, 90];

// ── Component ───────────────────────────────────────────────────────────────
export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const { user, setUser } = useAppStore();

  // Form state
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [birthYear, setBirthYear] = useState('1995');
  const [heightFt, setHeightFt] = useState('5');
  const [heightIn, setHeightIn] = useState('10');
  const [weight, setWeight] = useState('175');
  const [units, setUnits] = useState<'imperial' | 'metric'>('imperial');
  const [goal, setGoal] = useState('muscle_gain');
  const [activityLevel, setActivityLevel] = useState('moderately_active');
  const [experience, setExperience] = useState('intermediate');
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [duration, setDuration] = useState(60);
  const [equipment, setEquipment] = useState('full_gym');
  const [dietary, setDietary] = useState<string[]>([]);

  // Estimated macros (simplified TDEE)
  const estimatedCalories = 2400;
  const estimatedProtein = 180;
  const estimatedCarbs = 240;
  const estimatedFat = 75;

  const saveOnboarding = useMutation({
    mutationFn: () =>
      apiPost('/users/onboarding', {
        gender, birthYear, heightFt, heightIn, weight, units,
        goal, activityLevel, experience, daysPerWeek, duration, equipment, dietary,
      }),
    onSuccess: () => {
      if (user) setUser({ ...user, onboardingComplete: true });
      router.replace('/(tabs)/');
    },
  });

  const progress = (step / (TOTAL_STEPS - 1)) * 100;

  const next = () => {
    if (step < TOTAL_STEPS - 1) setStep((s) => s + 1);
    else saveOnboarding.mutate();
  };

  const back = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const toggleDietary = (item: string) => {
    setDietary((prev) =>
      prev.includes(item) ? prev.filter((d) => d !== item) : [...prev, item],
    );
  };

  const renderStep = () => {
    switch (step) {
      // ── Step 0: Basic Info ────────────────────────────────────────────
      case 0:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Tell us about yourself</Text>
            <Text style={styles.stepSubtitle}>We'll personalize everything for you</Text>

            <Text style={styles.fieldLabel}>Gender</Text>
            <View style={styles.segmentRow}>
              {(['male', 'female', 'other'] as const).map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.segment, gender === g && styles.segmentActive]}
                  onPress={() => setGender(g)}
                >
                  <Text style={[styles.segmentText, gender === g && styles.segmentTextActive]}>
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="Birth Year"
              placeholder="1995"
              keyboardType="numeric"
              value={birthYear}
              onChangeText={setBirthYear}
              hint={`Age: ${new Date().getFullYear() - parseInt(birthYear || '1995')} years old`}
            />
          </View>
        );

      // ── Step 1: Body Metrics ──────────────────────────────────────────
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Your body metrics</Text>
            <Text style={styles.stepSubtitle}>Used to calculate your calorie needs</Text>

            {/* Units toggle */}
            <View style={styles.unitsRow}>
              {(['imperial', 'metric'] as const).map((u) => (
                <TouchableOpacity
                  key={u}
                  style={[styles.unitBtn, units === u && styles.unitBtnActive]}
                  onPress={() => setUnits(u)}
                >
                  <Text style={[styles.unitText, units === u && styles.unitTextActive]}>
                    {u === 'imperial' ? 'Imperial (lbs, ft)' : 'Metric (kg, cm)'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {units === 'imperial' ? (
              <View style={styles.heightRow}>
                <Input
                  label="Height"
                  placeholder="5"
                  keyboardType="numeric"
                  value={heightFt}
                  onChangeText={setHeightFt}
                  containerStyle={{ flex: 1 }}
                  rightIcon={<Text style={styles.unit}>ft</Text>}
                />
                <View style={{ width: 12 }} />
                <Input
                  label=" "
                  placeholder="10"
                  keyboardType="numeric"
                  value={heightIn}
                  onChangeText={setHeightIn}
                  containerStyle={{ flex: 1 }}
                  rightIcon={<Text style={styles.unit}>in</Text>}
                />
              </View>
            ) : (
              <Input
                label="Height (cm)"
                placeholder="178"
                keyboardType="numeric"
                value={heightFt}
                onChangeText={setHeightFt}
                rightIcon={<Text style={styles.unit}>cm</Text>}
              />
            )}

            <Input
              label={`Weight (${units === 'imperial' ? 'lbs' : 'kg'})`}
              placeholder={units === 'imperial' ? '175' : '80'}
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
              rightIcon={<Text style={styles.unit}>{units === 'imperial' ? 'lbs' : 'kg'}</Text>}
            />
          </View>
        );

      // ── Step 2: Goal ─────────────────────────────────────────────────
      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>What's your primary goal?</Text>
            <Text style={styles.stepSubtitle}>We'll build your plan around this</Text>
            <View style={styles.goalGrid}>
              {GOALS.map((g) => (
                <TouchableOpacity
                  key={g.id}
                  style={[styles.goalCard, goal === g.id && styles.goalCardActive]}
                  onPress={() => setGoal(g.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.goalIcon, goal === g.id && styles.goalIconActive]}>
                    <Ionicons
                      name={g.icon as any}
                      size={24}
                      color={goal === g.id ? Colors.primary[500] : Colors.textSecondary}
                    />
                  </View>
                  <Text style={[styles.goalLabel, goal === g.id && styles.goalLabelActive]}>
                    {g.label}
                  </Text>
                  <Text style={styles.goalDesc}>{g.desc}</Text>
                  {goal === g.id && (
                    <View style={styles.goalCheck}>
                      <Ionicons name="checkmark-circle" size={18} color={Colors.primary[500]} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      // ── Step 3: Activity Level ────────────────────────────────────────
      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Activity level</Text>
            <Text style={styles.stepSubtitle}>Outside of planned workouts</Text>
            <View style={styles.listOptions}>
              {ACTIVITY_LEVELS.map((a) => (
                <TouchableOpacity
                  key={a.id}
                  style={[styles.listOption, activityLevel === a.id && styles.listOptionActive]}
                  onPress={() => setActivityLevel(a.id)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.listOptionTitle, activityLevel === a.id && styles.listOptionTitleActive]}>
                      {a.label}
                    </Text>
                    <Text style={styles.listOptionDesc}>{a.desc}</Text>
                  </View>
                  <View style={[styles.multiplierBadge, activityLevel === a.id && styles.multiplierBadgeActive]}>
                    <Text style={[styles.multiplierText, activityLevel === a.id && styles.multiplierTextActive]}>
                      {a.multiplier}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      // ── Step 4: Experience ────────────────────────────────────────────
      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Training experience</Text>
            <Text style={styles.stepSubtitle}>Helps us calibrate workout intensity</Text>
            <View style={styles.experienceOptions}>
              {EXPERIENCE_LEVELS.map((e) => (
                <TouchableOpacity
                  key={e.id}
                  style={[styles.expCard, experience === e.id && styles.expCardActive]}
                  onPress={() => setExperience(e.id)}
                >
                  <Ionicons
                    name={e.icon as any}
                    size={32}
                    color={experience === e.id ? Colors.primary[500] : Colors.gray[300]}
                  />
                  <Text style={[styles.expLabel, experience === e.id && styles.expLabelActive]}>
                    {e.label}
                  </Text>
                  <Text style={styles.expDesc}>{e.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      // ── Step 5: Schedule ──────────────────────────────────────────────
      case 5:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Your schedule</Text>
            <Text style={styles.stepSubtitle}>How often can you train?</Text>

            <Text style={styles.fieldLabel}>Days per week</Text>
            <View style={styles.chipRow}>
              {DAYS_OPTIONS.map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.chip, daysPerWeek === d && styles.chipActive]}
                  onPress={() => setDaysPerWeek(d)}
                >
                  <Text style={[styles.chipText, daysPerWeek === d && styles.chipTextActive]}>
                    {d} days
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.fieldLabel, { marginTop: 20 }]}>Workout duration</Text>
            <View style={styles.chipRow}>
              {DURATION_OPTIONS.map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.chip, duration === d && styles.chipActive]}
                  onPress={() => setDuration(d)}
                >
                  <Text style={[styles.chipText, duration === d && styles.chipTextActive]}>
                    {d} min
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      // ── Step 6: Equipment ─────────────────────────────────────────────
      case 6:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Available equipment</Text>
            <Text style={styles.stepSubtitle}>We'll tailor exercises to what you have</Text>
            <View style={styles.goalGrid}>
              {EQUIPMENT.map((eq) => (
                <TouchableOpacity
                  key={eq.id}
                  style={[styles.goalCard, equipment === eq.id && styles.goalCardActive]}
                  onPress={() => setEquipment(eq.id)}
                >
                  <View style={[styles.goalIcon, equipment === eq.id && styles.goalIconActive]}>
                    <Ionicons
                      name={eq.icon as any}
                      size={24}
                      color={equipment === eq.id ? Colors.primary[500] : Colors.textSecondary}
                    />
                  </View>
                  <Text style={[styles.goalLabel, equipment === eq.id && styles.goalLabelActive]}>
                    {eq.label}
                  </Text>
                  <Text style={styles.goalDesc}>{eq.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      // ── Step 7: Dietary ───────────────────────────────────────────────
      case 7:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Dietary preferences</Text>
            <Text style={styles.stepSubtitle}>Select all that apply</Text>
            <View style={styles.tagGrid}>
              {DIETARY.map((item) => {
                const active = dietary.includes(item);
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.tag, active && styles.tagActive]}
                    onPress={() => toggleDietary(item)}
                  >
                    <Text style={[styles.tagText, active && styles.tagTextActive]}>{item}</Text>
                    {active && (
                      <Ionicons name="checkmark" size={12} color={Colors.primary[500]} style={{ marginLeft: 4 }} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      // ── Step 8: Ready! ────────────────────────────────────────────────
      case 8:
        return (
          <View style={styles.stepContent}>
            <View style={styles.readyIcon}>
              <Ionicons name="rocket" size={48} color={Colors.primary[500]} />
            </View>
            <Text style={styles.readyTitle}>You're all set! 🎉</Text>
            <Text style={styles.readySubtitle}>
              Here's what we calculated based on your profile:
            </Text>

            <View style={styles.macrosCard}>
              <Text style={styles.macrosCardTitle}>Daily Targets</Text>
              <View style={styles.macroRow}>
                {[
                  { label: 'Calories', value: estimatedCalories, unit: 'kcal', color: Colors.calories },
                  { label: 'Protein', value: estimatedProtein, unit: 'g', color: Colors.protein },
                  { label: 'Carbs', value: estimatedCarbs, unit: 'g', color: Colors.carbs },
                  { label: 'Fat', value: estimatedFat, unit: 'g', color: Colors.fat },
                ].map((m) => (
                  <View key={m.label} style={styles.macroItem}>
                    <View style={[styles.macroCircle, { borderColor: m.color }]}>
                      <Text style={[styles.macroVal, { color: m.color }]}>{m.value}</Text>
                      <Text style={styles.macroUnit}>{m.unit}</Text>
                    </View>
                    <Text style={styles.macroLabel}>{m.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.summaryList}>
              {[
                { label: 'Goal', value: GOALS.find((g) => g.id === goal)?.label ?? goal },
                { label: 'Training', value: `${daysPerWeek} days/wk · ${duration} min` },
                { label: 'Experience', value: experience.charAt(0).toUpperCase() + experience.slice(1) },
              ].map((item) => (
                <View key={item.label} style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>{item.label}</Text>
                  <Text style={styles.summaryVal}>{item.value}</Text>
                </View>
              ))}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressOuter}>
        <View style={[styles.progressInner, { width: `${progress}%` }]} />
      </View>

      {/* Step counter */}
      <View style={styles.topBar}>
        {step > 0 ? (
          <TouchableOpacity style={styles.backBtn} onPress={back}>
            <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
        <Text style={styles.stepCounter}>{step + 1} / {TOTAL_STEPS}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderStep()}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom nav */}
      <View style={styles.bottomNav}>
        <Button
          title={step === TOTAL_STEPS - 1 ? 'Start My Journey' : 'Continue'}
          onPress={next}
          loading={saveOnboarding.isPending}
          icon={
            step < TOTAL_STEPS - 1 ? (
              <Ionicons name="arrow-forward" size={18} color={Colors.white} />
            ) : (
              <Ionicons name="rocket" size={18} color={Colors.white} />
            )
          }
          iconPosition="right"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  progressOuter: {
    height: 4,
    backgroundColor: Colors.gray[100],
  },
  progressInner: {
    height: 4,
    backgroundColor: Colors.primary[500],
    borderRadius: 2,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCounter: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textTertiary,
  },
  scroll: { flexGrow: 1, padding: 24 },
  stepContent: { flex: 1 },
  stepTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  stepSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 28,
  },

  // Gender
  fieldLabel: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginBottom: 10 },
  segmentRow: { flexDirection: 'row', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border, marginBottom: 20 },
  segment: { flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: Colors.gray[50] },
  segmentActive: { backgroundColor: Colors.primary[500] },
  segmentText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  segmentTextActive: { color: Colors.white },

  // Units
  unitsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  unitBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    backgroundColor: Colors.gray[50],
  },
  unitBtnActive: { borderColor: Colors.primary[500], backgroundColor: Colors.primary[50] },
  unitText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  unitTextActive: { color: Colors.primary[600] },
  heightRow: { flexDirection: 'row' },
  unit: { fontSize: 13, color: Colors.textTertiary, fontWeight: '600' },

  // Goals grid
  goalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  goalCard: {
    width: (width - 60) / 2,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 14,
    backgroundColor: Colors.gray[50],
    position: 'relative',
  },
  goalCardActive: { borderColor: Colors.primary[400], backgroundColor: Colors.primary[50] },
  goalIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  goalIconActive: { backgroundColor: Colors.primary[100] },
  goalLabel: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary, marginBottom: 4 },
  goalLabelActive: { color: Colors.primary[700] },
  goalDesc: { fontSize: 11, color: Colors.textTertiary, lineHeight: 16 },
  goalCheck: { position: 'absolute', top: 8, right: 8 },

  // List options
  listOptions: { gap: 10 },
  listOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.gray[50],
  },
  listOptionActive: { borderColor: Colors.primary[400], backgroundColor: Colors.primary[50] },
  listOptionTitle: { fontSize: 15, fontWeight: '700', color: Colors.textSecondary, marginBottom: 2 },
  listOptionTitleActive: { color: Colors.primary[700] },
  listOptionDesc: { fontSize: 12, color: Colors.textTertiary },
  multiplierBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: Colors.gray[200],
  },
  multiplierBadgeActive: { backgroundColor: Colors.primary[100] },
  multiplierText: { fontSize: 12, fontWeight: '700', color: Colors.textTertiary },
  multiplierTextActive: { color: Colors.primary[600] },

  // Experience
  experienceOptions: { flexDirection: 'row', gap: 12 },
  expCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.gray[50],
  },
  expCardActive: { borderColor: Colors.primary[400], backgroundColor: Colors.primary[50] },
  expLabel: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary, marginTop: 8 },
  expLabelActive: { color: Colors.primary[700] },
  expDesc: { fontSize: 11, color: Colors.textTertiary, marginTop: 4, textAlign: 'center' },

  // Schedule chips
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.gray[50],
  },
  chipActive: { borderColor: Colors.primary[500], backgroundColor: Colors.primary[500] },
  chipText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  chipTextActive: { color: Colors.white },

  // Tags
  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.gray[50],
  },
  tagActive: { borderColor: Colors.primary[400], backgroundColor: Colors.primary[50] },
  tagText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  tagTextActive: { color: Colors.primary[600] },

  // Ready step
  readyIcon: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    alignSelf: 'center',
  },
  readyTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  readySubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  macrosCard: {
    backgroundColor: Colors.gray[50],
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  macrosCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
    textAlign: 'center',
  },
  macroRow: { flexDirection: 'row', justifyContent: 'space-around' },
  macroItem: { alignItems: 'center', gap: 8 },
  macroCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  macroVal: { fontSize: 16, fontWeight: '800' },
  macroUnit: { fontSize: 9, color: Colors.textTertiary, fontWeight: '500' },
  macroLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  summaryList: { gap: 0 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  summaryLabel: { fontSize: 14, color: Colors.textSecondary },
  summaryVal: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },

  bottomNav: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 32 : 20,
    paddingTop: 12,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});

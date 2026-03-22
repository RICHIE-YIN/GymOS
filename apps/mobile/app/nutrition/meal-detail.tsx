import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../src/constants/colors';
import { useMealDetail } from '../../src/hooks/useMacros';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { MacroSummary } from '../../src/components/nutrition/MacroSummary';
import { CardSkeleton } from '../../src/components/ui/LoadingSkeleton';

export default function MealDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: meal, isLoading } = useMealDetail(id ?? '');
  const [showInstructions, setShowInstructions] = useState(false);

  const mealTypeColors: Record<string, string> = {
    breakfast: Colors.warning,
    lunch: Colors.energy,
    dinner: Colors.muscle,
    snack: Colors.recovery,
  };

  const accentColor = meal ? (mealTypeColors[meal.type] ?? Colors.primary[500]) : Colors.primary[500];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.scroll}>
          <CardSkeleton />
          <CardSkeleton />
        </View>
      </SafeAreaView>
    );
  }

  if (!meal) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.gray[300]} />
          <Text style={styles.notFoundText}>Meal not found</Text>
          <Button title="Go Back" onPress={() => router.back()} fullWidth={false} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={[styles.heroHeader, { backgroundColor: accentColor }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.heroContent}>
          <View style={styles.mealTypeBadge}>
            <Text style={styles.mealTypeText}>{meal.type.toUpperCase()}</Text>
          </View>
          <Text style={styles.mealName}>{meal.name}</Text>
          <View style={styles.timeMeta}>
            <View style={styles.timeItem}>
              <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.timeText}>Prep: {meal.prepTime} min</Text>
            </View>
            <View style={styles.timeDivider} />
            <View style={styles.timeItem}>
              <Ionicons name="flame-outline" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.timeText}>Cook: {meal.cookTime} min</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Macro Summary */}
        <Card style={styles.macroCard}>
          <Text style={styles.sectionTitle}>Nutrition Facts</Text>
          <MacroSummary
            consumed={meal.macros}
            targets={meal.macros}
            compact
          />
        </Card>

        {/* Ingredients */}
        <Card style={styles.ingredientsCard}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {meal.ingredients.map((ing, i) => (
            <View key={ing.id} style={styles.ingredientRow}>
              <View style={styles.ingredientBullet}>
                <Text style={styles.ingredientBulletText}>{i + 1}</Text>
              </View>
              <View style={styles.ingredientInfo}>
                <Text style={styles.ingredientName}>{ing.name}</Text>
                <Text style={styles.ingredientQty}>
                  {ing.quantity} {ing.unit} · {ing.macros.calories} kcal
                </Text>
              </View>
              <View style={styles.ingredientMacros}>
                <Text style={styles.ingredientMacroText}>
                  P{ing.macros.protein}·C{ing.macros.carbs}·F{ing.macros.fat}
                </Text>
              </View>
              {ing.substitutes && ing.substitutes.length > 0 && (
                <TouchableOpacity style={styles.subBtn}>
                  <Ionicons name="swap-horizontal" size={16} color={Colors.primary[400]} />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </Card>

        {/* Instructions */}
        {meal.instructions.length > 0 && (
          <Card style={styles.instructionsCard}>
            <TouchableOpacity
              style={styles.instructionsToggle}
              onPress={() => setShowInstructions((v) => !v)}
            >
              <Text style={styles.sectionTitle}>Instructions</Text>
              <Ionicons
                name={showInstructions ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
            {showInstructions && (
              <View style={styles.instructions}>
                {meal.instructions.map((step, i) => (
                  <View key={i} style={styles.instructionStep}>
                    <View style={styles.stepNumWrapper}>
                      <Text style={styles.stepNum}>{i + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>
            )}
          </Card>
        )}

        {/* Add to plan */}
        <View style={styles.actions}>
          <Button
            title="Add to Today's Plan"
            onPress={() => {
              // API call would go here
              router.back();
            }}
            icon={<Ionicons name="add-circle" size={18} color={Colors.white} />}
            iconPosition="left"
          />
          <Button
            title="Swap This Meal"
            variant="outline"
            onPress={() => {}}
            icon={<Ionicons name="swap-horizontal" size={18} color={Colors.primary[500]} />}
            iconPosition="left"
            style={{ marginTop: 10 }}
          />
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  heroHeader: {
    paddingTop: 12,
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  heroContent: {},
  mealTypeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  mealTypeText: { fontSize: 11, fontWeight: '700', color: Colors.white, letterSpacing: 0.5 },
  mealName: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  timeMeta: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  timeItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeText: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  timeDivider: { width: 1, height: 14, backgroundColor: 'rgba(255,255,255,0.3)' },

  scroll: { padding: 16, marginTop: -12 },

  macroCard: { marginBottom: 12 },
  ingredientsCard: { marginBottom: 12 },
  instructionsCard: { marginBottom: 12 },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 14 },

  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  ingredientBullet: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  ingredientBulletText: { fontSize: 12, fontWeight: '700', color: Colors.primary[500] },
  ingredientInfo: { flex: 1 },
  ingredientName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  ingredientQty: { fontSize: 12, color: Colors.textTertiary, marginTop: 2 },
  ingredientMacros: {
    backgroundColor: Colors.gray[50],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ingredientMacroText: { fontSize: 10, fontWeight: '600', color: Colors.textTertiary },
  subBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },

  instructionsToggle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  instructions: { gap: 14, marginTop: 4 },
  instructionStep: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  stepNumWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNum: { fontSize: 13, fontWeight: '700', color: Colors.white },
  stepText: { flex: 1, fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },

  actions: { marginTop: 8 },

  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 },
  notFoundText: { fontSize: 16, color: Colors.textSecondary },
});

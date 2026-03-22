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
import { format, addDays, subDays } from 'date-fns';
import { Colors } from '../../src/constants/colors';
import { useMacros } from '../../src/hooks/useMacros';
import { Card } from '../../src/components/ui/Card';
import { MacroRing } from '../../src/components/ui/MacroRing';
import { MacroSummary } from '../../src/components/nutrition/MacroSummary';
import { MealCard } from '../../src/components/nutrition/MealCard';
import { CardSkeleton } from '../../src/components/ui/LoadingSkeleton';

export default function NutritionScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { log, isLoadingLog, targets, mealPlan, refetch } = useMacros(selectedDate);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

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
          <Text style={styles.headerTitle}>Nutrition</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => {}}>
            <Ionicons name="add" size={22} color={Colors.primary[500]} />
          </TouchableOpacity>
        </View>

        {/* Date Selector */}
        <View style={styles.dateSelector}>
          <TouchableOpacity
            style={styles.dateArrow}
            onPress={() => setSelectedDate((d) => subDays(d, 1))}
          >
            <Ionicons name="chevron-back" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.dateCenter}>
            <Text style={styles.dateMain}>
              {isToday ? 'Today' : format(selectedDate, 'EEEE')}
            </Text>
            <Text style={styles.dateSub}>{format(selectedDate, 'MMMM d, yyyy')}</Text>
          </View>
          <TouchableOpacity
            style={[styles.dateArrow, isToday && styles.dateArrowDisabled]}
            onPress={() => {
              if (!isToday) setSelectedDate((d) => addDays(d, 1));
            }}
            disabled={isToday}
          >
            <Ionicons name="chevron-forward" size={20} color={isToday ? Colors.gray[300] : Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Macro Ring + Summary */}
        {isLoadingLog ? (
          <CardSkeleton />
        ) : log && targets ? (
          <>
            <Card elevated style={styles.ringCard}>
              <MacroRing
                calories={log.consumed.calories}
                caloriesTarget={targets.calories}
                protein={log.consumed.protein}
                proteinTarget={targets.protein}
                carbs={log.consumed.carbs}
                carbsTarget={targets.carbs}
                fat={log.consumed.fat}
                fatTarget={targets.fat}
                size={200}
              />
              {/* Legend */}
              <View style={styles.legend}>
                {[
                  { label: 'Cal', color: Colors.calories },
                  { label: 'Prot', color: Colors.protein },
                  { label: 'Carbs', color: Colors.carbs },
                  { label: 'Fat', color: Colors.fat },
                ].map((l) => (
                  <View key={l.label} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: l.color }]} />
                    <Text style={styles.legendLabel}>{l.label}</Text>
                  </View>
                ))}
              </View>
            </Card>

            <Card style={styles.summaryCard}>
              <MacroSummary consumed={log.consumed} targets={targets} />
            </Card>
          </>
        ) : (
          <Card style={styles.emptyCard}>
            <Ionicons name="nutrition-outline" size={36} color={Colors.gray[300]} />
            <Text style={styles.emptyTitle}>No data for this day</Text>
            <Text style={styles.emptySubtitle}>Log your meals to track macros</Text>
          </Card>
        )}

        {/* Meals */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Meals</Text>
          {isToday && (
            <TouchableOpacity style={styles.logFoodBtn}>
              <Ionicons name="add-circle" size={16} color={Colors.primary[500]} />
              <Text style={styles.logFoodText}>Log food</Text>
            </TouchableOpacity>
          )}
        </View>

        {mealPlan?.meals.map((meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            onPress={() => router.push({ pathname: '/nutrition/meal-detail', params: { id: meal.id } })}
            isLogged={log?.meals.some((m) => m.type === meal.type) ?? false}
            onAdd={() => {}}
          />
        ))}

        {!mealPlan?.meals.length && (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No meal plan for today</Text>
            <Text style={styles.emptySubtitle}>Your AI plan will appear here</Text>
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
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  dateArrow: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateArrowDisabled: { opacity: 0.4 },
  dateCenter: { alignItems: 'center' },
  dateMain: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  dateSub: { fontSize: 12, color: Colors.textTertiary, marginTop: 2 },

  ringCard: {
    marginBottom: 16,
    alignItems: 'center',
    paddingVertical: 20,
  },
  legend: { flexDirection: 'row', gap: 16, marginTop: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },

  summaryCard: { marginBottom: 20 },

  emptyCard: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
    marginBottom: 20,
  },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: Colors.textSecondary },
  emptySubtitle: { fontSize: 13, color: Colors.textTertiary },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  logFoodBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  logFoodText: { fontSize: 14, color: Colors.primary[500], fontWeight: '600' },
});

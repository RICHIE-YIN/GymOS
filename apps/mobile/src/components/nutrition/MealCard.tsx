import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { MealLog, PlannedMeal } from '../../hooks/useMacros';

type MealItem = MealLog | PlannedMeal;

interface MealCardProps {
  meal: MealItem;
  onPress?: () => void;
  onAdd?: () => void;
  isLogged?: boolean;
}

const mealTypeIcon: Record<string, keyof typeof Ionicons.glyphMap> = {
  breakfast: 'sunny-outline',
  lunch: 'partly-sunny-outline',
  dinner: 'moon-outline',
  snack: 'cafe-outline',
};

const mealTypeColor: Record<string, string> = {
  breakfast: '#F59E0B',
  lunch: '#F97316',
  dinner: '#8B5CF6',
  snack: '#06B6D4',
};

export function MealCard({ meal, onPress, onAdd, isLogged = false }: MealCardProps) {
  const macros = meal.macros;
  const iconName = mealTypeIcon[meal.type] ?? 'restaurant-outline';
  const accentColor = mealTypeColor[meal.type] ?? Colors.primary[500];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* Left accent bar */}
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />

      <View style={styles.iconWrapper}>
        <View style={[styles.iconBg, { backgroundColor: accentColor + '15' }]}>
          <Ionicons name={iconName} size={22} color={accentColor} />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.type}>{meal.type.toUpperCase()}</Text>
            <Text style={styles.name} numberOfLines={1}>{meal.name}</Text>
          </View>
          <View style={styles.caloriesBadge}>
            <Text style={styles.caloriesVal}>{macros.calories}</Text>
            <Text style={styles.caloriesUnit}>kcal</Text>
          </View>
        </View>

        <View style={styles.macroRow}>
          <MacroPill label="P" value={macros.protein} color={Colors.protein} />
          <MacroPill label="C" value={macros.carbs} color={Colors.carbs} />
          <MacroPill label="F" value={macros.fat} color={Colors.fat} />
        </View>
      </View>

      {!isLogged && onAdd && (
        <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
          <Ionicons name="add" size={22} color={Colors.white} />
        </TouchableOpacity>
      )}

      {isLogged && (
        <View style={styles.loggedBadge}>
          <Ionicons name="checkmark" size={16} color={Colors.success} />
        </View>
      )}
    </TouchableOpacity>
  );
}

function MacroPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={[styles.pill, { backgroundColor: color + '15' }]}>
      <Text style={[styles.pillLabel, { color }]}>{label}</Text>
      <Text style={[styles.pillVal, { color }]}>{value}g</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  accentBar: { width: 4, alignSelf: 'stretch' },
  iconWrapper: { padding: 12 },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1, paddingVertical: 14, paddingRight: 8 },
  row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  type: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textTertiary,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  name: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  caloriesBadge: { alignItems: 'flex-end' },
  caloriesVal: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  caloriesUnit: { fontSize: 10, color: Colors.textSecondary },
  macroRow: { flexDirection: 'row', gap: 6 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  pillLabel: { fontSize: 11, fontWeight: '700' },
  pillVal: { fontSize: 11, fontWeight: '600' },
  addBtn: {
    backgroundColor: Colors.primary[500],
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  loggedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
});

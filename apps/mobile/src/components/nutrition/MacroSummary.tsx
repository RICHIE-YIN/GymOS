import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/colors';
import { MacroTargets } from '../../hooks/useMacros';
import { ProgressBar } from '../ui/ProgressBar';

interface MacroSummaryProps {
  consumed: MacroTargets;
  targets: MacroTargets;
  compact?: boolean;
}

interface MacroRowProps {
  label: string;
  consumed: number;
  target: number;
  color: string;
  unit?: string;
}

function MacroRow({ label, consumed, target, color, unit = 'g' }: MacroRowProps) {
  const pct = Math.min((consumed / (target || 1)) * 100, 100);
  return (
    <View style={styles.macroRow}>
      <View style={styles.macroLabelRow}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={styles.macroLabel}>{label}</Text>
        <Text style={styles.macroVal}>
          <Text style={styles.macroConsumed}>{consumed}</Text>
          <Text style={styles.macroTarget}>/{target}{unit}</Text>
        </Text>
      </View>
      <ProgressBar value={pct} color={color} height={6} />
    </View>
  );
}

export function MacroSummary({ consumed, targets, compact = false }: MacroSummaryProps) {
  const caloriesPct = Math.min((consumed.calories / (targets.calories || 1)) * 100, 100);

  return (
    <View style={styles.container}>
      {/* Calorie headline */}
      <View style={styles.calorieRow}>
        <View>
          <Text style={styles.calorieLabel}>Calories</Text>
          <View style={styles.calorieNumbers}>
            <Text style={styles.calorieConsumed}>{consumed.calories}</Text>
            <Text style={styles.calorieOf}> / {targets.calories} kcal</Text>
          </View>
        </View>
        <View style={[styles.caloriePct, caloriesPct >= 100 && styles.caloriePctFull]}>
          <Text style={[styles.caloriePctText, caloriesPct >= 100 && styles.caloriePctTextFull]}>
            {Math.round(caloriesPct)}%
          </Text>
        </View>
      </View>

      {!compact && (
        <ProgressBar
          value={caloriesPct}
          color={Colors.calories}
          height={8}
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Macro breakdown */}
      <View style={compact ? styles.compactGrid : styles.macroGrid}>
        <MacroRow
          label="Protein"
          consumed={consumed.protein}
          target={targets.protein}
          color={Colors.protein}
        />
        <MacroRow
          label="Carbs"
          consumed={consumed.carbs}
          target={targets.carbs}
          color={Colors.carbs}
        />
        <MacroRow
          label="Fat"
          consumed={consumed.fat}
          target={targets.fat}
          color={Colors.fat}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  calorieRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  calorieLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  calorieNumbers: { flexDirection: 'row', alignItems: 'baseline' },
  calorieConsumed: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary },
  calorieOf: { fontSize: 13, color: Colors.textTertiary },
  caloriePct: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.calories + '15',
  },
  caloriePctFull: { backgroundColor: Colors.warningLight },
  caloriePctText: { fontSize: 14, fontWeight: '700', color: Colors.calories },
  caloriePctTextFull: { color: Colors.warning },
  macroGrid: { gap: 12 },
  compactGrid: { gap: 8 },
  macroRow: { gap: 6 },
  macroLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  macroLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  macroVal: {},
  macroConsumed: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  macroTarget: { fontSize: 12, color: Colors.textTertiary },
});

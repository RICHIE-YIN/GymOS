import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { Colors } from '../../constants/colors';

interface MacroRingProps {
  calories: number;
  caloriesTarget: number;
  protein: number;
  proteinTarget: number;
  carbs: number;
  carbsTarget: number;
  fat: number;
  fatTarget: number;
  size?: number;
}

interface RingData {
  value: number;
  target: number;
  color: string;
  strokeWidth: number;
  radius: number;
}

function Ring({ value, target, color, strokeWidth, radius, cx, cy }: RingData & { cx: number; cy: number }) {
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / (target || 1), 1);
  const dashOffset = circumference * (1 - pct);

  return (
    <G>
      {/* Track */}
      <Circle
        cx={cx}
        cy={cy}
        r={radius}
        stroke={color + '20'}
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Progress */}
      <Circle
        cx={cx}
        cy={cy}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        rotation="-90"
        originX={cx}
        originY={cy}
      />
    </G>
  );
}

export function MacroRing({
  calories,
  caloriesTarget,
  protein,
  proteinTarget,
  carbs,
  carbsTarget,
  fat,
  fatTarget,
  size = 200,
}: MacroRingProps) {
  const center = size / 2;
  const gap = 10;
  const outerWidth = 12;
  const midWidth = 10;
  const innerWidth = 8;

  const rings: (RingData & { cx: number; cy: number })[] = [
    {
      value: calories,
      target: caloriesTarget,
      color: Colors.calories,
      strokeWidth: outerWidth,
      radius: center - outerWidth / 2,
      cx: center,
      cy: center,
    },
    {
      value: protein,
      target: proteinTarget,
      color: Colors.protein,
      strokeWidth: midWidth,
      radius: center - outerWidth - gap - midWidth / 2,
      cx: center,
      cy: center,
    },
    {
      value: carbs,
      target: carbsTarget,
      color: Colors.carbs,
      strokeWidth: innerWidth,
      radius: center - outerWidth - gap - midWidth - gap - innerWidth / 2,
      cx: center,
      cy: center,
    },
    {
      value: fat,
      target: fatTarget,
      color: Colors.fat,
      strokeWidth: innerWidth - 2,
      radius: center - outerWidth - gap - midWidth - gap - innerWidth - gap - (innerWidth - 2) / 2,
      cx: center,
      cy: center,
    },
  ];

  const remaining = Math.max(caloriesTarget - calories, 0);
  const pct = Math.round(Math.min((calories / (caloriesTarget || 1)) * 100, 100));

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {rings.map((ring, i) => (
          <Ring key={i} {...ring} />
        ))}
      </Svg>
      {/* Center labels */}
      <View style={[styles.center, { width: size, height: size }]}>
        <Text style={styles.remainLabel}>{remaining}</Text>
        <Text style={styles.remainText}>kcal left</Text>
        <Text style={styles.pctText}>{pct}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative', alignSelf: 'center' },
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  remainLabel: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  remainText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  pctText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary[500],
    marginTop: 2,
  },
});

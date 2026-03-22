import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';

interface ProgressBarProps {
  value: number;         // 0-100
  color?: string;
  trackColor?: string;
  height?: number;
  showLabel?: boolean;
  label?: string;
  animationDuration?: number;
  style?: ViewStyle;
  rounded?: boolean;
}

export function ProgressBar({
  value,
  color = Colors.primary[500],
  trackColor = Colors.gray[100],
  height = 8,
  showLabel = false,
  label,
  animationDuration = 600,
  style,
  rounded = true,
}: ProgressBarProps) {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: Math.min(Math.max(value, 0), 100),
      duration: animationDuration,
      useNativeDriver: false,
    }).start();
  }, [value, animationDuration]);

  const widthInterpolated = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={style}>
      {(showLabel || label) && (
        <View style={styles.labelRow}>
          {label && <Text style={styles.label}>{label}</Text>}
          {showLabel && <Text style={styles.value}>{Math.round(value)}%</Text>}
        </View>
      )}
      <View
        style={[
          styles.track,
          { backgroundColor: trackColor, height, borderRadius: rounded ? height / 2 : 2 },
        ]}
      >
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: color,
              height,
              width: widthInterpolated,
              borderRadius: rounded ? height / 2 : 2,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  value: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});

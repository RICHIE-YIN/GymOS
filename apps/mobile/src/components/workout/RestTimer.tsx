import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

interface RestTimerProps {
  seconds: number;      // total rest time
  onComplete?: () => void;
  onSkip?: () => void;
  autoStart?: boolean;
}

export function RestTimer({ seconds, onComplete, onSkip, autoStart = true }: RestTimerProps) {
  const [remaining, setRemaining] = useState(seconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animatedArc = useRef(new Animated.Value(1)).current;

  const SIZE = 180;
  const STROKE = 10;
  const RADIUS = (SIZE - STROKE) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  const progress = remaining / seconds;

  const start = useCallback(() => {
    setIsRunning(true);
    Animated.timing(animatedArc, {
      toValue: 0,
      duration: remaining * 1000,
      useNativeDriver: false,
    }).start();
  }, [remaining]);

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(intervalRef.current!);
          setIsRunning(false);
          onComplete?.();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [isRunning]);

  useEffect(() => {
    if (autoStart) start();
  }, []);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  const dashOffset = CIRCUMFERENCE * (1 - progress);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rest Time</Text>

      <View style={styles.ringContainer}>
        <Svg width={SIZE} height={SIZE}>
          {/* Track */}
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={Colors.primary[100]}
            strokeWidth={STROKE}
            fill="none"
          />
          {/* Progress */}
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={Colors.primary[500]}
            strokeWidth={STROKE}
            fill="none"
            strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            rotation="-90"
            originX={SIZE / 2}
            originY={SIZE / 2}
          />
        </Svg>
        <View style={[styles.centerLabel, { width: SIZE, height: SIZE }]}>
          <Text style={styles.time}>
            {mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`}
          </Text>
          <Text style={styles.of}>of {seconds}s</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.skipBtn} onPress={onSkip}>
          <Ionicons name="play-skip-forward" size={18} color={Colors.textSecondary} />
          <Text style={styles.skipText}>Skip Rest</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.pauseBtn}
          onPress={() => {
            if (isRunning) {
              clearInterval(intervalRef.current!);
              setIsRunning(false);
            } else {
              start();
            }
          }}
        >
          <Ionicons
            name={isRunning ? 'pause' : 'play'}
            size={20}
            color={Colors.white}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 20 },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ringContainer: { position: 'relative', marginBottom: 24 },
  centerLabel: {
    position: 'absolute',
    top: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  time: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  of: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: Colors.gray[100],
  },
  skipText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  pauseBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
});

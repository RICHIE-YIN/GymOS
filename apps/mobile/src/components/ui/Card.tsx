import React from 'react';
import { StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  elevated?: boolean;
  noPadding?: boolean;
  style?: ViewStyle;
}

export function Card({ children, elevated = false, noPadding = false, style, ...props }: CardProps) {
  return (
    <View
      style={[styles.card, elevated && styles.elevated, noPadding && styles.noPadding, style]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  elevated: {
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  noPadding: {
    padding: 0,
  },
});

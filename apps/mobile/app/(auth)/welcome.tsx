import React from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { Button } from '../../src/components/ui/Button';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Background gradient */}
      <LinearGradient
        colors={['#0F172A', '#1E3A8A', '#3B82F6']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
      />

      {/* Decorative circles */}
      <View style={[styles.circle, styles.circle1]} />
      <View style={[styles.circle, styles.circle2]} />
      <View style={[styles.circle, styles.circle3]} />

      {/* Content */}
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={styles.logoIcon}>
            <Ionicons name="flash" size={36} color={Colors.white} />
          </View>
          <Text style={styles.logoText}>GymOS</Text>
        </View>

        {/* Hero text */}
        <View style={styles.heroSection}>
          <Text style={styles.tagline}>Your AI Fitness</Text>
          <Text style={styles.taglineAccent}>Operating System</Text>
          <Text style={styles.subtitle}>
            Personalized workouts, nutrition tracking, and AI-powered coaching — all in one place.
          </Text>
        </View>

        {/* Feature pills */}
        <View style={styles.features}>
          {[
            { icon: 'barbell-outline', label: 'Smart Workouts' },
            { icon: 'nutrition-outline', label: 'Macro Tracking' },
            { icon: 'analytics-outline', label: 'Progress AI' },
          ].map((f) => (
            <View key={f.label} style={styles.featurePill}>
              <Ionicons name={f.icon as any} size={16} color={Colors.primary[300]} />
              <Text style={styles.featureLabel}>{f.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* CTA section */}
      <View style={styles.ctaSection}>
        <Button
          title="Get Started — It's Free"
          onPress={() => router.push('/(auth)/register')}
          style={styles.primaryBtn}
        />

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.loginLinkText}>
            Already have an account?{' '}
            <Text style={styles.loginLinkBold}>Sign In</Text>
          </Text>
        </TouchableOpacity>

        <Text style={styles.legalText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  circle: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  circle1: { width: 400, height: 400, top: -100, right: -150 },
  circle2: { width: 280, height: 280, top: 200, left: -120 },
  circle3: { width: 200, height: 200, bottom: 200, right: -60 },

  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 80,
    justifyContent: 'center',
  },

  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 48,
  },
  logoIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  logoText: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.5,
  },

  heroSection: { marginBottom: 36 },
  tagline: {
    fontSize: 44,
    fontWeight: '800',
    color: Colors.white,
    lineHeight: 52,
    letterSpacing: -1,
  },
  taglineAccent: {
    fontSize: 44,
    fontWeight: '800',
    color: Colors.primary[300],
    lineHeight: 52,
    letterSpacing: -1,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 24,
  },

  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  featureLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },

  ctaSection: {
    paddingHorizontal: 28,
    paddingBottom: 40,
    gap: 16,
  },
  primaryBtn: {
    backgroundColor: Colors.white,
    // override text color via children — handled by variant logic
  },
  loginLink: { alignSelf: 'center' },
  loginLinkText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
  },
  loginLinkBold: {
    color: Colors.white,
    fontWeight: '700',
  },
  legalText: {
    textAlign: 'center',
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    lineHeight: 16,
  },
});

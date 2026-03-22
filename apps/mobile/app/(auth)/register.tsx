import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../src/constants/colors';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { useAuth } from '../../src/hooks/useAuth';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    role: z.enum(['client', 'trainer']),
    terms: z.literal(true, { errorMap: () => ({ message: 'You must accept the terms' }) }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

const ROLES = [
  {
    id: 'client',
    label: 'I am a Client',
    description: 'Get personalized plans',
    icon: 'person-outline',
  },
  {
    id: 'trainer',
    label: 'I am a Trainer',
    description: 'Manage my clients',
    icon: 'people-outline',
  },
] as const;

export default function RegisterScreen() {
  const { register, isRegistering, registerError } = useAuth();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'client',
      terms: true,
    },
  });

  const selectedRole = watch('role');
  const termsAccepted = watch('terms');

  const onSubmit = async (data: RegisterForm) => {
    try {
      await register({ name: data.name, email: data.email, password: data.password, role: data.role });
    } catch {
      // handled by registerError
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>Join thousands transforming their fitness</Text>
          </View>

          {/* Role selection */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>I am a...</Text>
            <View style={styles.roleRow}>
              {ROLES.map((role) => {
                const active = selectedRole === role.id;
                return (
                  <TouchableOpacity
                    key={role.id}
                    style={[styles.roleCard, active && styles.roleCardActive]}
                    onPress={() => setValue('role', role.id)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={role.icon}
                      size={24}
                      color={active ? Colors.primary[500] : Colors.textTertiary}
                    />
                    <Text style={[styles.roleLabel, active && styles.roleLabelActive]}>
                      {role.label}
                    </Text>
                    <Text style={styles.roleDesc}>{role.description}</Text>
                    {active && (
                      <View style={styles.roleCheck}>
                        <Ionicons name="checkmark-circle" size={18} color={Colors.primary[500]} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Form fields */}
          <View style={styles.form}>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value, onBlur } }) => (
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  autoCapitalize="words"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
                  leftIcon={<Ionicons name="person-outline" size={18} color={Colors.textTertiary} />}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value, onBlur } }) => (
                <Input
                  label="Email Address"
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  leftIcon={<Ionicons name="mail-outline" size={18} color={Colors.textTertiary} />}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value, onBlur } }) => (
                <Input
                  label="Password"
                  placeholder="Min. 8 characters"
                  isPassword
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  hint="Use a mix of letters, numbers and symbols"
                  leftIcon={<Ionicons name="lock-closed-outline" size={18} color={Colors.textTertiary} />}
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value, onBlur } }) => (
                <Input
                  label="Confirm Password"
                  placeholder="Repeat your password"
                  isPassword
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.confirmPassword?.message}
                  leftIcon={<Ionicons name="lock-closed-outline" size={18} color={Colors.textTertiary} />}
                />
              )}
            />
          </View>

          {/* Terms */}
          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => setValue('terms', termsAccepted ? (false as any) : true)}
          >
            <View style={[styles.checkbox, termsAccepted && styles.checkboxActive]}>
              {termsAccepted && <Ionicons name="checkmark" size={14} color={Colors.white} />}
            </View>
            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>
          {errors.terms && (
            <Text style={styles.termsError}>{errors.terms.message}</Text>
          )}

          {/* API Error */}
          {registerError && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={16} color={Colors.error} />
              <Text style={styles.errorText}>
                {(registerError as { message?: string })?.message ?? 'Registration failed. Try again.'}
              </Text>
            </View>
          )}

          <Button
            title="Create Account"
            onPress={handleSubmit(onSubmit)}
            loading={isRegistering}
            style={{ marginTop: 16 }}
          />

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => router.replace('/(auth)/login')}
          >
            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.loginBold}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scroll: { flexGrow: 1, padding: 24, paddingBottom: 48 },
  back: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  header: { marginBottom: 24 },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 15, color: Colors.textSecondary },
  section: { marginBottom: 24 },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  roleRow: { flexDirection: 'row', gap: 12 },
  roleCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 14,
    backgroundColor: Colors.gray[50],
    position: 'relative',
  },
  roleCardActive: {
    borderColor: Colors.primary[400],
    backgroundColor: Colors.primary[50],
  },
  roleLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginTop: 8,
    marginBottom: 2,
  },
  roleLabelActive: { color: Colors.primary[700] },
  roleDesc: { fontSize: 11, color: Colors.textTertiary },
  roleCheck: { position: 'absolute', top: 8, right: 8 },
  form: {},
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 4,
    marginTop: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxActive: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  termsText: { flex: 1, fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  termsLink: { color: Colors.primary[500], fontWeight: '600' },
  termsError: { fontSize: 12, color: Colors.error, marginBottom: 12, marginLeft: 32 },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.errorLight,
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
  },
  errorText: { fontSize: 13, color: Colors.error, flex: 1 },
  loginLink: { alignSelf: 'center', marginTop: 20 },
  loginText: { fontSize: 15, color: Colors.textSecondary },
  loginBold: { color: Colors.primary[500], fontWeight: '700' },
});

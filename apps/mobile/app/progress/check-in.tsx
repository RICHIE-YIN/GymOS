import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Colors } from '../../src/constants/colors';
import { useProgress } from '../../src/hooks/useProgress';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';

const checkInSchema = z.object({
  weight: z.string().min(1, 'Weight is required').refine((v) => !isNaN(parseFloat(v)), 'Enter a valid number'),
  waist: z.string().optional(),
  chest: z.string().optional(),
  leftArm: z.string().optional(),
  rightArm: z.string().optional(),
  leftThigh: z.string().optional(),
  rightThigh: z.string().optional(),
  notes: z.string().optional(),
});

type CheckInForm = z.infer<typeof checkInSchema>;

interface MeasurementField {
  key: keyof CheckInForm;
  label: string;
  icon: string;
}

const MEASUREMENTS: MeasurementField[] = [
  { key: 'waist', label: 'Waist', icon: 'resize-outline' },
  { key: 'chest', label: 'Chest', icon: 'body-outline' },
  { key: 'leftArm', label: 'Left Arm', icon: 'fitness-outline' },
  { key: 'rightArm', label: 'Right Arm', icon: 'fitness-outline' },
  { key: 'leftThigh', label: 'Left Thigh', icon: 'walk-outline' },
  { key: 'rightThigh', label: 'Right Thigh', icon: 'walk-outline' },
];

export default function CheckInScreen() {
  const { submitCheckIn, isSubmitting } = useProgress();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [showMeasurements, setShowMeasurements] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckInForm>({
    resolver: zodResolver(checkInSchema),
    defaultValues: {
      weight: '',
      waist: '',
      chest: '',
      leftArm: '',
      rightArm: '',
      leftThigh: '',
      rightThigh: '',
      notes: '',
    },
  });

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const showPhotoOptions = () => {
    Alert.alert('Add Photo', 'Choose a method', [
      { text: 'Camera', onPress: takePhoto },
      { text: 'Photo Library', onPress: pickPhoto },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const onSubmit = async (data: CheckInForm) => {
    await submitCheckIn({
      date: format(new Date(), 'yyyy-MM-dd'),
      weight: parseFloat(data.weight),
      measurements: {
        waist: data.waist ? parseFloat(data.waist) : undefined,
        chest: data.chest ? parseFloat(data.chest) : undefined,
        leftArm: data.leftArm ? parseFloat(data.leftArm) : undefined,
        rightArm: data.rightArm ? parseFloat(data.rightArm) : undefined,
        leftThigh: data.leftThigh ? parseFloat(data.leftThigh) : undefined,
        rightThigh: data.rightThigh ? parseFloat(data.rightThigh) : undefined,
      },
      notes: data.notes,
      photoUrl: photoUri ?? undefined,
    });
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Weekly Check-In</Text>
              <Text style={styles.headerDate}>{format(new Date(), 'MMMM d, yyyy')}</Text>
            </View>
          </View>

          {/* Weight — primary field */}
          <Card elevated style={styles.weightCard}>
            <Text style={styles.weightCardTitle}>Body Weight</Text>
            <Controller
              control={control}
              name="weight"
              render={({ field: { onChange, value, onBlur } }) => (
                <Input
                  placeholder="0.0"
                  keyboardType="decimal-pad"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.weight?.message}
                  rightIcon={<Text style={styles.unitLabel}>lbs</Text>}
                  style={styles.weightInput}
                />
              )}
            />
            <Text style={styles.weightHint}>
              Weigh yourself first thing in the morning for consistency
            </Text>
          </Card>

          {/* Measurements section (collapsible) */}
          <Card style={styles.measureCard}>
            <TouchableOpacity
              style={styles.measureToggle}
              onPress={() => setShowMeasurements((v) => !v)}
            >
              <View style={styles.measureToggleLeft}>
                <View style={styles.measureIcon}>
                  <Ionicons name="resize-outline" size={18} color={Colors.primary[500]} />
                </View>
                <View>
                  <Text style={styles.measureTitle}>Body Measurements</Text>
                  <Text style={styles.measureSubtitle}>Optional</Text>
                </View>
              </View>
              <Ionicons
                name={showMeasurements ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>

            {showMeasurements && (
              <View style={styles.measureFields}>
                <View style={styles.measureGrid}>
                  {MEASUREMENTS.map((field) => (
                    <Controller
                      key={field.key}
                      control={control}
                      name={field.key}
                      render={({ field: { onChange, value, onBlur } }) => (
                        <Input
                          label={field.label}
                          placeholder="0.0"
                          keyboardType="decimal-pad"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          rightIcon={<Text style={styles.unitLabel}>in</Text>}
                          containerStyle={styles.measureInput}
                        />
                      )}
                    />
                  ))}
                </View>
              </View>
            )}
          </Card>

          {/* Notes */}
          <Card style={styles.notesCard}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, value, onBlur } }) => (
                <Input
                  placeholder="How are you feeling? Any observations..."
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={4}
                  style={{ height: 100, textAlignVertical: 'top', paddingTop: 12 }}
                />
              )}
            />
          </Card>

          {/* Photo upload */}
          <Card style={styles.photoCard}>
            <Text style={styles.sectionTitle}>Progress Photo</Text>
            <Text style={styles.photoSubtitle}>Optional — track your visual progress over time</Text>

            {photoUri ? (
              <View style={styles.photoPreviewWrapper}>
                <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                <TouchableOpacity
                  style={styles.photoRemoveBtn}
                  onPress={() => setPhotoUri(null)}
                >
                  <Ionicons name="close-circle" size={28} color={Colors.error} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.photoPlaceholder} onPress={showPhotoOptions}>
                <Ionicons name="camera-outline" size={32} color={Colors.textTertiary} />
                <Text style={styles.photoPlaceholderText}>Add a photo</Text>
                <Text style={styles.photoPlaceholderSub}>Tap to take or choose</Text>
              </TouchableOpacity>
            )}
          </Card>

          {/* Submit */}
          <Button
            title="Save Check-In"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            icon={<Ionicons name="checkmark-circle" size={18} color={Colors.white} />}
            iconPosition="left"
            style={{ marginTop: 8 }}
          />

          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 24 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  headerText: {},
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },
  headerDate: { fontSize: 13, color: Colors.textTertiary, marginTop: 2 },

  weightCard: { marginBottom: 12 },
  weightCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  weightInput: { fontSize: 24, fontWeight: '700' },
  weightHint: { fontSize: 12, color: Colors.textTertiary, lineHeight: 18 },
  unitLabel: { fontSize: 14, fontWeight: '600', color: Colors.textTertiary },

  measureCard: { marginBottom: 12 },
  measureToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  measureToggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  measureIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  measureTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  measureSubtitle: { fontSize: 12, color: Colors.textTertiary, marginTop: 2 },
  measureFields: { marginTop: 16 },
  measureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 0 },
  measureInput: { width: '50%', paddingRight: 8 },

  notesCard: { marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 10 },

  photoCard: { marginBottom: 16 },
  photoSubtitle: { fontSize: 13, color: Colors.textTertiary, marginBottom: 14 },
  photoPreviewWrapper: { position: 'relative', alignSelf: 'center' },
  photoPreview: { width: 200, height: 266, borderRadius: 12 },
  photoRemoveBtn: { position: 'absolute', top: -10, right: -10 },
  photoPlaceholder: {
    height: 140,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.gray[50],
  },
  photoPlaceholderText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  photoPlaceholderSub: { fontSize: 12, color: Colors.textTertiary },
});

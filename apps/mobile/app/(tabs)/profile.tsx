import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../src/constants/colors';
import { useAuth } from '../../src/hooks/useAuth';
import { useProgress } from '../../src/hooks/useProgress';
import { Card } from '../../src/components/ui/Card';

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  chevron?: boolean;
  danger?: boolean;
  onPress?: () => void;
}

function SettingsRow({
  icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  badge,
  badgeColor,
  chevron = true,
  danger = false,
  onPress,
}: SettingsRowProps) {
  return (
    <TouchableOpacity style={styles.settingsRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.settingsIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View style={styles.settingsContent}>
        <Text style={[styles.settingsTitle, danger && styles.settingsDanger]}>{title}</Text>
        {subtitle && <Text style={styles.settingsSubtitle}>{subtitle}</Text>}
      </View>
      {badge && (
        <View style={[styles.badge, { backgroundColor: (badgeColor ?? Colors.primary[500]) + '15' }]}>
          <Text style={[styles.badgeText, { color: badgeColor ?? Colors.primary[500] }]}>{badge}</Text>
        </View>
      )}
      {chevron && (
        <Ionicons name="chevron-forward" size={16} color={Colors.gray[300]} style={{ marginLeft: 8 }} />
      )}
    </TouchableOpacity>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { summary } = useProgress();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout },
      ],
    );
  };

  const subscriptionColors = {
    free: Colors.textTertiary,
    pro: Colors.primary[500],
    elite: Colors.energy,
  };

  const subscriptionLabel = {
    free: 'Free',
    pro: 'Pro',
    elite: 'Elite',
  };

  const tierColor = subscriptionColors[user?.subscription ?? 'free'];
  const tierLabel = subscriptionLabel[user?.subscription ?? 'free'];
  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '?';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <Text style={styles.headerTitle}>Profile</Text>

        {/* Avatar Card */}
        <Card elevated style={styles.avatarCard}>
          {/* Avatar */}
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
            <TouchableOpacity style={styles.avatarEditBtn}>
              <Ionicons name="camera" size={14} color={Colors.white} />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>

          {/* Tier badge */}
          <View style={[styles.tierBadge, { backgroundColor: tierColor + '15' }]}>
            <Ionicons name="star" size={12} color={tierColor} />
            <Text style={[styles.tierText, { color: tierColor }]}>{tierLabel} Plan</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            {[
              { label: 'Weeks', value: summary?.weeksActive ?? 0 },
              { label: 'Workouts', value: summary?.workoutsCompleted ?? 0 },
              { label: 'Lbs Lost', value: Math.abs(summary?.weightChange ?? 0) },
            ].map((stat, i) => (
              <React.Fragment key={stat.label}>
                {i > 0 && <View style={styles.statDivider} />}
                <View style={styles.statItem}>
                  <Text style={styles.statVal}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </Card>

        {/* Subscription Upgrade (if free) */}
        {user?.subscription === 'free' && (
          <TouchableOpacity style={styles.upgradeCard} activeOpacity={0.85}>
            <View style={styles.upgradeLeft}>
              <Ionicons name="rocket" size={24} color={Colors.white} />
              <View>
                <Text style={styles.upgradeTitle}>Upgrade to Pro</Text>
                <Text style={styles.upgradeSubtitle}>Unlock AI coaching & more</Text>
              </View>
            </View>
            <View style={styles.upgradeArrow}>
              <Ionicons name="arrow-forward" size={18} color={Colors.white} />
            </View>
          </TouchableOpacity>
        )}

        {/* Account */}
        <SectionHeader title="Account" />
        <Card noPadding style={styles.settingsCard}>
          <SettingsRow
            icon="person-outline"
            iconBg={Colors.primary[50]}
            iconColor={Colors.primary[500]}
            title="Edit Profile"
            subtitle="Name, photo, personal info"
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="lock-closed-outline"
            iconBg={Colors.gray[100]}
            iconColor={Colors.textSecondary}
            title="Change Password"
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="mail-outline"
            iconBg={Colors.gray[100]}
            iconColor={Colors.textSecondary}
            title="Email & Notifications"
          />
        </Card>

        {/* Preferences */}
        <SectionHeader title="Preferences" />
        <Card noPadding style={styles.settingsCard}>
          <SettingsRow
            icon="barbell-outline"
            iconBg={Colors.primary[50]}
            iconColor={Colors.primary[500]}
            title="Units"
            subtitle="Imperial (lbs, ft)"
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="moon-outline"
            iconBg={Colors.gray[100]}
            iconColor={Colors.textSecondary}
            title="Appearance"
            subtitle="Light / Dark / System"
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="notifications-outline"
            iconBg={Colors.warning + '20'}
            iconColor={Colors.warning}
            title="Notifications"
          />
        </Card>

        {/* Subscription */}
        <SectionHeader title="Subscription" />
        <Card noPadding style={styles.settingsCard}>
          <SettingsRow
            icon="card-outline"
            iconBg={tierColor + '15'}
            iconColor={tierColor}
            title="Current Plan"
            badge={tierLabel}
            badgeColor={tierColor}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="receipt-outline"
            iconBg={Colors.gray[100]}
            iconColor={Colors.textSecondary}
            title="Billing History"
          />
        </Card>

        {/* AI Coach */}
        <SectionHeader title="AI Coach" />
        <Card noPadding style={styles.settingsCard}>
          <SettingsRow
            icon="sparkles-outline"
            iconBg={Colors.muscle + '15'}
            iconColor={Colors.muscle}
            title="AI Preferences"
            subtitle="Coaching style, goals"
            badge={user?.subscription === 'free' ? 'Pro' : undefined}
            badgeColor={Colors.primary[500]}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="chatbubble-ellipses-outline"
            iconBg={Colors.recovery + '15'}
            iconColor={Colors.recovery}
            title="Chat History"
            badge={user?.subscription === 'free' ? 'Pro' : undefined}
            badgeColor={Colors.primary[500]}
          />
        </Card>

        {/* Help */}
        <SectionHeader title="Help & Support" />
        <Card noPadding style={styles.settingsCard}>
          <SettingsRow
            icon="help-circle-outline"
            iconBg={Colors.gray[100]}
            iconColor={Colors.textSecondary}
            title="Help Center"
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="chatbubble-outline"
            iconBg={Colors.gray[100]}
            iconColor={Colors.textSecondary}
            title="Contact Support"
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="star-outline"
            iconBg={Colors.warning + '20'}
            iconColor={Colors.warning}
            title="Rate GymOS"
          />
        </Card>

        {/* Logout */}
        <Card noPadding style={[styles.settingsCard, { marginTop: 8 }]}>
          <SettingsRow
            icon="log-out-outline"
            iconBg={Colors.errorLight}
            iconColor={Colors.error}
            title="Sign Out"
            chevron={false}
            danger
            onPress={handleLogout}
          />
        </Card>

        <Text style={styles.versionText}>GymOS v1.0.0</Text>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5, marginBottom: 20 },

  avatarCard: { alignItems: 'center', paddingVertical: 24, marginBottom: 16 },
  avatarWrapper: { position: 'relative', marginBottom: 14 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: { fontSize: 28, fontWeight: '800', color: Colors.white },
  avatarEditBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.gray[700],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  userName: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4 },
  userEmail: { fontSize: 13, color: Colors.textTertiary, marginBottom: 12 },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 20,
  },
  tierText: { fontSize: 12, fontWeight: '700' },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
  },
  statDivider: { width: 1, height: 36, backgroundColor: Colors.border, marginHorizontal: 16 },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  statLabel: { fontSize: 11, color: Colors.textTertiary, marginTop: 2, fontWeight: '500' },

  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary[600],
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  upgradeLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  upgradeTitle: { fontSize: 15, fontWeight: '700', color: Colors.white },
  upgradeSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  upgradeArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 8,
  },
  settingsCard: { marginBottom: 8 },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  settingsIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsContent: { flex: 1 },
  settingsTitle: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  settingsDanger: { color: Colors.error },
  settingsSubtitle: { fontSize: 12, color: Colors.textTertiary, marginTop: 1 },
  divider: { height: 1, backgroundColor: Colors.border, marginLeft: 62 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },

  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 20,
  },
});

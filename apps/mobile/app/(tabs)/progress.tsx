import React, { useState } from 'react';
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { format } from 'date-fns';
import { Colors } from '../../src/constants/colors';
import { useProgress } from '../../src/hooks/useProgress';
import { Card } from '../../src/components/ui/Card';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { Button } from '../../src/components/ui/Button';
import { CardSkeleton } from '../../src/components/ui/LoadingSkeleton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 72;

export default function ProgressScreen() {
  const { summary, isLoadingSummary, checkIns } = useProgress();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Build weight chart data from check-ins (last 8)
  const recentCheckIns = [...(checkIns ?? [])].slice(-8);
  const weightLabels = recentCheckIns.map((ci) => format(new Date(ci.date), 'M/d'));
  const weightData = recentCheckIns.map((ci) => ci.weight);

  const hasWeightData = weightData.length >= 2;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary[500]} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Progress</Text>
          <Button
            title="Check In"
            size="sm"
            onPress={() => router.push('/progress/check-in')}
            fullWidth={false}
            icon={<Ionicons name="add" size={16} color={Colors.white} />}
            iconPosition="left"
          />
        </View>

        {/* Summary Stats */}
        {isLoadingSummary ? (
          <CardSkeleton />
        ) : summary ? (
          <View style={styles.statsGrid}>
            {[
              {
                label: 'Weeks Active',
                value: summary.weeksActive.toString(),
                icon: 'calendar-outline',
                color: Colors.primary[500],
                bg: Colors.primary[50],
              },
              {
                label: 'Workouts',
                value: summary.workoutsCompleted.toString(),
                icon: 'barbell-outline',
                color: Colors.energy,
                bg: Colors.energy + '15',
              },
              {
                label: 'Weight Change',
                value: `${summary.weightChange > 0 ? '+' : ''}${summary.weightChange} lbs`,
                icon: 'trending-down-outline',
                color: Colors.success,
                bg: Colors.successLight,
              },
              {
                label: 'Compliance',
                value: `${summary.compliancePercent}%`,
                icon: 'checkmark-circle-outline',
                color: Colors.muscle,
                bg: Colors.muscle + '15',
              },
            ].map((stat) => (
              <View key={stat.label} style={[styles.statCard, { backgroundColor: stat.bg }]}>
                <Ionicons name={stat.icon as any} size={20} color={stat.color} />
                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Weight Trend Chart */}
        <Card style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Weight Trend</Text>
            <Text style={styles.chartSubtitle}>Last {recentCheckIns.length} check-ins</Text>
          </View>
          {hasWeightData ? (
            <LineChart
              data={{
                labels: weightLabels,
                datasets: [{ data: weightData, color: () => Colors.primary[500], strokeWidth: 2.5 }],
              }}
              width={CHART_WIDTH}
              height={160}
              chartConfig={{
                backgroundColor: Colors.white,
                backgroundGradientFrom: Colors.white,
                backgroundGradientTo: Colors.white,
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                labelColor: () => Colors.textTertiary,
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: Colors.primary[500],
                  fill: Colors.white,
                },
              }}
              bezier
              style={styles.chart}
              withInnerLines={false}
              withOuterLines={false}
            />
          ) : (
            <View style={styles.emptyChart}>
              <Ionicons name="trending-up-outline" size={32} color={Colors.gray[300]} />
              <Text style={styles.emptyChartText}>Check in to see your weight trend</Text>
            </View>
          )}
        </Card>

        {/* Workout Compliance */}
        {summary && (
          <Card style={styles.complianceCard}>
            <Text style={styles.sectionTitle}>Workout Compliance</Text>
            <View style={styles.complianceRow}>
              <Text style={styles.complianceValue}>{summary.compliancePercent}%</Text>
              <Text style={styles.complianceSub}>of planned workouts completed</Text>
            </View>
            <ProgressBar
              value={summary.compliancePercent}
              color={
                summary.compliancePercent >= 80
                  ? Colors.success
                  : summary.compliancePercent >= 60
                  ? Colors.warning
                  : Colors.error
              }
              height={10}
            />
            <Text style={styles.complianceTip}>
              {summary.compliancePercent >= 80
                ? 'Excellent consistency! Keep it up.'
                : summary.compliancePercent >= 60
                ? 'Good effort. Try to hit 80%+ for best results.'
                : 'Consistency is key. Aim for at least 3 sessions/week.'}
            </Text>
          </Card>
        )}

        {/* Body Measurements */}
        {checkIns.length > 0 && checkIns[checkIns.length - 1].measurements && (
          <Card style={styles.measureCard}>
            <Text style={styles.sectionTitle}>Latest Measurements</Text>
            <Text style={styles.measureDate}>
              {format(new Date(checkIns[checkIns.length - 1].date), 'MMMM d, yyyy')}
            </Text>
            <View style={styles.measureGrid}>
              {Object.entries(checkIns[checkIns.length - 1].measurements ?? {}).map(
                ([key, value]) =>
                  value ? (
                    <View key={key} style={styles.measureItem}>
                      <Text style={styles.measureVal}>{value}"</Text>
                      <Text style={styles.measureKey}>
                        {key.replace(/([A-Z])/g, ' $1').replace('left', 'L ').replace('right', 'R ')}
                      </Text>
                    </View>
                  ) : null,
              )}
            </View>
          </Card>
        )}

        {/* Progress Photos */}
        <Card style={styles.photosCard}>
          <View style={styles.photosHeader}>
            <Text style={styles.sectionTitle}>Progress Photos</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.photosEmpty}>
            <Ionicons name="images-outline" size={36} color={Colors.gray[300]} />
            <Text style={styles.photosEmptyText}>Add photos during check-ins</Text>
            <Text style={styles.photosEmptySub}>Track your visual transformation</Text>
          </View>
        </Card>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  statCard: {
    width: (SCREEN_WIDTH - 52) / 2,
    borderRadius: 16,
    padding: 16,
    gap: 6,
  },
  statValue: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  statLabel: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },

  chartCard: { marginBottom: 16 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 },
  chartTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  chartSubtitle: { fontSize: 12, color: Colors.textTertiary },
  chart: { marginLeft: -16, borderRadius: 8 },
  emptyChart: { height: 120, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyChartText: { fontSize: 13, color: Colors.textTertiary },

  complianceCard: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  complianceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 10 },
  complianceValue: { fontSize: 32, fontWeight: '800', color: Colors.textPrimary },
  complianceSub: { fontSize: 13, color: Colors.textSecondary },
  complianceTip: { fontSize: 12, color: Colors.textTertiary, marginTop: 10, lineHeight: 18 },

  measureCard: { marginBottom: 16 },
  measureDate: { fontSize: 12, color: Colors.textTertiary, marginTop: -6, marginBottom: 14 },
  measureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  measureItem: { minWidth: 70, alignItems: 'center', backgroundColor: Colors.gray[50], padding: 12, borderRadius: 12 },
  measureVal: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  measureKey: { fontSize: 10, color: Colors.textTertiary, marginTop: 4, textAlign: 'center', textTransform: 'capitalize' },

  photosCard: { marginBottom: 16 },
  photosHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  seeAll: { fontSize: 14, color: Colors.primary[500], fontWeight: '600' },
  photosEmpty: { alignItems: 'center', paddingVertical: 24, gap: 6 },
  photosEmptyText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  photosEmptySub: { fontSize: 12, color: Colors.textTertiary },
});

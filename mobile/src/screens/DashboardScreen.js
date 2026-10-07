import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, Text, View, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api';
import { ErrorView } from '../components';
import { colors } from '../theme';

export default function DashboardScreen() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try { setStats(await api('/dashboard')); } catch (e) { setError(e.message); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  const refresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  if (error && !stats) return <ErrorView message={error} onRetry={load} />;
  if (!stats) return <ActivityIndicator style={{ marginTop: 60 }} size="large" color={colors.accent} />;

  const items = [
    ['Total projects', stats.totalProjects], ['Projects in progress', stats.projectsInProgress],
    ['Total tasks', stats.totalTasks], ['Completed tasks', stats.completedTasks], ['Pending tasks', stats.pendingTasks],
  ];
  const pct = (n) => (stats.totalTasks ? (n / stats.totalTasks) * 100 : 0);

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
      {!!error && <Text style={{ color: colors.danger, marginBottom: 10 }}>{error}</Text>}
      <View style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 10, marginBottom: 12 }}>
        <Text style={{ fontWeight: '700', fontSize: 16, color: colors.ink }}>{stats.completedTasks} of {stats.totalTasks} tasks done</Text>
        <View style={{ flexDirection: 'row', height: 14, borderRadius: 99, overflow: 'hidden', backgroundColor: colors.line, marginTop: 10 }}>
          <View style={{ width: `${pct(stats.completedTasks)}%`, backgroundColor: colors.done }} />
          <View style={{ width: `${pct(stats.inProgressTasks)}%`, backgroundColor: colors.doing }} />
          <View style={{ width: `${pct(stats.pendingTasks)}%`, backgroundColor: colors.todo }} />
        </View>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {items.map(([label, n]) => (
          <View key={label} style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 10, width: '47.5%' }}>
            <Text style={{ fontSize: 30, fontWeight: '800', color: colors.ink }}>{n}</Text>
            <Text style={{ color: colors.muted }}>{label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

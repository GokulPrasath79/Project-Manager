import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api';
import { Badge, Empty, ErrorView } from '../components';
import { colors } from '../theme';

export default function ProjectsScreen({ navigation }) {
  const [projects, setProjects] = useState(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try { setProjects((await api('/projects', { params: { limit: 100 } })).data); } catch (e) { setError(e.message); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  const refresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  if (error && !projects) return <ErrorView message={error} onRetry={load} />;
  if (!projects) return <ActivityIndicator style={{ marginTop: 60 }} size="large" color={colors.accent} />;

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16, gap: 10, flexGrow: 1 }}
      data={projects}
      keyExtractor={(p) => String(p.id)}
      refreshing={refreshing}
      onRefresh={refresh}
      ListHeaderComponent={error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
      ListEmptyComponent={<Empty title="No projects yet" hint="Create projects on the web app, then manage their tasks here." />}
      renderItem={({ item: p }) => (
        <Pressable onPress={() => navigation.navigate('ProjectDetail', { id: p.id, name: p.name })} style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
            <Text style={{ flex: 1, fontWeight: '700', fontSize: 16, color: colors.ink }}>{p.name}</Text>
            <Badge value={p.status} />
          </View>
          <View style={{ height: 5, backgroundColor: colors.line, borderRadius: 99, marginVertical: 12, overflow: 'hidden' }}>
            <View style={{ height: 5, backgroundColor: colors.done, width: `${p.taskCount ? (p.completedTaskCount / p.taskCount) * 100 : 0}%` }} />
          </View>
          <Text style={{ color: colors.muted }}>{p.completedTaskCount} of {p.taskCount} tasks done</Text>
        </Pressable>
      )}
    />
  );
}

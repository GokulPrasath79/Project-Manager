import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api';
import { Badge, ChipRow, Empty, ErrorView, fmtDate } from '../components';
import { colors, TASK_STATUSES, PRIORITIES } from '../theme';

export default function ProjectDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [tasks, setTasks] = useState(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      setTasks((await api('/tasks', { params: { projectId: id, q, status, priority, limit: 100 } })).data);
    } catch (e) { setError(e.message); }
  }, [id, q, status, priority]);

  // reload on focus (after returning from the form) and when filters change (search is debounced)
  useFocusEffect(useCallback(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]));
  const refresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => navigation.navigate('TaskForm', { projectId: id })} accessibilityLabel="New task">
          <Text style={{ color: colors.accent, fontWeight: '700', fontSize: 16 }}>+ Task</Text>
        </Pressable>
      ),
    });
  }, [navigation, id]);

  const complete = async (t) => {
    try { await api(`/tasks/${t.id}`, { method: 'PUT', body: { status: 'COMPLETED' } }); load(); } catch (e) { setError(e.message); }
  };
  const remove = (t) =>
    Alert.alert('Delete this task?', `"${t.name}" will be removed.`, [
      { text: 'Keep', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { try { await api(`/tasks/${t.id}`, { method: 'DELETE' }); load(); } catch (e) { setError(e.message); } } },
    ]);

  if (error && !tasks) return <ErrorView message={error} onRetry={load} />;
  const filtering = q || status || priority;

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16, gap: 10, flexGrow: 1 }}
      data={tasks || []}
      keyExtractor={(t) => String(t.id)}
      refreshing={refreshing}
      onRefresh={refresh}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View>
          <TextInput value={q} onChangeText={setQ} placeholder="Search tasks by name" placeholderTextColor={colors.muted} clearButtonMode="while-editing"
            style={{ borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, borderRadius: 8, padding: 10, marginBottom: 10, color: colors.ink }} />
          <ChipRow options={TASK_STATUSES} value={status} onChange={setStatus} allLabel="Any status" />
          <ChipRow options={PRIORITIES} value={priority} onChange={setPriority} allLabel="Any priority" />
          {!!error && <Text style={{ color: colors.danger, marginTop: 4 }}>{error}</Text>}
        </View>
      }
      ListEmptyComponent={!tasks ? <ActivityIndicator style={{ marginTop: 40 }} color={colors.accent} /> : <Empty title={filtering ? 'No tasks match' : 'No tasks yet'} hint={filtering ? 'Clear a filter to see more.' : 'Tap + Task to add one.'} />}
      renderItem={({ item: t }) => (
        <Pressable onPress={() => navigation.navigate('TaskForm', { projectId: id, task: t })} onLongPress={() => remove(t)} style={{ backgroundColor: colors.surface, padding: 14, borderRadius: 10 }}>
          <Text style={{ fontWeight: '700', fontSize: 16, color: t.status === 'COMPLETED' ? colors.muted : colors.ink, textDecorationLine: t.status === 'COMPLETED' ? 'line-through' : 'none' }}>{t.name}</Text>
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <Badge value={t.status} /><Badge value={t.priority} />
            {!!t.dueDate && <Text style={{ color: colors.muted, fontSize: 12 }}>Due {fmtDate(t.dueDate)}</Text>}
          </View>
          <View style={{ flexDirection: 'row', gap: 18, marginTop: 10 }}>
            {t.status !== 'COMPLETED' && <Pressable onPress={() => complete(t)}><Text style={{ color: colors.done, fontWeight: '700' }}>Mark done</Text></Pressable>}
            <Pressable onPress={() => remove(t)}><Text style={{ color: colors.danger, fontWeight: '700' }}>Delete</Text></Pressable>
          </View>
        </Pressable>
      )}
    />
  );
}

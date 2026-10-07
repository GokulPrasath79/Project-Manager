import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text } from 'react-native';
import { api, fieldErrors } from '../api';
import { Button, ChipRow, Input } from '../components';
import { colors, TASK_STATUSES, PRIORITIES } from '../theme';

export default function TaskFormScreen({ route, navigation }) {
  const { projectId, task } = route.params;
  const [form, setForm] = useState({
    name: task?.name || '',
    description: task?.description || '',
    priority: task?.priority || 'MEDIUM',
    status: task?.status || 'PENDING',
    dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : '',
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (k) => (v) => setForm({ ...form, [k]: v });

  const save = async () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Enter a task name';
    if (form.dueDate && (!/^\d{4}-\d{2}-\d{2}$/.test(form.dueDate) || Number.isNaN(Date.parse(form.dueDate)))) errs.dueDate = 'Use the format YYYY-MM-DD';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    setFormError('');
    const body = { ...form, name: form.name.trim(), dueDate: form.dueDate || null };
    if (!task) body.projectId = projectId;
    try {
      await api(task ? `/tasks/${task.id}` : '/tasks', { method: task ? 'PUT' : 'POST', body });
      navigation.goBack();
    } catch (e) {
      setErrors(fieldErrors(e));
      setFormError(e.message);
      setSaving(false);
    }
  };

  const label = { fontWeight: '600', color: colors.ink, marginBottom: 6 };
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        <Input label="Name" value={form.name} onChangeText={set('name')} error={errors.name} maxLength={160} />
        <Input label="Description" value={form.description} onChangeText={set('description')} error={errors.description} multiline />
        <Text style={label}>Priority</Text>
        <ChipRow options={PRIORITIES} value={form.priority} onChange={(v) => v && set('priority')(v)} allLabel="" />
        <Text style={[label, { marginTop: 8 }]}>Status</Text>
        <ChipRow options={TASK_STATUSES} value={form.status} onChange={(v) => v && set('status')(v)} allLabel="" />
        <Input label="Due date (YYYY-MM-DD)" value={form.dueDate} onChangeText={set('dueDate')} error={errors.dueDate} placeholder="2026-12-31" keyboardType="numbers-and-punctuation" />
        {!!formError && <Text style={{ color: colors.danger, marginBottom: 12 }}>{formError}</Text>}
        <Button title="Save task" onPress={save} loading={saving} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

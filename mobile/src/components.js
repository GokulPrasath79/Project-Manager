import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, LABELS } from './theme';

export const Button = ({ title, onPress, kind = 'primary', loading, disabled, style }) => (
  <Pressable
    onPress={onPress}
    disabled={loading || disabled}
    accessibilityRole="button"
    style={[s.btn, kind === 'primary' && s.btnPrimary, kind === 'danger' && s.btnDanger, (loading || disabled) && { opacity: 0.6 }, style]}
  >
    {loading ? <ActivityIndicator color={kind === 'ghost' ? colors.ink : '#fff'} /> : (
      <Text style={[s.btnText, kind === 'ghost' && { color: colors.ink }]}>{title}</Text>
    )}
  </Pressable>
);

export const Input = ({ label, error, ...props }) => (
  <View style={{ marginBottom: 14 }}>
    <Text style={s.label}>{label}</Text>
    <TextInput {...props} style={[s.input, error && { borderColor: colors.danger }, props.multiline && { minHeight: 80, textAlignVertical: 'top' }]} placeholderTextColor={colors.muted} />
    {!!error && <Text style={s.error}>{error}</Text>}
  </View>
);

export const Chip = ({ label, active, onPress }) => (
  <Pressable onPress={onPress} style={[s.chip, active && s.chipActive]} accessibilityState={{ selected: active }}>
    <Text style={[s.chipText, active && { color: '#fff' }]}>{label}</Text>
  </Pressable>
);

export const ChipRow = ({ options, value, onChange, allLabel = 'All' }) => (
  <View style={s.chipRow}>
    <Chip label={allLabel} active={!value} onPress={() => onChange('')} />
    {options.map((o) => <Chip key={o} label={LABELS[o]} active={value === o} onPress={() => onChange(value === o ? '' : o)} />)}
  </View>
);

export const Badge = ({ value }) => {
  const c = { COMPLETED: colors.done, IN_PROGRESS: colors.doing, HIGH: colors.danger }[value] || colors.todo;
  return <Text style={[s.badge, { color: c, borderColor: c }]}>{LABELS[value]}</Text>;
};

export const ErrorView = ({ message, onRetry }) => (
  <View style={s.errorView}>
    <Text style={{ color: colors.danger, textAlign: 'center', marginBottom: 12 }}>{message}</Text>
    {onRetry && <Button title="Try again" onPress={onRetry} kind="ghost" style={{ alignSelf: 'center', paddingHorizontal: 24 }} />}
  </View>
);

export const Empty = ({ title, hint }) => (
  <View style={{ alignItems: 'center', padding: 40 }}>
    <Text style={{ fontSize: 17, fontWeight: '700', color: colors.ink }}>{title}</Text>
    {!!hint && <Text style={{ color: colors.muted, marginTop: 6, textAlign: 'center' }}>{hint}</Text>}
  </View>
);

export const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : '—';

const s = StyleSheet.create({
  btn: { paddingVertical: 13, paddingHorizontal: 18, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface },
  btnPrimary: { backgroundColor: colors.accent, borderColor: colors.accent },
  btnDanger: { backgroundColor: colors.danger, borderColor: colors.danger },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  label: { fontWeight: '600', color: colors.ink, marginBottom: 5 },
  input: { borderWidth: 1, borderColor: colors.line, borderRadius: 8, padding: 11, backgroundColor: colors.surface, color: colors.ink, fontSize: 16 },
  error: { color: colors.danger, marginTop: 4, fontSize: 13 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 99, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.ink, fontSize: 13, fontWeight: '500' },
  badge: { fontSize: 11, fontWeight: '700', borderWidth: 1, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 1, overflow: 'hidden' },
  errorView: { padding: 24, justifyContent: 'center', flex: 1 },
});

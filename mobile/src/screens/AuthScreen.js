import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../auth';
import { fieldErrors } from '../api';
import { Button, Input } from '../components';
import { colors } from '../theme';

export default function AuthScreen() {
  const { login, register, notice } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setForm({ ...form, [k]: v });

  const submit = async () => {
    const errs = {};
    if (!isLogin && !form.fullName.trim()) errs.fullName = 'Enter your full name';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errs.email = 'Enter a valid email address';
    if (!form.password) errs.password = 'Enter your password';
    else if (!isLogin && form.password.length < 8) errs.password = 'Use at least 8 characters';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    setFormError('');
    try {
      if (isLogin) await login({ email: form.email.trim(), password: form.password });
      else await register({ ...form, email: form.email.trim() });
    } catch (e) {
      setErrors(fieldErrors(e));
      setFormError(e.message);
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
          <Text style={{ fontSize: 34, fontWeight: '800', color: colors.ink }}>Taskyard</Text>
          <Text style={{ color: colors.muted, marginBottom: 24, marginTop: 4 }}>{isLogin ? 'Log in to see your projects.' : 'Create an account to get started.'}</Text>
          {!!notice && <View style={{ backgroundColor: '#fbe9e7', padding: 12, borderRadius: 8, marginBottom: 14 }}><Text style={{ color: colors.danger }}>{notice}</Text></View>}
          {!isLogin && <Input label="Full name" value={form.fullName} onChangeText={set('fullName')} error={errors.fullName} autoComplete="name" />}
          <Input label="Email" value={form.email} onChangeText={set('email')} error={errors.email} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
          <Input label="Password" value={form.password} onChangeText={set('password')} error={errors.password} secureTextEntry autoCapitalize="none" />
          {!!formError && <Text style={{ color: colors.danger, marginBottom: 12 }}>{formError}</Text>}
          <Button title={isLogin ? 'Log in' : 'Create account'} onPress={submit} loading={busy} />
          <Pressable onPress={() => { setIsLogin(!isLogin); setErrors({}); setFormError(''); }} style={{ marginTop: 18, alignItems: 'center' }}>
            <Text style={{ color: colors.accent }}>{isLogin ? 'New here? Create an account' : 'Already registered? Log in'}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

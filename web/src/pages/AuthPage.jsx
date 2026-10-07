import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { fieldErrors } from '../api';
import { Field } from '../components/ui.jsx';

export default function AuthPage({ mode }) {
  const isLogin = mode === 'login';
  const { login, register, notice } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!isLogin && !form.fullName.trim()) errs.fullName = 'Enter your full name';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email address';
    if (!form.password) errs.password = 'Enter your password';
    else if (!isLogin && form.password.length < 8) errs.password = 'Use at least 8 characters';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setBusy(true);
    setFormError('');
    try {
      if (isLogin) await login({ email: form.email, password: form.password });
      else await register(form);
      nav('/');
    } catch (err) {
      setErrors(fieldErrors(err));
      setFormError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-art" aria-hidden="true">
        <div className="auth-brand">Taskyard</div>
        <p>Projects, tasks and progress in one place. Sign in on the web or on your phone and see the same work.</p>
      </div>
      <form className="auth-card" onSubmit={submit} noValidate>
        <h1>{isLogin ? 'Log in' : 'Create your account'}</h1>
        {notice && <p className="notice" role="alert">{notice}</p>}
        {!isLogin && <Field label="Full name" error={errors.fullName}><input value={form.fullName} onChange={set('fullName')} autoComplete="name" /></Field>}
        <Field label="Email" error={errors.email}><input type="email" value={form.email} onChange={set('email')} autoComplete="email" /></Field>
        <Field label="Password" error={errors.password}>
          <input type="password" value={form.password} onChange={set('password')} autoComplete={isLogin ? 'current-password' : 'new-password'} />
        </Field>
        {formError && <p className="form-error" role="alert">{formError}</p>}
        <button className="btn primary wide" disabled={busy}>{busy ? 'Please wait…' : isLogin ? 'Log in' : 'Create account'}</button>
        <p className="switch">
          {isLogin ? <>New here? <Link to="/register">Create an account</Link></> : <>Already registered? <Link to="/login">Log in</Link></>}
        </p>
      </form>
    </div>
  );
}

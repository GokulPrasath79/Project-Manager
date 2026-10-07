import { useState } from 'react';
import { api, fieldErrors } from '../api';
import { Modal, Field, TASK_STATUSES, PRIORITIES, LABELS, toInputDate } from './ui.jsx';

export default function TaskForm({ projectId, task, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: task?.name || '',
    description: task?.description || '',
    priority: task?.priority || 'MEDIUM',
    status: task?.status || 'PENDING',
    dueDate: toInputDate(task?.dueDate),
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setErrors({ name: 'Enter a task name' });
    setErrors({});
    setSaving(true);
    setFormError('');
    const body = { ...form, name: form.name.trim(), dueDate: form.dueDate || null };
    if (!task) body.projectId = projectId;
    try {
      const d = await api(task ? `/tasks/${task.id}` : '/tasks', { method: task ? 'PUT' : 'POST', body });
      onSaved(d.task);
    } catch (err) {
      setErrors(fieldErrors(err));
      setFormError(err.message);
      setSaving(false);
    }
  };

  return (
    <Modal title={task ? 'Edit task' : 'New task'} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <Field label="Name" error={errors.name}><input value={form.name} onChange={set('name')} maxLength={160} autoFocus /></Field>
        <Field label="Description" error={errors.description}><textarea rows={3} value={form.description} onChange={set('description')} /></Field>
        <div className="row">
          <Field label="Priority">
            <select value={form.priority} onChange={set('priority')}>{PRIORITIES.map((p) => <option key={p} value={p}>{LABELS[p]}</option>)}</select>
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={set('status')}>{TASK_STATUSES.map((s) => <option key={s} value={s}>{LABELS[s]}</option>)}</select>
          </Field>
        </div>
        <Field label="Due date" error={errors.dueDate}><input type="date" value={form.dueDate} onChange={set('dueDate')} /></Field>
        {formError && !Object.keys(errors).length && <p className="form-error">{formError}</p>}
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={saving}>{saving ? 'Saving…' : 'Save task'}</button>
        </div>
      </form>
    </Modal>
  );
}

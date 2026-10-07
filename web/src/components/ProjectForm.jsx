import { useState } from 'react';
import { api, fieldErrors } from '../api';
import { Modal, Field, PROJECT_STATUSES, LABELS, toInputDate } from './ui.jsx';

export default function ProjectForm({ project, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: project?.name || '',
    description: project?.description || '',
    status: project?.status || 'NOT_STARTED',
    startDate: toInputDate(project?.startDate),
    endDate: toInputDate(project?.endDate),
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Enter a project name';
    if (form.startDate && form.endDate && form.endDate < form.startDate) errs.endDate = 'End date must be on or after the start date';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    setFormError('');
    const body = {
      ...form,
      name: form.name.trim(),
      startDate: form.startDate || null,
      endDate: form.endDate || null,
    };
    try {
      const d = await api(project ? `/projects/${project.id}` : '/projects', { method: project ? 'PUT' : 'POST', body });
      onSaved(d.project);
    } catch (err) {
      setErrors(fieldErrors(err));
      setFormError(err.message);
      setSaving(false);
    }
  };

  return (
    <Modal title={project ? 'Edit project' : 'New project'} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <Field label="Name" error={errors.name}><input value={form.name} onChange={set('name')} maxLength={120} autoFocus /></Field>
        <Field label="Description" error={errors.description}><textarea rows={3} value={form.description} onChange={set('description')} /></Field>
        <Field label="Status" error={errors.status}>
          <select value={form.status} onChange={set('status')}>
            {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{LABELS[s]}</option>)}
          </select>
        </Field>
        <div className="row">
          <Field label="Start date" error={errors.startDate}><input type="date" value={form.startDate} onChange={set('startDate')} /></Field>
          <Field label="End date" error={errors.endDate}><input type="date" value={form.endDate} onChange={set('endDate')} /></Field>
        </div>
        {formError && !Object.keys(errors).length && <p className="form-error">{formError}</p>}
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={saving}>{saving ? 'Saving…' : 'Save project'}</button>
        </div>
      </form>
    </Modal>
  );
}

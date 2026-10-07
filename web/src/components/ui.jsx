import { useEffect } from 'react';

export const LABELS = {
  NOT_STARTED: 'Not started', IN_PROGRESS: 'In progress', COMPLETED: 'Completed',
  PENDING: 'Pending', LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High',
};
export const PROJECT_STATUSES = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'];
export const TASK_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

export const Badge = ({ value, kind }) => (
  <span className={`badge ${kind || ''} v-${value}`}>{LABELS[value]}</span>
);

export const Spinner = () => <div className="spinner" role="status" aria-label="Loading" />;

export const ErrorBox = ({ message, onRetry }) => (
  <div className="error-box" role="alert">
    <span>{message}</span>
    {onRetry && <button className="btn small" onClick={onRetry}>Try again</button>}
  </div>
);

export const Empty = ({ title, hint, children }) => (
  <div className="empty">
    <h3>{title}</h3>
    {hint && <p>{hint}</p>}
    {children}
  </div>
);

export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const Field = ({ label, error, children }) => (
  <label className="field">
    <span>{label}</span>
    {children}
    {error && <em className="field-error">{error}</em>}
  </label>
);

export const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : '—';
export const toInputDate = (iso) => (iso ? iso.slice(0, 10) : '');

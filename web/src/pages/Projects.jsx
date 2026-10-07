import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { Spinner, ErrorBox, Empty, Badge, PROJECT_STATUSES, LABELS, fmtDate } from '../components/ui.jsx';
import ProjectForm from '../components/ProjectForm.jsx';

export default function Projects() {
  const [projects, setProjects] = useState(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [creating, setCreating] = useState(false);

  const load = useCallback(() => {
    setError('');
    api('/projects', { params: { q, status, limit: 100 } })
      .then((d) => setProjects(d.data))
      .catch((e) => setError(e.message));
  }, [q, status]);

  // debounce search typing
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const filtering = q || status;

  return (
    <>
      <header className="page-head">
        <h1>Projects</h1>
        <button className="btn primary" onClick={() => setCreating(true)}>New project</button>
      </header>

      <div className="toolbar">
        <input type="search" placeholder="Search projects by name" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search projects" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{LABELS[s]}</option>)}
        </select>
      </div>

      {error && <ErrorBox message={error} onRetry={load} />}
      {!projects && !error && <Spinner />}
      {projects && projects.length === 0 && (
        <Empty
          title={filtering ? 'No projects match' : 'No projects yet'}
          hint={filtering ? 'Try a different name or status.' : 'Create a project, then add tasks to it.'}
        />
      )}

      <div className="grid">
        {projects?.map((p) => {
          const pct = p.taskCount ? Math.round((p.completedTaskCount / p.taskCount) * 100) : 0;
          return (
            <Link to={`/projects/${p.id}`} className="card project-card" key={p.id}>
              <div className="card-top">
                <h3>{p.name}</h3>
                <Badge value={p.status} kind="status" />
              </div>
              {p.description && <p className="muted clamp">{p.description}</p>}
              <div className="meter" aria-hidden="true"><i style={{ width: `${pct}%` }} /></div>
              <div className="card-foot">
                <span>{p.completedTaskCount}/{p.taskCount} tasks</span>
                <span>{p.endDate ? `Due ${fmtDate(p.endDate)}` : 'No end date'}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {creating && <ProjectForm onClose={() => setCreating(false)} onSaved={() => { setCreating(false); load(); }} />}
    </>
  );
}

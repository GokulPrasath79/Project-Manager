import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import {
  Spinner, ErrorBox, Empty, Badge, Modal, TASK_STATUSES, PRIORITIES, LABELS, fmtDate,
} from '../components/ui.jsx';
import ProjectForm from '../components/ProjectForm.jsx';
import TaskForm from '../components/TaskForm.jsx';

export default function ProjectDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [taskModal, setTaskModal] = useState(null); // null | {} (new) | task
  const [editingProject, setEditingProject] = useState(false);
  const [confirm, setConfirm] = useState(null); // { kind: 'project'|'task', item }

  const loadProject = useCallback(() => {
    api(`/projects/${id}`).then((d) => setProject(d.project)).catch((e) => setError(e.message));
  }, [id]);

  const loadTasks = useCallback(() => {
    api('/tasks', { params: { projectId: id, q, status, priority, limit: 100, order: 'desc' } })
      .then((d) => setTasks(d.data))
      .catch((e) => setError(e.message));
  }, [id, q, status, priority]);

  useEffect(loadProject, [loadProject]);
  useEffect(() => {
    const t = setTimeout(loadTasks, 250);
    return () => clearTimeout(t);
  }, [loadTasks]);

  const complete = async (task) => {
    await api(`/tasks/${task.id}`, { method: 'PUT', body: { status: 'COMPLETED' } }).catch((e) => setError(e.message));
    loadTasks();
  };

  const doDelete = async () => {
    try {
      if (confirm.kind === 'project') {
        await api(`/projects/${id}`, { method: 'DELETE' });
        nav('/projects');
        return;
      }
      await api(`/tasks/${confirm.item.id}`, { method: 'DELETE' });
      setConfirm(null);
      loadTasks();
    } catch (e) {
      setError(e.message);
      setConfirm(null);
    }
  };

  if (error && !project) return <><Link to="/projects">← Projects</Link><ErrorBox message={error} onRetry={() => { setError(''); loadProject(); loadTasks(); }} /></>;
  if (!project) return <Spinner />;
  const filtering = q || status || priority;

  return (
    <>
      <Link to="/projects" className="back">← Projects</Link>
      <header className="page-head">
        <div>
          <h1>{project.name}</h1>
          <div className="meta">
            <Badge value={project.status} kind="status" />
            <span>{fmtDate(project.startDate)} to {fmtDate(project.endDate)}</span>
            <span>Created {fmtDate(project.createdAt)}</span>
          </div>
        </div>
        <div className="actions">
          <button className="btn" onClick={() => setEditingProject(true)}>Edit</button>
          <button className="btn danger" onClick={() => setConfirm({ kind: 'project' })}>Delete</button>
        </div>
      </header>
      {project.description && <p className="lead">{project.description}</p>}
      {error && <ErrorBox message={error} />}

      <div className="section-head">
        <h2>Tasks</h2>
        <button className="btn primary" onClick={() => setTaskModal({})}>New task</button>
      </div>
      <div className="toolbar">
        <input type="search" placeholder="Search tasks by name" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search tasks" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          {TASK_STATUSES.map((s) => <option key={s} value={s}>{LABELS[s]}</option>)}
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value)} aria-label="Filter by priority">
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{LABELS[p]}</option>)}
        </select>
      </div>

      {!tasks && <Spinner />}
      {tasks && tasks.length === 0 && (
        <Empty title={filtering ? 'No tasks match' : 'No tasks yet'} hint={filtering ? 'Clear a filter to see more.' : 'Add the first task for this project.'} />
      )}
      {tasks && tasks.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Task</th><th>Priority</th><th>Status</th><th>Due</th><th /></tr></thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id} className={t.status === 'COMPLETED' ? 'done-row' : ''}>
                  <td><div className="task-name">{t.name}</div>{t.description && <div className="muted small">{t.description}</div>}</td>
                  <td><Badge value={t.priority} kind="prio" /></td>
                  <td><Badge value={t.status} kind="status" /></td>
                  <td>{fmtDate(t.dueDate)}</td>
                  <td className="row-actions">
                    {t.status !== 'COMPLETED' && <button className="btn small" onClick={() => complete(t)}>Mark done</button>}
                    <button className="btn small" onClick={() => setTaskModal(t)}>Edit</button>
                    <button className="btn small danger" onClick={() => setConfirm({ kind: 'task', item: t })}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {taskModal && (
        <TaskForm projectId={Number(id)} task={taskModal.id ? taskModal : null} onClose={() => setTaskModal(null)}
          onSaved={() => { setTaskModal(null); loadTasks(); }} />
      )}
      {editingProject && (
        <ProjectForm project={project} onClose={() => setEditingProject(false)}
          onSaved={(p) => { setEditingProject(false); setProject({ ...project, ...p }); }} />
      )}
      {confirm && (
        <Modal title={confirm.kind === 'project' ? 'Delete this project?' : 'Delete this task?'} onClose={() => setConfirm(null)}>
          <p>{confirm.kind === 'project' ? 'The project and all of its tasks will be removed. This cannot be undone.' : `"${confirm.item.name}" will be removed. This cannot be undone.`}</p>
          <div className="modal-actions">
            <button className="btn" onClick={() => setConfirm(null)}>Keep</button>
            <button className="btn danger-solid" onClick={doDelete}>Delete</button>
          </div>
        </Modal>
      )}
    </>
  );
}

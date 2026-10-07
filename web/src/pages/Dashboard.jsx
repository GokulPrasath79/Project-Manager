import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { Spinner, ErrorBox, Empty } from '../components/ui.jsx';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setError('');
    api('/dashboard').then(setStats).catch((e) => setError(e.message));
  }, []);
  useEffect(load, [load]);

  if (error) return <ErrorBox message={error} onRetry={load} />;
  if (!stats) return <Spinner />;
  if (stats.totalProjects === 0)
    return (
      <Empty title="Nothing here yet" hint="Create your first project to start tracking tasks.">
        <Link className="btn primary" to="/projects">Go to projects</Link>
      </Empty>
    );

  const { totalTasks, completedTasks, pendingTasks, inProgressTasks } = stats;
  const pct = (n) => (totalTasks ? (n / totalTasks) * 100 : 0);
  const items = [
    ['Total projects', stats.totalProjects],
    ['Projects in progress', stats.projectsInProgress],
    ['Total tasks', totalTasks],
    ['Completed tasks', completedTasks],
    ['Pending tasks', pendingTasks],
  ];

  return (
    <>
      <header className="page-head"><h1>Dashboard</h1></header>

      <section className="split" aria-label="Task breakdown">
        <div className="split-head">
          <strong>{completedTasks} of {totalTasks} tasks done</strong>
          <span>{Math.round(pct(completedTasks))}%</span>
        </div>
        <div className="split-bar" role="img" aria-label={`${completedTasks} completed, ${inProgressTasks} in progress, ${pendingTasks} pending`}>
          <i className="seg done" style={{ width: `${pct(completedTasks)}%` }} />
          <i className="seg doing" style={{ width: `${pct(inProgressTasks)}%` }} />
          <i className="seg todo" style={{ width: `${pct(pendingTasks)}%` }} />
        </div>
        <div className="legend">
          <span><i className="dot done" />Completed {completedTasks}</span>
          <span><i className="dot doing" />In progress {inProgressTasks}</span>
          <span><i className="dot todo" />Pending {pendingTasks}</span>
        </div>
      </section>

      <section className="stats">
        {items.map(([label, n]) => (
          <div className="stat" key={label}>
            <div className="stat-n">{n}</div>
            <div className="stat-l">{label}</div>
          </div>
        ))}
      </section>
    </>
  );
}

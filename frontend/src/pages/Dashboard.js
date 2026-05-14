import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, todo: 0, inProgress: 0, completed: 0, overdue: 0 });
  const [recentTasks, setRecentTasks] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/tasks/dashboard');
        setStats(res.data.stats);
        setRecentTasks(res.data.recentTasks);
        setOverdueTasks(res.data.overdueTasks);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p style={{ color: '#6b7280', marginTop: '0.25rem' }}>Welcome back, {user?.name}! 👋</p>
        </div>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">📊</span>
          <div><div className="stat-number">{stats.total}</div><div className="stat-label">Total Tasks</div></div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📝</span>
          <div><div className="stat-number" style={{ color: '#6b7280' }}>{stats.todo}</div><div className="stat-label">To Do</div></div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">⚡</span>
          <div><div className="stat-number" style={{ color: '#1d4ed8' }}>{stats.inProgress}</div><div className="stat-label">In Progress</div></div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">✅</span>
          <div><div className="stat-number" style={{ color: '#059669' }}>{stats.completed}</div><div className="stat-label">Completed</div></div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">⚠️</span>
          <div><div className="stat-number" style={{ color: '#dc2626' }}>{stats.overdue}</div><div className="stat-label">Overdue</div></div>
        </div>
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Tasks</h2>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/tasks')}>View All</button>
          </div>
          {recentTasks.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📋</div><h3>No tasks yet</h3></div>
          ) : (
            recentTasks.map(task => (
              <div key={task._id} className="task-card">
                <div className="task-title">{task.title}</div>
                <div className="task-meta">
                  <span className={`badge badge-${task.status}`}>{task.status}</span>
                  <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                  {task.project && <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>📁 {task.project.name}</span>}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title" style={{ color: '#dc2626' }}>⚠️ Overdue Tasks</h2>
          </div>
          {overdueTasks.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">🎉</div><h3>No overdue tasks!</h3></div>
          ) : (
            overdueTasks.map(task => (
              <div key={task._id} className="task-card overdue">
                <div className="task-title">{task.title}</div>
                <div className="task-meta">
                  <span className="badge badge-overdue">Overdue</span>
                  <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                  {task.dueDate && <span style={{ fontSize: '0.8rem', color: '#dc2626' }}>Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '', projectId: '' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, [filters]);

  const fetchTasks = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.projectId) params.append('projectId', filters.projectId);
      const res = await api.get(`/tasks?${params.toString()}`);
      setTasks(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) { console.error(err); }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      const res = await api.put(`/tasks/${taskId}`, { status });
      setTasks(tasks.map(t => t._id === taskId ? res.data : t));
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter(t => t._id !== taskId));
    } catch (err) { alert('Failed to delete'); }
  };

  const isOverdue = (task) => task.dueDate && task.status !== 'completed' && new Date() > new Date(task.dueDate);
  const filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return <div className="loading">Loading tasks...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">All Tasks</h1>
        <span style={{ color: '#6b7280' }}>{filteredTasks.length} tasks</span>
      </div>
      <div className="filters">
        <input className="search-input" placeholder="Search tasks..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        <select className="filter-select" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select className="filter-select" value={filters.priority} onChange={e => setFilters({ ...filters, priority: e.target.value })}>
          <option value="">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select className="filter-select" value={filters.projectId} onChange={e => setFilters({ ...filters, projectId: e.target.value })}>
          <option value="">All Projects</option>
          {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
        {(filters.status || filters.priority || filters.projectId || searchTerm) && (
          <button className="btn btn-secondary btn-sm" onClick={() => { setFilters({ status: '', priority: '', projectId: '' }); setSearchTerm(''); }}>Clear</button>
        )}
      </div>
      {filteredTasks.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">✅</div><h3>No tasks found</h3></div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Project</th>
                  <th>Assigned To</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  {user?.role === 'admin' && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map(task => (
                  <tr key={task._id} style={{ background: isOverdue(task) ? '#fff5f5' : undefined }}>
                    <td><div style={{ fontWeight: 500 }}>{task.title}</div></td>
                    <td style={{ fontSize: '0.85rem', color: '#6b7280' }}>{task.project?.name || '—'}</td>
                    <td style={{ fontSize: '0.85rem' }}>{task.assignedTo?.name || <span style={{ color: '#9ca3af' }}>Unassigned</span>}</td>
                    <td><span className={`badge badge-${task.priority}`}>{task.priority}</span></td>
                    <td>
                      <select className="filter-select" style={{ padding: '0.2rem 0.4rem', fontSize: '0.78rem' }} value={task.status} onChange={e => handleStatusChange(task._id, e.target.value)}>
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: isOverdue(task) ? '#dc2626' : '#6b7280' }}>
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                      {isOverdue(task) && ' ⚠️'}
                    </td>
                    {user?.role === 'admin' && (
                      <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(task._id)}>Delete</button></td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tasks;

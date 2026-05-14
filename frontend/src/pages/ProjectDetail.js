import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedMember, setSelectedMember] = useState('');
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '', status: 'todo' });
  const [editTask, setEditTask] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProject();
    fetchTasks();
    if (user?.role === 'admin') fetchAllMembers();
  }, [id]);

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
      setMembers(res.data.members || []);
    } catch (err) { navigate('/projects'); }
    finally { setLoading(false); }
  };

  const fetchTasks = async () => {
    try {
      const res = await api.get(`/tasks?projectId=${id}`);
      setTasks(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchAllMembers = async () => {
    try {
      const res = await api.get('/users/members');
      setAllMembers(res.data);
    } catch (err) { console.error(err); }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editTask) {
        const res = await api.put(`/tasks/${editTask._id}`, taskForm);
        setTasks(tasks.map(t => t._id === editTask._id ? res.data : t));
      } else {
        const res = await api.post('/tasks', { ...taskForm, project: id });
        setTasks([res.data, ...tasks]);
      }
      setShowTaskModal(false);
      setEditTask(null);
      setTaskForm({ title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '', status: 'todo' });
    } catch (err) { setError(err.response?.data?.message || 'Failed to save task'); }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter(t => t._id !== taskId));
    } catch (err) { alert('Failed to delete task'); }
  };

  const openEditTask = (task) => {
    setEditTask(task);
    setTaskForm({ title: task.title, description: task.description || '', assignedTo: task.assignedTo?._id || '', priority: task.priority, dueDate: task.dueDate ? task.dueDate.split('T')[0] : '', status: task.status });
    setShowTaskModal(true);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map(t => t._id === taskId ? res.data : t));
    } catch (err) { console.error(err); }
  };

  const handleAddMember = async () => {
    if (!selectedMember) return;
    try {
      const res = await api.post(`/projects/${id}/members`, { userId: selectedMember });
      setMembers(res.data.members);
      setShowAddMember(false);
      setSelectedMember('');
    } catch (err) { alert('Failed to add member'); }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      const res = await api.delete(`/projects/${id}/members/${userId}`);
      setMembers(res.data.members);
    } catch (err) { alert('Failed to remove member'); }
  };

  const isOverdue = (task) => task.dueDate && task.status !== 'completed' && new Date() > new Date(task.dueDate);
  const isAdmin = user?.role === 'admin';

  if (loading) return <div className="loading">Loading project...</div>;
  if (!project) return null;

  return (
    <div>
      <div className="page-header">
        <div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/projects')} style={{ marginBottom: '0.5rem' }}>← Back</button>
          <h1 className="page-title">{project.name}</h1>
          {project.description && <p style={{ color: '#6b7280', marginTop: '0.25rem' }}>{project.description}</p>}
        </div>
        <span className={`badge badge-${project.status}`}>{project.status}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div>
          <div className="card-header" style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Tasks ({tasks.length})</h2>
            <button className="btn btn-primary btn-sm" onClick={() => { setEditTask(null); setTaskForm({ title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '', status: 'todo' }); setShowTaskModal(true); }}>+ Add Task</button>
          </div>
          {tasks.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">✅</div><h3>No tasks yet!</h3></div>
          ) : (
            tasks.map(task => (
              <div key={task._id} className={`task-card priority-${task.priority} ${isOverdue(task) ? 'overdue' : ''}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="task-title">{task.title}</div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEditTask(task)}>Edit</button>
                    {isAdmin && <button className="btn btn-danger btn-sm" onClick={() => handleDeleteTask(task._id)}>Del</button>}
                  </div>
                </div>
                {task.description && <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '0.4rem 0' }}>{task.description}</p>}
                <div className="task-meta">
                  <select className="filter-select" style={{ padding: '0.2rem 0.5rem', fontSize: '0.78rem' }} value={task.status} onChange={e => handleStatusChange(task._id, e.target.value)}>
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                  {task.assignedTo && <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>👤 {task.assignedTo.name}</span>}
                  {task.dueDate && <span style={{ fontSize: '0.8rem', color: isOverdue(task) ? '#dc2626' : '#6b7280' }}>📅 {new Date(task.dueDate).toLocaleDateString()}{isOverdue(task) && ' ⚠️'}</span>}
                </div>
              </div>
            ))
          )}
        </div>
        <div>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Team Members ({members.length})</h3>
              {isAdmin && <button className="btn btn-secondary btn-sm" onClick={() => setShowAddMember(!showAddMember)}>+ Add</button>}
            </div>
            {showAddMember && (
              <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                <select className="filter-select" style={{ flex: 1 }} value={selectedMember} onChange={e => setSelectedMember(e.target.value)}>
                  <option value="">Select member...</option>
                  {allMembers.filter(m => !members.find(mem => mem._id === m._id)).map(m => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
                <button className="btn btn-primary btn-sm" onClick={handleAddMember}>Add</button>
              </div>
            )}
            {members.length === 0 ? <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>No members assigned</p> : (
              members.map(member => (
                <div key={member._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{member.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{member.email}</div>
                  </div>
                  {isAdmin && <button className="btn btn-danger btn-sm" onClick={() => handleRemoveMember(member._id)}>✕</button>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editTask ? 'Edit Task' : 'Create Task'}</h2>
              <button className="modal-close" onClick={() => setShowTaskModal(false)}>✕</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleTaskSubmit}>
              <div className="form-group">
                <label>Task Title *</label>
                <input type="text" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} placeholder="Enter task title" required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} placeholder="Task description" />
              </div>
              <div className="form-group">
                <label>Assign To</label>
                <select value={taskForm.assignedTo} onChange={e => setTaskForm({ ...taskForm, assignedTo: e.target.value })}>
                  <option value="">Unassigned</option>
                  {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Priority</label>
                  <select value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={taskForm.status} onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}>
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" value={taskForm.dueDate} onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editTask ? 'Update Task' : 'Create Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectDetail;

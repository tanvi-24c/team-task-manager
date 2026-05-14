import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

function Projects() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '', deadline: '', memberIds: [] });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProjects();
    if (user?.role === 'admin') fetchMembers();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchMembers = async () => {
    try {
      const res = await api.get('/users/members');
      setMembers(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await api.post('/projects', formData);
      setProjects([res.data, ...projects]);
      setShowModal(false);
      setFormData({ name: '', description: '', deadline: '', memberIds: [] });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(projects.filter(p => p._id !== id));
    } catch (err) { alert('Failed to delete project'); }
  };

  const toggleMember = (userId) => {
    const ids = formData.memberIds.includes(userId)
      ? formData.memberIds.filter(id => id !== userId)
      : [...formData.memberIds, userId];
    setFormData({ ...formData, memberIds: ids });
  };

  if (loading) return <div className="loading">Loading projects...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Projects</h1>
        {user?.role === 'admin' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Project</button>
        )}
      </div>
      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <h3>{user?.role === 'admin' ? 'No projects yet. Create your first!' : 'No projects assigned yet.'}</h3>
        </div>
      ) : (
        <div className="grid-2">
          {projects.map(project => (
            <div key={project._id} className="project-card" onClick={() => navigate(`/projects/${project._id}`)}>
              <div className="card-header">
                <h3>{project.name}</h3>
                <span className={`badge badge-${project.status}`}>{project.status}</span>
              </div>
              <p>{project.description || 'No description'}</p>
              {project.deadline && <p style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: '0.75rem' }}>📅 {new Date(project.deadline).toLocaleDateString()}</p>}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>👥 {project.members?.length || 0} members</span>
                {user?.role === 'admin' && (
                  <button className="btn btn-danger btn-sm" onClick={(e) => handleDelete(project._id, e)}>Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create New Project</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Project Name *</label>
                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Enter project name" required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description" />
              </div>
              <div className="form-group">
                <label>Deadline</label>
                <input type="date" value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })} />
              </div>
              {members.length > 0 && (
                <div className="form-group">
                  <label>Add Members</label>
                  <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1.5px solid #e5e7eb', borderRadius: '8px', padding: '0.5rem' }}>
                    {members.map(m => (
                      <label key={m._id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={formData.memberIds.includes(m._id)} onChange={() => toggleMember(m._id)} />
                        {m.name} ({m.email})
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Creating...' : 'Create Project'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Projects;

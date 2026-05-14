import { useState, useEffect } from 'react';
import api from '../utils/api';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users');
        setUsers(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await api.put(`/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u._id === userId ? res.data : u));
    } catch (err) { alert('Failed to update role'); }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loading">Loading users...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Users Management</h1>
        <span style={{ color: '#6b7280' }}>{users.length} total users</span>
      </div>
      <div className="filters">
        <input className="search-input" placeholder="Search users..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>
      <div className="card" style={{ padding: 0 }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Change Role</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user._id}>
                  <td style={{ fontWeight: 500 }}>{user.name}</td>
                  <td style={{ color: '#6b7280', fontSize: '0.9rem' }}>{user.email}</td>
                  <td><span className={`badge badge-${user.role}`}>{user.role}</span></td>
                  <td style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <select className="filter-select" style={{ padding: '0.3rem 0.6rem', fontSize: '0.82rem' }} value={user.role} onChange={e => handleRoleChange(user._id, e.target.value)}>
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Users;

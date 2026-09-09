import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);

  const loadUsers = async () => {
    const res = await axios.get('http://localhost:5000/api/users');
    setUsers(res.data);
  };

  const promote = async (userId: string) => {
    await axios.put('http://localhost:5000/api/users/promote', { userId });
    loadUsers();
  };

  const updateCategory = async (userId: string, category: string) => {
    await axios.put('http://localhost:5000/api/users/category', { userId, category });
    loadUsers();
  };

  const deleteUser = async (userId: string) => {
    await axios.delete(`http://localhost:5000/api/users/${userId}`);
    loadUsers();
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="container">
      <h2>Admin Dashboard</h2>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u: any) => (
            <tr key={u._id}>
              <td>{u.email}</td>
              <td>{u.phone}</td>
              <td>{u.role}</td>
              <td>
                <select value={u.category} onChange={(e) => updateCategory(u._id, e.target.value)}>
                  <option>Basic</option>
                  <option>Silver</option>
                  <option>Gold</option>
                </select>
              </td>
              <td>
                {u.role !== 'admin' && <button onClick={() => promote(u._id)}>Make Admin</button>}
                <button onClick={() => deleteUser(u._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
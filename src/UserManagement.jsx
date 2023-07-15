import React, { useEffect, useState } from 'react';
import axios from 'axios';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);

  const token = localStorage.getItem('token'); // Retrieve the JWT from local storage

  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  useEffect(() => {
    // Fetch the list of users when the component mounts
    axios.get(`${process.env.REACT_APP_API_ROUTE}/users`, config)
      .then(response => {
        setUsers(response.data.users);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
      });
  }, []);

  const handleEditClick = (user) => {
    setEditingUser(user);
  };

  const handleDeleteClick = async (user) => {
    // Display a confirmation popup before deleting the user
    const confirmDelete = window.confirm(`Are you sure you want to delete user ${user.username}?`);
    if (confirmDelete) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_ROUTE}/users/${user.id}`);
        // If the request is successful, remove the user from the state
        setUsers(users.filter(u => u.id !== user.id));
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handlePromoteClick = async (user) => {
    // Update the user's isAdmin property
    user.isAdmin = true;
    // Send a PUT or PATCH request to your API to update the user
    try {
      await axios.put(`${process.env.REACT_APP_API_ROUTE}/users/${user.id}/promote`, user, config);
      // If the request is successful, update the user in the state
      setUsers(users.map(u => u.id === user.id ? user : u));
    } catch (error) {
      console.error('Error promoting user:', error);
    }
  };

  const handleSaveClick = async (event) => {
    event.preventDefault();

    try {
      await axios.put(`${process.env.REACT_APP_API_ROUTE}/users/${editingUser.id}`, editingUser, config);
      // If the request is successful, update the user in the state
      setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
      // Clear the editingUser state
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  return (
    <div>
      <h1>User Management</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            <p>Username: {user.username}</p>
            <p>Real Name: {user.realName}</p>
            <p>Email: {user.email}</p>
            <p>Admin: {user.isAdmin ? 'Yes' : 'No'}</p>
            <p>Email Verified: {user.verified ? 'Yes' : 'No'}</p>
            <button onClick={() => handleEditClick(user)}>Edit</button>
            <button onClick={() => handleDeleteClick(user)}>Delete</button>
            <button onClick={() => handlePromoteClick(user)}>Promote to Admin</button>
          </li>
        ))}
      </ul>
      {editingUser && (
        <form onSubmit={handleSaveClick}>
          <label>
            Username:
            <input type="text" value={editingUser.username} onChange={e => setEditingUser({...editingUser, username: e.target.value})} />
          </label>
          <label>
            Real Name:
            <input type="text" value={editingUser.realName} onChange={e => setEditingUser({...editingUser, realName: e.target.value})} />
          </label>
          <label>
            Email:
            <input type="text" value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} />
          </label>
          <label>
            Admin:
            <input type="checkbox" checked={editingUser.isAdmin} onChange={e => setEditingUser({...editingUser, isAdmin: e.target.checked})} />
          </label>
          <button type="submit">Save</button>
        </form>
      )}
    </div>
  );
}

export default UserManagement;



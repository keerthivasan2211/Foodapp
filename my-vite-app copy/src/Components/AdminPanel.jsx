import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPanel = () => {
  const [users, setUsers] = useState([]); // Store users
  const [iAmInCount, setIAmInCount] = useState(0); // State to store the "I Am In" count
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(''); // Error state

  useEffect(() => {
    // Fetch all users data and "I Am In" count for the admin panel
    axios.get('http://localhost:5000/api/admin')
      .then(response => {
        setUsers(response.data.users);
        setIAmInCount(response.data.iAmInCount); // Set the "I Am In" count
        setLoading(false);
      })
      .catch(error => {
        setError('Error fetching users');
        setLoading(false);
        console.error('Error fetching users:', error);
      });
  }, []);

  // Reset user response
  const resetUserResponse = (userId) => {
    // Assuming you have a way to authenticate/admin user, such as token
    const adminId = 0; // Example admin ID (replace with actual logic)

    axios.post('http://localhost:5000/api/admin/reset-response', { adminId, userId })
      .then(() => {
        alert(`Response for user ${userId} has been reset.`);
        // Fetch updated users to reflect the reset response
        axios.get('http://localhost:5000/api/admin')
          .then(response => {
            setUsers(response.data.users);
            setIAmInCount(response.data.iAmInCount);
          });
      })
      .catch(error => {
        console.error('Error resetting response:', error);
        alert('Error resetting response');
      });
  };

  if (loading) {
    return <div className="text-center py-10 text-xl">Loading users...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-xl text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h2 className="text-3xl font-semibold text-center mb-6">Admin Panel</h2>
      <div className="text-center mb-4">
        <p className="text-xl font-medium">"I Am In" Count: {iAmInCount}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-md">
          <thead>
            <tr>
              <th className="p-4 border-b">ID</th>
              <th className="p-4 border-b">Name</th>
              <th className="p-4 border-b">Last Response</th>
              <th className="p-4 border-b">Response Time</th>
              <th className="p-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td className="p-4 border-b">{user.id}</td>
                <td className="p-4 border-b">{user.name}</td>
                <td className="p-4 border-b">{user.response || 'No response yet'}</td>
                <td className="p-4 border-b">
                  {user.responseTime ? new Date(user.responseTime).toLocaleString() : 'N/A'}
                </td>
                <td className="p-4 border-b">
                  <button
                    onClick={() => resetUserResponse(user.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-red-600 transition duration-200"
                  >
                    Reset Response
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;

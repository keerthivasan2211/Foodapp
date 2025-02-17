import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPanel = () => {
  const [users, setUsers] = useState([]); // Store users
  const [iAmInCount, setIAmInCount] = useState(0); // State to store the "I Am In" count
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(''); // Error state
  const [userName, setUserName] = useState(''); // User name input for adding a new user
  const [userAddedMessage, setUserAddedMessage] = useState(''); // Message after adding user

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
    const adminId = 0; // Example admin ID (replace with actual logic)

    axios.post('http://localhost:5000/api/admin/reset-response', { adminId, userId })
      .then(() => {
        // Optimistic update: Directly update the state after resetting
        setUsers(users.map(user => 
          user.id === userId ? { ...user, response: null, responseTime: null } : user
        ));
        alert(`Response for user ${userId} has been reset.`);
      })
      .catch(error => {
        console.error('Error resetting response:', error);
        alert('Error resetting response');
      });
  };

  // Handle adding a new user
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!userName) {
      setError('User name is required.');
      return;
    }

    try {
      // Assuming adminId = 0 for now, replace with actual admin logic
      const adminId = 0;
      const response = await axios.post('http://localhost:5000/api/admin/add-user', { adminId, name: userName });
      setUserAddedMessage(response.data.message); // Display success message from server
      setUserName(''); // Reset input field
      setError('');
    } catch (error) {
      setError('Error adding user');
      console.error('Error adding user:', error);
    }
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

      {/* Add User Section */}
      <div className="mb-6">
        <h3 className="text-xl font-medium mb-3">Add New User</h3>
        <form onSubmit={handleAddUser} className="flex justify-center">
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="p-2 border rounded-md"
            placeholder="Enter user name"
          />
          <button type="submit" className="ml-4 bg-blue-500 text-white px-4 py-2 rounded-md">
            Add User
          </button>
        </form>
        {userAddedMessage && (
          <div className="mt-2 text-green-500 text-center">
            {userAddedMessage}
          </div>
        )}
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

// UserPanel.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserPanel = () => {
  const [users, setUsers] = useState([]); // Store users
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(''); // Error state

  // Fetch users from the backend
  useEffect(() => {
    axios.get('http://localhost:5000/api/users')
      .then(response => {
        setUsers(response.data);
        setLoading(false);
      })
      .catch(error => {
        setError('Error fetching users');
        setLoading(false);
        console.error('Error fetching users:', error);
      });
  }, []);

  // Handle user responses
  const handleResponse = (userId, response) => {
    axios.post('http://localhost:5000/api/users/response', { userId, response })
      .then(() => {
        alert(`Response for user ${userId}: ${response} saved.`);
        // Fetch updated users to reflect response time
        axios.get('http://localhost:5000/api/users')
          .then(response => {
            setUsers(response.data);
          });
      })
      .catch(error => {
        console.error('Error saving response:', error);
        alert('Error saving response');
      });
  };

  if (loading) {
    return <div className="text-center py-10 text-xl">Loading users...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-xl text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto mt-8 p-6 bg-gray-100 rounded-xl shadow-lg">
      <h2 className="text-4xl font-semibold text-center mb-8 text-indigo-600">User Panel</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {users.map(user => {
          const isResponseDisabled = user.response && (Date.now() - user.responseTime < 24 * 60 * 60 * 1000);
          return (
            <div key={user.id} className="bg-white p-6 border rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-medium text-gray-800">{user.name}</h3>
                <p className="text-gray-500 text-sm">
                  {user.response
                    ? `Last response: ${user.response} on ${new Date(user.responseTime).toLocaleString()}`
                    : 'No response yet'}
                </p>
              </div>
              <div className="flex justify-around mt-6 space-x-4">
                <button
                  onClick={() => handleResponse(user.id, 'I Am In')}
                  className={`bg-green-500 text-white px-5 py-3 rounded-md shadow-md hover:bg-green-600 transition duration-200 w-full ${isResponseDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isResponseDisabled}
                >
                  I Am In
                </button>
                <button
                  onClick={() => handleResponse(user.id, 'I Am Not')}
                  className={`bg-red-500 text-white px-5 py-3 rounded-md shadow-md hover:bg-red-600 transition duration-200 w-full ${isResponseDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isResponseDisabled}
                >
                  I Am Not
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserPanel;

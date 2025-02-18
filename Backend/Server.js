// server.js or app.js
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

app.use(cors());
app.use(bodyParser.json());

let users = [
  { id: 1, name: 'Sujitha', response: null, responseTime: null },
  { id: 2, name: 'Balaji', response: null, responseTime: null },
  { id: 3, name: 'Keerthivasan.S', response: null, responseTime: null },
  { id: 4, name: 'Kishore.N', response: null, responseTime: null },
  { id: 5, name: 'Shakthi.E.K', response: null, responseTime: null },
  { id: 6, name: 'Sundarrajan.P.S', response: null, responseTime: null },
  { id: 7, name: 'ManiKandan.K.B', response: null, responseTime: null },
  { id: 8, name: 'Charulatha.R', response: null, responseTime: null },
  { id: 9, name: 'Edwin Kishore Raj', response: null, responseTime: null },
  { id: 10, name: 'Naveen Kumar', response: null, responseTime: null },
  { id: 11, name: 'Hari Sanjay', response: null, responseTime: null },
  { id: 12, name: 'Raghul Sanjay', response: null, responseTime: null },
  { id: 13, name: 'Kayal', response: null, responseTime: null },
  { id: 14, name: 'Kishore', response: null, responseTime: null },
  { id: 15,name: 'Priyadharsini', response: null, responseTime: null },
  { id: 16, name: 'Kavin', response: null, responseTime: null },
 
];

// Dummy admin user (for demonstration purposes)
const admin = { id: 0, name: 'Admin' };

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.post('/api/users/response', (req, res) => {
  const { userId, response } = req.body;
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).send('User not found');
  }

  const currentTime = Date.now();
  if (user.response && currentTime - user.responseTime < 24 * 60 * 60 * 1000) {
    return res.status(400).send('You have already responded within the last 24 hours.');
  }

  user.response = response;
  user.responseTime = currentTime;

  res.send('Response saved.');
});

app.get('/api/admin', (req, res) => {
  // Calculate the count of users who responded with "I Am In"
  const iAmInCount = users.filter(user => user.response === 'I Am In').length;

  res.json({
    users: users,
    iAmInCount: iAmInCount, // Add this count to the response
  });
});

// Endpoint to reset a user's response (admin only)
app.post('/api/admin/reset-response', (req, res) => {
  const { adminId, userId } = req.body;
  if (adminId !== admin.id) {
    return res.status(403).send('You do not have permission to reset responses.');
  }

  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).send('User not found');
  }

  user.response = null;
  user.responseTime = null;

  res.send(`Response for user ${userId} has been reset.`);
});

// Endpoint to add a new user (admin only)
app.post('/api/admin/add-user', (req, res) => {
    const { adminId, name } = req.body;
  
    // Check if the request is from the admin
    if (adminId !== admin.id) {
      return res.status(403).send('You do not have permission to add users.');
    }
  
    // Check if the name is provided
    if (!name) {
      return res.status(400).send('User name is required.');
    }
  
    // Create a new user object
    const newUser = {
      id: users.length + 1,  // Assign a new ID (incremental)
      name: name,
      response: null,
      responseTime: null,
    };
  
    // Add the new user to the users array
    users.push(newUser);
  
    res.status(201).send(`User ${name} added successfully.`);
  });
  

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

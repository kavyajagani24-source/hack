// --- Imports and initialization ---
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const db = require('./db');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- Test MySQL connection ---
db.getConnection()
  .then(() => {
    console.log('Database is connected');
  })
  .catch((err) => {
    console.error('Database connection failed:', err.message);
  });

// --- Routes ---
// Model API endpoint
const { runModel } = require('./modelRunner');

app.post('/api/analyze', (req, res) => {
  console.log('Received /api/analyze request');
  const { csv } = req.body;
  if (!csv) {
    console.error('No CSV data received');
    return res.status(400).json({ message: 'CSV data required.' });
  }
  runModel(csv, (err, result) => {
    if (err) {
      console.error('Model error:', err);
      return res.status(500).json({ message: 'Model error', error: err.message });
    }
    console.log('Model result:', result);
    res.json(result);
  });
});
app.get('/api/test', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is working and returns JSON.' });
});

// Signup endpoint
app.post('/api/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);
    // Return user info for frontend
    return res.status(201).json({
      message: 'Signup successful.',
      user: {
        id: result.insertId,
        name,
        email
      }
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required.' });
  }
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    // Return user info for frontend
    return res.json({
      message: 'Login successful.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// --- Start server ---
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

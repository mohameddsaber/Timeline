require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 5001; // Hardcoded to avoid port 5000 collision on macOS

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/future-paths';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// Routes
const scenarioRoutes = require('./routes/scenarioRoutes');
const nodeRoutes = require('./routes/nodeRoutes');

// Basic Route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Future Paths API is running' });
});

// API Routes
app.use('/api/scenarios', scenarioRoutes);
app.use('/api/nodes', nodeRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

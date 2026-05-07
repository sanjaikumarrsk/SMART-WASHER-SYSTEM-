const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 7099;

// Middleware
app.use(cors());
app.use(express.json());

// Simple route
app.get('/', (req, res) => {
  console.log('GET / requested');
  res.json({ status: 'OK', port: PORT });
});

app.get('/api/test', (req, res) => {
  console.log('GET /api/test requested');
  res.json({ message: 'Test endpoint works' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Test server running on http://localhost:${PORT}`);
});

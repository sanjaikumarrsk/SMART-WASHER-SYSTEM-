const express = require('express');
const router = express.Router();
const https = require('https');
const { getLatestSensorReading, getLatestSensorReadingTimestamp } = require('../runtimeState');
const { setMotorStatus, setPumpStatus } = require('../deviceState');

// GET /api/stats - Get system status (data stored in SQL Server)
router.get('/stats', (req, res) => {
  res.json({
    message: 'Data is stored in SQL Server via .NET API',
    endpoint: 'https://localhost:7099/api/Data/insert-update',
    status: 'Operational'
  });
});

// GET /api/sensor-data/latest - Get latest sensor reading from ESP32
router.get('/sensor-data/latest', (req, res) => {
  const latestReading = getLatestSensorReading();
  const timestamp = getLatestSensorReadingTimestamp();

  if (!latestReading) {
    return res.json({
      data: null,
      reason: 'No sensor data received yet',
    });
  }

  res.json({
    data: {
      ...latestReading,
      recorded_at: timestamp ? timestamp.toISOString() : null,
    },
  });
});

// POST /api/motor-event - Update motor state (user-controlled)
router.post('/motor-event', (req, res) => {
  const { motor_status } = req.body;
  setMotorStatus(motor_status);
  res.json({ success: true, motor_status, message: 'Motor state updated' });
});

// POST /api/pump-event - Update pump state (user-controlled)
router.post('/pump-event', (req, res) => {
  const { pump_status } = req.body;
  setPumpStatus(pump_status);
  res.json({ success: true, pump_status, message: 'Pump state updated' });
});

// POST /api/Data/insert-update - Forward cycle data
router.post('/Data/insert-update', (req, res) => {
  // Accept the data and return success
  res.json({ success: true, message: 'Cycle data received' });
  
  // Note: Actual forwarding to .NET API happens via:
  // 1. Dummy data generator (every 2 seconds)
  // 2. ESP32 WebSocket bridge (when real sensor data arrives)
});

// GET /api/data/all - Get all sensor data from runtime state
router.get('/data/all', (req, res) => {
  const latestReading = getLatestSensorReading();
  const timestamp = getLatestSensorReadingTimestamp();

  res.json({
    success: true,
    message: 'All data is stored in SQL Server. Use .NET API to query historical data.',
    endpoint: 'https://localhost:7099/api/Analysis',
    latest_sensor: latestReading ? {
      ...latestReading,
      recorded_at: timestamp ? timestamp.toISOString() : null,
    } : null,
  });
});

// Helper function to fetch analysis data from .NET API
function fetchAnalysisFromDotnet() {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({});
    
    const options = {
      hostname: 'localhost',
      port: 7099,
      path: '/api/Analysis/getall',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
      rejectUnauthorized: false,
    };

    const proxyReq = https.request(options, (proxyRes) => {
      let data = '';
      
      proxyRes.on('data', (chunk) => {
        data += chunk;
      });
      
      proxyRes.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: proxyRes.statusCode, data: jsonData });
        } catch (err) {
          reject(new Error('Failed to parse API response'));
        }
      });
    });

    proxyReq.on('error', reject);
    proxyReq.write(body);
    proxyReq.end();
  });
}

// GET /api/Analysis/getall - Retrieve analysis data for dashboard
router.get('/Analysis/getall', async (req, res) => {
  try {
    const result = await fetchAnalysisFromDotnet();
    res.status(result.status).json(result.data);
  } catch (err) {
    console.error('[Analysis GET] Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch analysis data' });
  }
});

// POST /api/Analysis/getall - Proxy to .NET API (for compatibility)
router.post('/Analysis/getall', async (req, res) => {
  try {
    const result = await fetchAnalysisFromDotnet();
    res.status(result.status).json(result.data);
  } catch (err) {
    console.error('[Analysis POST] Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch analysis data' });
  }
});

module.exports = router;

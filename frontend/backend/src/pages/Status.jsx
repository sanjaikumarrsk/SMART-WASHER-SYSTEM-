import React, { useState, useEffect } from 'react';
import { Activity, Zap, Droplet, Gauge, AlertCircle, CheckCircle } from 'lucide-react';

const Status = () => {
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [controlLoading, setControlLoading] = useState({});

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

  const fetchStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/status`);
      const data = await response.json();
      if (data.success) {
        setSystemStatus(data.status);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch status');
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Poll status every 2 seconds
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  // Control device
  const controlDevice = async (endpoint) => {
    setControlLoading(prev => ({ ...prev, [endpoint]: true }));
    try {
      const response = await fetch(`${API_BASE}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.success) {
        // Refresh status
        await fetchStatus();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setControlLoading(prev => ({ ...prev, [endpoint]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading system status...</p>
        </div>
      </div>
    );
  }

  if (error && !systemStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
        <div className="max-w-4xl mx-auto bg-red-900/20 border border-red-500 rounded-lg p-6 text-red-200">
          <AlertCircle className="w-6 h-6 mb-2" />
          {error}
        </div>
      </div>
    );
  }

  const status = systemStatus || {};
  const sensorData = status.latestSensorData || {};
  const stats = status.stats || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6 text-white">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">System Status Dashboard</h1>
          <p className="text-slate-300">
            Last Updated: {new Date(status.timestamp).toLocaleTimeString()}
          </p>
        </div>

        {/* SYSTEM HEALTH */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Database */}
          <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              {status.database?.connected ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400" />
              )}
              <span className="font-semibold">Database</span>
            </div>
            <p className={status.database?.connected ? 'text-green-300' : 'text-red-300'}>
              {status.database?.connected ? 'Connected' : 'Disconnected'}
            </p>
          </div>

          {/* ESP32 */}
          <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              {status.esp32?.connected ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-orange-400" />
              )}
              <span className="font-semibold">ESP32</span>
            </div>
            <p className={status.esp32?.connected ? 'text-green-300' : 'text-orange-300'}>
              {status.esp32?.connected ? 'Connected' : 'Waiting for heartbeat'}
            </p>
            {status.esp32?.lastHeartbeat && (
              <p className="text-xs text-slate-400 mt-1">
                {new Date(status.esp32.lastHeartbeat).toLocaleTimeString()}
              </p>
            )}
          </div>

          {/* .NET API */}
          <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              {status.dotnetAPI?.connected ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-orange-400" />
              )}
              <span className="font-semibold">.NET API</span>
            </div>
            <p className={status.dotnetAPI?.connected ? 'text-green-300' : 'text-orange-300'}>
              {status.dotnetAPI?.connected ? 'Connected' : 'Disconnected'}
            </p>
            {status.dotnetAPI?.lastCheck && (
              <p className="text-xs text-slate-400 mt-1">
                {new Date(status.dotnetAPI.lastCheck).toLocaleTimeString()}
              </p>
            )}
          </div>

          {/* Backend */}
          <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="font-semibold">Backend</span>
            </div>
            <p className="text-green-300">Running</p>
          </div>
        </div>

        {/* DEVICE CONTROL */}
        <div className="grid grid-cols-1 md:grid+-cols-2 gap-6 mb-8">
          {/* Pump Control */}
          <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Droplet className="w-6 h-6" />
                Pump Control
              </h3>
              <span className={`px-3 py-1 rounded text-sm font-semibold ${
                status.pumpStatus === 'on' 
                  ? 'bg-green-500/20 text-green-300' 
                  : 'bg-slate-500/20 text-slate-300'
              }`}>
                {(status.pumpStatus || 'off').toUpperCase()}
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => controlDevice('pump/on')}
                disabled={controlLoading['pump/on']}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded transition"
              >
                {controlLoading['pump/on'] ? 'Turning On...' : 'Turn ON'}
              </button>
              <button
                onClick={() => controlDevice('pump/off')}
                disabled={controlLoading['pump/off']}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded transition"
              >
                {controlLoading['pump/off'] ? 'Turning Off...' : 'Turn OFF'}
              </button>
            </div>
          </div>

          {/* Motor Control */}
          <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border border-cyan-500 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Zap className="w-6 h-6" />
                Motor Control
              </h3>
              <span className={`px-3 py-1 rounded text-sm font-semibold ${
                status.motorStatus === 'on' 
                  ? 'bg-green-500/20 text-green-300' 
                  : 'bg-slate-500/20 text-slate-300'
              }`}>
                {(status.motorStatus || 'off').toUpperCase()}
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => controlDevice('motor/on')}
                disabled={controlLoading['motor/on']}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded transition"
              >
                {controlLoading['motor/on'] ? 'Turning On...' : 'Turn ON'}
              </button>
              <button
                onClick={() => controlDevice('motor/off')}
                disabled={controlLoading['motor/off']}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded transition"
              >
                {controlLoading['motor/off'] ? 'Turning Off...' : 'Turn OFF'}
              </button>
            </div>
          </div>
        </div>

        {/* REAL-TIME SENSOR DATA */}
        {sensorData && Object.keys(sensorData).length > 0 && (
          <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-6 mb-8">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Activity className="w-6 h-6" />
              Real-Time Sensor Data
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <SensorCard
                title="Temperature"
                value={`${sensorData.Temperature?.toFixed(1) || 'N/A'}°C`}
                unit="Celsius"
                icon="🌡️"
              />
              <SensorCard
                title="Water Level"
                value={`${sensorData.WaterLevel?.toFixed(1) || 'N/A'}%`}
                unit="Percentage"
                icon="💧"
              />
              <SensorCard
                title="Turbidity"
                value={`${sensorData.Turbidity?.toFixed(1) || 'N/A'} NTU`}
                unit="Clarity"
                icon="👁️"
              />
              <SensorCard
                title="Load Weight"
                value={`${sensorData.LoadWeight?.toFixed(2) || 'N/A'} kg`}
                unit="Weight"
                icon="⚖️"
              />
              <SensorCard
                title="Current"
                value={`${sensorData.Current?.toFixed(2) || 'N/A'} A`}
                unit="Amperes"
                icon="⚡"
              />
              <SensorCard
                title="Washer Speed"
                value={`${sensorData.WasherSpeed || 'N/A'} RPM`}
                unit="Speed"
                icon="🔄"
              />
              <SensorCard
                title="Weight (HX711)"
                value={`${sensorData.Weight?.toFixed(2) || 'N/A'} kg`}
                unit="Load"
                icon="◆"
              />
              <SensorCard
                title="HX711 Ready"
                value={sensorData.HX711Ready ? 'Yes' : 'No'}
                unit="Status"
                icon={sensorData.HX711Ready ? '✓' : '✗'}
              />
            </div>
            <p className="text-xs text-slate-400 mt-4">
              Last recorded: {new Date(sensorData.RecordedAt).toLocaleString()}
            </p>
          </div>
        )}

        {/* STATISTICS */}
        {stats && Object.keys(stats).length > 0 && (
          <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-6 mb-8">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Gauge className="w-6 h-6" />
              System Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                title="Total Readings"
                value={stats.total_readings || 0}
              />
              <StatCard
                title="Total Cycles"
                value={stats.total_cycles || 0}
              />
              <StatCard
                title="24h Avg Temperature"
                value={`${(stats.avg_temperature_24h?.toFixed(1) || 'N/A')}°C`}
              />
              <StatCard
                title="24h Avg Water Level"
                value={`${(stats.avg_water_level_24h?.toFixed(1) || 'N/A')}%`}
              />
            </div>
          </div>
        )}

        {/* RECENT EVENTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Motor Events */}
          <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Recent Motor Events</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {status.recentEvents?.motor && status.recentEvents.motor.length > 0 ? (
                status.recentEvents.motor.map((event, idx) => (
                  <div key={idx} className="bg-slate-800/50 p-3 rounded text-sm">
                    <span className={event.MotorStatus === 'on' ? 'text-green-300' : 'text-red-300'}>
                      Motor turned {event.MotorStatus}
                    </span>
                    <p className="text-xs text-slate-400">
                      {new Date(event.TriggeredAt).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-slate-400">No recent motor events</p>
              )}
            </div>
          </div>

          {/* Pump Events */}
          <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Recent Pump Events</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {status.recentEvents?.pump && status.recentEvents.pump.length > 0 ? (
                status.recentEvents.pump.map((event, idx) => (
                  <div key={idx} className="bg-slate-800/50 p-3 rounded text-sm">
                    <span className={event.PumpStatus === 'on' ? 'text-green-300' : 'text-red-300'}>
                      Pump turned {event.PumpStatus}
                    </span>
                    <p className="text-xs text-slate-400">
                      {new Date(event.TriggeredAt).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-slate-400">No recent pump events</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
function SensorCard({ title, value, unit, icon }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded p-4">
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-xs text-slate-400">{unit}</p>
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-xs text-slate-400">{title}</p>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded p-4 text-center">
      <p className="text-2xl font-bold text-blue-300">{value}</p>
      <p className="text-xs text-slate-400 mt-1">{title}</p>
    </div>
  );
}

export default Status;

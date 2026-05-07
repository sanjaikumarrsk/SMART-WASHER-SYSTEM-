import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import {
  Droplets,
  Zap,
  Gauge,
  Wifi,
  WifiOff,
  User,
  Clock,
  TrendingUp,
  RefreshCw,
} from 'lucide-react'
import { esp32Service } from '../services/esp32Service'

const DOTNET_API_URL = 'https://localhost:7099/api/Data/insert-update'
const API_BASE = 'http://localhost:7098/api'

const DashboardGauge = ({ value = 56 }) => {
  const data = [
    { name: 'Wash Progress', value: value },
    { name: 'Remaining', value: 100 - value },
  ]
  
  const COLORS = ['#4DA8DA', '#e0e0e0']

  return (
    <div className="flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            startAngle={180}
            endAngle={0}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="text-center -mt-12">
        <p className="text-5xl font-bold text-darkText">{value.toFixed(1)}</p>
        <p className="text-sm text-lightText">% Wash Cycle</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState('08:20:25')
  const [data, setData] = useState(esp32Service.snapshot())
  const [ipAddress, setIpAddress] = useState('192.168.1.100')
  const [tempIpInput, setTempIpInput] = useState('192.168.1.100')
  const [sensorHistory, setSensorHistory] = useState([])
  const [resourceHistory, setResourceHistory] = useState([])

  // Subscribe to esp32Service updates for real-time motor/pump status
  useEffect(() => {
    const unsubscribe = esp32Service.subscribe((snapshot) => {
      setData((prev) => ({
        ...prev,
        motorOn: snapshot.motorOn,
        pumpOn: snapshot.pumpOn,
        connected: snapshot.connected,
        connecting: snapshot.connecting,
        error: snapshot.error,
      }))
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    // Fetch dummy sensor data from backend every 2 seconds
    const fetchSensorData = async () => {
      try {
        const response = await fetch(`${API_BASE}/sensor-data/latest`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
        
        if (!response.ok) {
          console.error('[Dashboard] Failed to fetch sensor data:', response.status)
          return
        }

        const apiData = await response.json()
        console.log('[Dashboard] Latest sensor data:', apiData.data)

        // Update sensor data with latest reading
        if (apiData.data) {
          const latestReading = apiData.data
          
          // Add to history
          setSensorHistory((prev) => [...prev, {
            time: `${prev.length + 1}`,
            water_level: latestReading.water_level || 0,
            temperature: latestReading.temperature || 0,
            current: latestReading.current || 0,
            turbidity: latestReading.turbidity || 0,
            load_weight: latestReading.load_weight || 0,
          }].slice(-20))

          // Update current data display (sensor readings only - motor/pump status handled by subscription)
          setData((prev) => ({
            ...prev,
            sensor: {
              water_level: parseFloat(latestReading.water_level) || 0,
              turbidity: parseFloat(latestReading.turbidity) || 0,
              load_weight: parseFloat(latestReading.load_weight) || 0,
              current: parseFloat(latestReading.current) || 0,
              temperature: parseFloat(latestReading.temperature) || 0,
              motor_speed: latestReading.motor_speed || 0,
              pressure: parseFloat(latestReading.pressure) || 0,
              cycle_status: latestReading.cycle_status || 'idle',
            },
            cycle: {
              progress: parseFloat(latestReading.cycle_progress || latestReading.cycle_progress_percent || 65),
              status: latestReading.cycle_status || 'running',
            },
            resources: {
              water_used: parseFloat(latestReading.water_saved) || 0,
              energy_used: parseFloat(latestReading.energy_saved) || 0,
            },
            eco: {
              score: latestReading.eco_score || 85,
              efficiency: parseFloat(latestReading.efficiency_rating) || 92,
              savings_percent: latestReading.savings_percent || 28,
            },
          }))
        }
      } catch (err) {
        console.error('[Dashboard] Error fetching sensor data:', err)
      }
    }

    // Fetch immediately and then every 2 seconds for dynamic updates
    fetchSensorData()
    const interval = setInterval(fetchSensorData, 2000)

    // Cleanup
    return () => clearInterval(interval)
  }, [])

  // Clock timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      setCurrentTime(
        `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
      )
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleIpChange = () => {
    setIpAddress(tempIpInput)
    esp32Service.connectToESP32(tempIpInput)
  }

  const toggleMotor = () => {
    // Immediate visual feedback - toggle the state locally
    setData((prev) => ({
      ...prev,
      motorOn: !prev.motorOn,
    }))
    // Send command to service (will attempt to connect if needed)
    console.log('[Dashboard] Toggling motor...')
    esp32Service.toggleMotor()
  }

  const togglePump = () => {
    // Immediate visual feedback - toggle the state locally
    setData((prev) => ({
      ...prev,
      pumpOn: !prev.pumpOn,
    }))
    // Send command to service (will attempt to connect if needed)
    console.log('[Dashboard] Toggling pump...')
    esp32Service.togglePump()
  }

  const { connected, motorOn, pumpOn, sensor, cycle, error } = data

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header with Status */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-darkText">Smart Washer Control</h1>
            <p className="text-sm text-lightText">Real-time IoT Monitoring</p>
          </div>
          <div className="flex items-center gap-8">
            {/* IP Address Input */}
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm text-lightText">Server IP</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tempIpInput}
                    onChange={(e) => setTempIpInput(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded text-sm font-semibold text-darkText focus:outline-none focus:ring-2 focus:ring-blue-400 w-48"
                    placeholder="Enter IP address"
                  />
                  <button
                    onClick={handleIpChange}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-xs font-semibold hover:bg-blue-600 transition-colors"
                  >
                    Set
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {data.connecting ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-yellow-500 border-t-transparent animate-spin"></div>
                  <span className="text-sm font-medium text-yellow-600">Connecting...</span>
                </>
              ) : connected ? (
                <>
                  <Wifi size={20} className="text-green-500" />
                  <span className="text-sm font-medium text-green-600">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff size={20} className="text-red-500" />
                  <span className="text-sm font-medium text-red-600">Disconnected</span>
                </>
              )}
            </div>
            {error && (
              <div className="pl-8 border-l border-red-200">
                <p className="text-xs text-red-600 font-semibold max-w-xs">{error}</p>
              </div>
            )}
            {/* Motor Toggle Button */}
            <div className="pl-8 border-l border-gray-200">
              <button
                onClick={toggleMotor}
                disabled={!connected}
                className={`px-4 py-2 rounded font-semibold text-sm transition-all ${
                  !connected
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : motorOn
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                Motor {motorOn ? 'ON' : 'OFF'}
              </button>
            </div>
            {/* Pump Toggle Button */}
            <div className="pl-6 border-l border-gray-200">
              <button
                onClick={togglePump}
                disabled={!connected}
                className={`px-4 py-2 rounded font-semibold text-sm transition-all ${
                  !connected
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : pumpOn
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-purple-500 text-white hover:bg-purple-600'
                }`}
              >
                Pump {pumpOn ? 'ON' : 'OFF'}
              </button>
            </div>
            <div className="flex items-center gap-2 pl-8 border-l border-gray-200">
              <User size={20} className="text-darkText" />
              <div>
                <p className="text-xs text-lightText">User</p>
                <p className="text-sm font-semibold text-darkText">Admin</p>
              </div>
            </div>
            <div className="flex items-center gap-2 pl-8 border-l border-gray-200">
              <Clock size={20} className="text-darkText" />
              <div>
                <p className="text-xs text-lightText">Time</p>
                <p className="text-sm font-semibold text-darkText">{currentTime}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-h-screen bg-gray-50">
        {/* Left Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 p-6 shadow-sm">
          <div className="space-y-6">
            {/* Motor Status */}
            <div className={`p-4 rounded-lg border ${
              motorOn
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200'
            }`}>
              <h3 className="text-sm font-bold text-darkText mb-3">MOTOR STATUS</h3>
              <p className={`text-3xl font-bold mb-1 ${motorOn ? 'text-green-600' : 'text-red-600'}`}>
                {motorOn ? 'ON' : 'OFF'}
              </p>
              <p className="text-xs text-lightText">
                {motorOn ? 'Running' : 'Stopped'}
              </p>
            </div>

            {/* Pump Status */}
            <div className={`p-4 rounded-lg border ${
              pumpOn
                ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200'
                : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'
            }`}>
              <h3 className="text-sm font-bold text-darkText mb-3">PUMP STATUS</h3>
              <p className={`text-3xl font-bold mb-1 ${pumpOn ? 'text-blue-600' : 'text-purple-600'}`}>
                {pumpOn ? 'ON' : 'OFF'}
              </p>
              <p className="text-xs text-lightText">
                {pumpOn ? 'Pumping' : 'Idle'}
              </p>
            </div>

            {/* Current Status */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-100">
              <h3 className="text-sm font-bold text-darkText mb-3">CURRENT WASH CYCLE</h3>
              <p className="text-3xl font-bold text-blue-600 mb-1">{cycle.progress?.toFixed(1) || '0.0'}</p>
              <p className="text-xs text-lightText">% Progress</p>
            </div>

            {/* Details */}
            <div className="space-y-4">
              <div className="border-b border-gray-100 pb-3">
                <p className="text-xs font-bold text-lightText uppercase mb-1">Fabric Type</p>
                <p className="text-sm font-semibold text-darkText">—</p>
              </div>
              <div className="border-b border-gray-100 pb-3">
                <p className="text-xs font-bold text-lightText uppercase mb-1">Wash Mode</p>
                <p className="text-sm font-semibold text-darkText">—</p>
              </div>
              <div className="border-b border-gray-100 pb-3">
                <p className="text-xs font-bold text-lightText uppercase mb-1">Start Time</p>
                <p className="text-sm font-semibold text-darkText">—</p>
              </div>
              <div>
                <p className="text-xs font-bold text-lightText uppercase mb-1">End Time</p>
                <p className="text-sm font-semibold text-darkText">—</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="grid grid-cols-5 gap-4 mb-8">
            {/* Water Level Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-lightText uppercase">Water Level</p>
                <Droplets size={16} className="text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-darkText">{sensor.water_level?.toFixed(1) || '0.0'}</p>
              <p className="text-xs text-lightText mt-1">%</p>
            </motion.div>

            {/* Turbidity Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-lightText uppercase">Turbidity</p>
                <Gauge size={16} className="text-cyan-500" />
              </div>
              <p className="text-3xl font-bold text-darkText">{sensor.turbidity?.toFixed(1) || '0.0'}</p>
              <p className="text-xs text-lightText mt-1">NTU</p>
            </motion.div>

            {/* Load Weight Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-lightText uppercase">Load Weight</p>
                <Gauge size={16} className="text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-darkText">{sensor.load_weight?.toFixed(1) || '0.0'}</p>
              <p className="text-xs text-lightText mt-1">kg</p>
            </motion.div>

            {/* Current Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-lightText uppercase">Current</p>
                <Zap size={16} className="text-yellow-500" />
              </div>
              <p className="text-3xl font-bold text-darkText">{sensor.current?.toFixed(1) || '0.0'}</p>
              <p className="text-xs text-lightText mt-1">A</p>
            </motion.div>

            {/* Temperature Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-lightText uppercase">Temperature</p>
                <span className="text-xs font-bold text-red-500">🌡</span>
              </div>
              <p className="text-3xl font-bold text-darkText">{sensor.temperature?.toFixed(1) || '0.0'}</p>
              <p className="text-xs text-lightText mt-1">°C</p>
            </motion.div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-3 gap-6">
            {/* Left Column - Washing Drum Visualization */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="col-span-1 bg-white rounded-lg p-6 shadow-sm border border-gray-100"
            >
              <h3 className="text-sm font-bold text-darkText mb-4 uppercase">Washing Drum</h3>
              <DashboardGauge value={cycle.progress || 0} />
            </motion.div>

            {/* Center Column - Efficiency & Savings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="col-span-1 space-y-4"
            >
              {/* Efficiency Rating */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-darkText mb-4 uppercase">Efficiency Rating</h3>
                <div className="flex flex-col items-center justify-center">
                  <div className="w-32 h-32 rounded-full border-4 border-blue-200 flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
                    <span className="text-4xl font-bold text-blue-600">{data.eco?.efficiency?.toFixed(0) || '—'}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Savings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="col-span-1 space-y-4"
            >
              {/* Water Saved */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <Droplets size={20} className="text-blue-500" />
                  <div>
                    <p className="text-xs font-bold text-lightText">Water Saved</p>
                    <p className="text-2xl font-bold text-darkText">{data.resources?.water_used?.toFixed(1) || '0'}</p>
                    <p className="text-xs text-lightText">L</p>
                  </div>
                </div>
              </div>

              {/* Energy Saved */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <Zap size={20} className="text-yellow-500" />
                  <div>
                    <p className="text-xs font-bold text-lightText">Energy Saved</p>
                    <p className="text-2xl font-bold text-darkText">{data.resources?.energy_used?.toFixed(3) || '0'}</p>
                    <p className="text-xs text-lightText">kWh</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ═══ KPI Charts Section ═══ */}
          <div className="mt-12">
            <h2 className="text-lg font-bold text-darkText mb-6 flex items-center gap-2">
              <TrendingUp size={24} className="text-blue-500" />
              Performance Analytics
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sensor Trends Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-100"
              >
                <h3 className="text-sm font-bold text-darkText mb-4 uppercase">Sensor Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={sensorHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="time" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                      labelStyle={{ color: '#0f172a' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="water_level" stroke="#3b82f6" strokeWidth={2} name="Water Level %" />
                    <Line type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={2} name="Temperature °C" />
                    <Line type="monotone" dataKey="current" stroke="#f59e0b" strokeWidth={2} name="Current A" />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Resource Consumption Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-100"
              >
                <h3 className="text-sm font-bold text-darkText mb-4 uppercase">Resource Consumption</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={resourceHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="time" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                      labelStyle={{ color: '#0f172a' }}
                    />
                    <Legend />
                    <Bar dataKey="water_used" fill="#3b82f6" name="Water (L)" />
                    <Bar dataKey="energy_used" fill="#f59e0b" name="Energy (Wh)" />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Turbidity & Load Trend */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-100"
              >
                <h3 className="text-sm font-bold text-darkText mb-4 uppercase">Water Quality</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={sensorHistory}>
                    <defs>
                      <linearGradient id="colorTurbidity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="time" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                      labelStyle={{ color: '#0f172a' }}
                    />
                    <Area type="monotone" dataKey="turbidity" stroke="#06b6d4" fillOpacity={1} fill="url(#colorTurbidity)" name="Turbidity (NTU)" />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Efficiency & Eco Score */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-100"
              >
                <h3 className="text-sm font-bold text-darkText mb-4 uppercase">Efficiency Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* Eco Score */}
                  <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
                    <p className="text-xs text-green-600 font-semibold mb-2">ECO SCORE</p>
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      <div className="absolute w-24 h-24 rounded-full border-4 border-green-200 opacity-30"></div>
                      <p className="text-3xl font-bold text-green-600">{data.eco?.score || 0}</p>
                    </div>
                    <p className="text-xs text-green-600 mt-2">/ 100</p>
                  </div>

                  {/* Efficiency Rating */}
                  <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                    <p className="text-xs text-blue-600 font-semibold mb-2">EFFICIENCY</p>
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      <div className="absolute w-24 h-24 rounded-full border-4 border-blue-200 opacity-30"></div>
                      <p className="text-3xl font-bold text-blue-600">{data.eco?.efficiency || 0}%</p>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">Usage</p>
                  </div>

                  {/* Savings */}
                  <div className="col-span-2 flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                    <div>
                      <p className="text-xs text-purple-600 font-semibold">COST SAVINGS</p>
                      <p className="text-2xl font-bold text-purple-600 mt-1">{data.eco?.savings_percent || 0}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-purple-600">vs Standard</p>
                      <p className="text-sm text-purple-500 mt-1">optimized</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

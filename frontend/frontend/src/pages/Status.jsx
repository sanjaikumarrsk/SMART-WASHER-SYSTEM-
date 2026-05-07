import React, { useState, useEffect } from 'react'
import { esp32Service } from '../services/esp32Service'

const API_BASE = 'http://localhost:7098/api'
const BACKEND_ROOT = 'http://localhost:7098'

export default function Status() {
  // Connection States
  const [backendOnline, setBackendOnline] = useState(false)
  const [databaseOnline, setDatabaseOnline] = useState(false)
  const [esp32Connected, setEsp32Connected] = useState(false)
  const [esp32IP, setEsp32IP] = useState(null)
  const [esp32InputIP, setEsp32InputIP] = useState('')

  // Sensor Data (null = no data)
  const [sensorData, setSensorData] = useState(null)
  const [sensorError, setSensorError] = useState(false)

  // Control States
  const [motorOn, setMotorOn] = useState(false)
  const [pumpOn, setPumpOn] = useState(false)
  const [cycleRunning, setCycleRunning] = useState(false)
  const [fabricType, setFabricType] = useState('cotton')
  const [washMode, setWashMode] = useState('normal')
  const [controlLoading, setControlLoading] = useState(false)
  const [connectLoading, setConnectLoading] = useState(false)

  // Activity Log
  const [activities, setActivities] = useState([])

  const addActivity = (event) => {
    console.log('[Activity]', event)
    setActivities((prev) => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        event,
      },
      ...prev,
    ].slice(0, 20))
  }

  // Safe API Call
  const safeApiCall = async (url, options = {}) => {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })

      clearTimeout(timeout)
      return response
    } catch (error) {
      console.error('API call error:', error)
      return null
    }
  }

  // Connect to ESP32
  const handleConnectESP32 = async () => {
    if (!esp32InputIP.trim()) {
      addActivity('❌ Please enter an ESP32 IP address')
      return
    }

    setConnectLoading(true)
    addActivity(`🔌 Connecting to ESP32 at ${esp32InputIP}...`)

    // Use esp32Service to connect
    esp32Service.connectToESP32(esp32InputIP)
    
    // Wait for connection status to update
    setTimeout(() => {
      const status = esp32Service.snapshot()
      if (status.connected) {
        setEsp32IP(esp32InputIP)
        setEsp32InputIP('')
        addActivity(`✅ Connected to ESP32 at ${esp32InputIP}`)
      } else {
        addActivity(`❌ Failed to connect to ESP32: ${status.error || 'Unknown error'}`)
      }
      setConnectLoading(false)
    }, 1500)
  }

  // Disconnect from ESP32
  const handleDisconnectESP32 = async () => {
    setConnectLoading(true)
    addActivity('🔌 Disconnecting from ESP32...')

    // Use esp32Service to disconnect
    esp32Service.disconnectFromESP32()
    
    setEsp32IP(null)
    setEsp32InputIP('')
    setEsp32Connected(false)
    setMotorOn(false)
    setPumpOn(false)
    addActivity('✅ Disconnected from ESP32')
    
    setConnectLoading(false)
  }

  // Fetch ESP32 Status
  const fetchEsp32Status = async () => {
    try {
      const response = await safeApiCall(`${BACKEND_ROOT}`)

      if (!response) {
        setBackendOnline(false)
        setDatabaseOnline(false)
        setEsp32Connected(false)
        return
      }

      if (response.ok) {
        const data = await response.json()
        setBackendOnline(true)
        setDatabaseOnline(data.database === 'connected' || data.healthy === true)
      } else {
        setBackendOnline(false)
        setDatabaseOnline(false)
      }

      // Also check ESP32 status
      const esp32Response = await safeApiCall(`${API_BASE}/esp32/status`)
      if (esp32Response?.ok) {
        const esp32Data = await esp32Response.json()
        setEsp32Connected(esp32Data.connected === true)
        if (esp32Data.ip) setEsp32IP(esp32Data.ip)
      } else {
        setEsp32Connected(false)
      }
    } catch (error) {
      console.error('ESP32 status error:', error)
      setBackendOnline(false)
      setDatabaseOnline(false)
      setEsp32Connected(false)
    }
  }

  // Fetch Sensor Data
  const fetchSensorData = async () => {
    try {
      const response = await safeApiCall(`${API_BASE}/sensor-data/latest`)

      if (!response) {
        setSensorData(null)
        setSensorError(true)
        return
      }

      if (response.ok) {
        const data = await response.json()
        if (data.data) {
          setSensorData({
            waterLevel: data.data.water_level ?? null,
            temperature: data.data.temperature ?? null,
            turbidity: data.data.turbidity ?? null,
            loadWeight: data.data.load_weight ?? null,
            current: data.data.current ?? null,
            drumSpeed: data.data.drum_speed ?? null,
            pumpStatus: data.data.pump_status ?? null,
            motorStatus: data.data.motor_status ?? null,
            recordedAt: data.data.recorded_at ?? null,
          })
          setSensorError(false)
        } else {
          setSensorData(null)
          setSensorError(false)
        }
      } else {
        setSensorData(null)
        setSensorError(true)
      }
    } catch (error) {
      console.error('Sensor data error:', error)
      setSensorData(null)
      setSensorError(true)
    }
  }

  // Initial load and polling
  useEffect(() => {
    addActivity('🚀 Status page loaded')
    
    // Subscribe to ESP32 service
    const unsubscribe = esp32Service.subscribe((serviceData) => {
      setEsp32Connected(serviceData.connected)
      if (serviceData.connected && esp32Service.currentIP) {
        setEsp32IP(esp32Service.currentIP)
      }
      setMotorOn(serviceData.motorOn)
      setPumpOn(serviceData.pumpOn)
    })

    // Fetch initial sensor data and backend status
    fetchEsp32Status()
    fetchSensorData()

    const sensorInterval = setInterval(fetchSensorData, 2000)
    const backendInterval = setInterval(fetchEsp32Status, 2000)

    return () => {
      clearInterval(sensorInterval)
      clearInterval(backendInterval)
      unsubscribe()
      esp32Service.stop()
    }
  }, [])

  // Handle Motor Toggle
  const handleMotorToggle = async () => {
    setControlLoading(true)
    try {
      const response = await safeApiCall(`${API_BASE}/motor-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motor_status: !motorOn }),
      })

      if (response?.ok) {
        setMotorOn(!motorOn)
        addActivity(`✅ Motor turned ${!motorOn ? 'ON' : 'OFF'}`)
      } else {
        addActivity('❌ Motor control failed')
      }
    } catch (error) {
      addActivity('❌ Motor control error')
    } finally {
      setControlLoading(false)
    }
  }

  // Handle Pump Toggle
  const handlePumpToggle = async () => {
    setControlLoading(true)
    try {
      const response = await safeApiCall(`${API_BASE}/pump-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pump_status: !pumpOn }),
      })

      if (response?.ok) {
        setPumpOn(!pumpOn)
        addActivity(`✅ Pump turned ${!pumpOn ? 'ON' : 'OFF'}`)
      } else {
        addActivity('❌ Pump control failed')
      }
    } catch (error) {
      addActivity('❌ Pump control error')
    } finally {
      setControlLoading(false)
    }
  }

  // Handle Start Cycle
  const handleStartCycle = async () => {
    if (!backendOnline || !esp32Connected) {
      addActivity('❌ Cannot start cycle: Backend or ESP32 offline')
      return
    }

    setControlLoading(true)
    try {
      const response = await safeApiCall(`${API_BASE}/Data/insert-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fabric_type: fabricType,
          wash_mode: washMode,
          cycle_status: 'running',
        }),
      })

      if (response?.ok) {
        setCycleRunning(true)
        addActivity(`✅ Cycle started: ${fabricType} - ${washMode}`)
      } else {
        addActivity('❌ Cycle start failed')
      }
    } catch (error) {
      addActivity('❌ Cycle start error')
    } finally {
      setControlLoading(false)
    }
  }

  // Handle Stop Cycle
  const handleStopCycle = async () => {
    setControlLoading(true)
    try {
      const response = await safeApiCall(`${API_BASE}/Data/insert-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cycle_status: 'stopped' }),
      })

      if (response?.ok) {
        setCycleRunning(false)
        setMotorOn(false)
        setPumpOn(false)
        addActivity('✅ Cycle stopped')
      } else {
        addActivity('❌ Cycle stop failed')
      }
    } catch (error) {
      addActivity('❌ Cycle stop error')
    } finally {
      setControlLoading(false)
    }
  }

  // Handle Connect ESP32
  const handleConnectEsp32 = () => {
    handleConnectESP32()
  }

  // Handle Disconnect ESP32
  const handleDisconnectEsp32 = () => {
    handleDisconnectESP32()
  }

  // Sensor Card Component
  const SensorCard = ({ icon, label, value, unit, max = 100 }) => {
    const displayValue = value === null || value === undefined ? '--' : value.toFixed(1)
    const hasData = value !== null && value !== undefined

    if (!hasData) {
      return (
        <div className="bg-white/80 border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{icon}</span>
            <span className="text-slate-600 text-xs font-medium">{label}</span>
          </div>
          <div className="text-slate-400 text-xs">No data</div>
        </div>
      )
    }

    const percentage = Math.min((value / max) * 100, 100)

    return (
      <div className="bg-white/80 border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{icon}</span>
            <span className="text-slate-600 text-xs font-medium uppercase tracking-wide">{label}</span>
          </div>
          <span className="text-slate-900 text-lg font-semibold">
            {displayValue}<span className="text-slate-500 text-sm">{unit}</span>
          </span>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-slate-50 pt-20 pb-12">
      {/* Error Banners */}
      {!backendOnline && (
        <div className="mx-auto max-w-7xl px-6 mb-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-3">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">🔴 Backend API is offline. System controls disabled.</span>
          </div>
        </div>
      )}

      {backendOnline && !databaseOnline && (
        <div className="mx-auto max-w-7xl px-6 mb-4">
          <div className="p-4 bg-orange-50 border-2 border-orange-300 rounded-lg text-orange-900 shadow-md">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-1 flex-shrink-0 animate-pulse"></div>
              <div className="flex-1">
                <p className="text-sm font-semibold mb-1">🟠 Database Offline - Fallback Mode Active</p>
                <p className="text-xs leading-relaxed">Local database connection failed. Sensor data is being forwarded to .NET API instead (https://localhost:7099/api/Data/insert-update). Local data recording is disabled, but the system remains operational.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {backendOnline && !esp32Connected && (
        <div className="mx-auto max-w-7xl px-6 mb-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 flex items-center gap-3">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-sm font-medium">🟡 ESP32 is not connected. Waiting for device...</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-slate-900 mb-1">Status Dashboard</h1>
          <p className="text-slate-500 text-sm">Real-time IoT control center</p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT SIDE */}
          <div className="lg:col-span-1 space-y-6">
            {/* Connection Status Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
              <h2 className="text-sm font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                Connection Status
              </h2>

              {/* System Mode */}
              {backendOnline && (
                <div className="mb-6 pb-6 border-b border-slate-100">
                  <div className="text-xs font-medium text-slate-600 mb-2">System Mode</div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {databaseOnline ? (
                        <>
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="text-sm font-medium text-green-700">Normal</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                          <span className="text-sm font-medium text-orange-700">Fallback</span>
                        </>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded">
                      {databaseOnline ? 'Recording to DB' : '→ .NET API'}
                    </span>
                  </div>
                </div>
              )}

              {/* API Status */}
              <div className="mb-6 pb-6 border-b border-slate-100">
                <div className="text-xs font-medium text-slate-600 mb-2">Backend API</div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`text-sm font-medium ${backendOnline ? 'text-green-700' : 'text-red-700'}`}>
                      {backendOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">localhost:7098</span>
                </div>
              </div>

              {/* Database Status */}
              {backendOnline && (
                <div className="mb-6 pb-6 border-b border-slate-100">
                  <div className="text-xs font-medium text-slate-600 mb-2">Database</div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${databaseOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className={`text-sm font-medium ${databaseOnline ? 'text-green-700' : 'text-red-700'}`}>
                        {databaseOnline ? 'Connected' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ESP32 Status */}
              <div className="mb-6 pb-6 border-b border-slate-100">
                <div className="text-xs font-medium text-slate-600 mb-2">ESP32 Module</div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${esp32Connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`text-sm font-medium ${esp32Connected ? 'text-green-700' : 'text-red-700'}`}>
                      {esp32Connected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                  {esp32Connected && esp32IP && (
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {esp32IP}
                    </span>
                  )}
                </div>
              </div>

              {/* Buttons */}
              {!esp32Connected ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={esp32InputIP}
                    onChange={(e) => setEsp32InputIP(e.target.value)}
                    placeholder="Enter ESP32 IP (e.g., 192.168.1.100)"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleConnectEsp32}
                    disabled={connectLoading || !esp32InputIP.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition-colors"
                  >
                    {connectLoading ? 'Connecting...' : 'Connect'}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-600 font-medium">Connected to:</p>
                    <p className="text-sm font-semibold text-blue-900">{esp32IP}</p>
                  </div>
                  <button
                    onClick={handleDisconnectEsp32}
                    disabled={connectLoading}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition-colors"
                  >
                    {connectLoading ? 'Disconnecting...' : 'Disconnect'}
                  </button>
                </div>
              )}
            </div>

            {/* Machine Control Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
              <h2 className="text-sm font-semibold text-slate-900 mb-6">Machine Control</h2>

              {!backendOnline || !esp32Connected ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  <div className="mb-2">🔌</div>
                  {!backendOnline ? 'Backend offline' : 'ESP32 offline'}
                </div>
              ) : (
                <>
                  {/* Motor */}
                  <div className="mb-6 pb-6 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-slate-900">Motor</label>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${motorOn ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                        <span className="text-xs font-medium text-slate-600">{motorOn ? 'ON' : 'OFF'}</span>
                      </div>
                    </div>
                    <button
                      onClick={handleMotorToggle}
                      disabled={!esp32Connected || controlLoading}
                      className={`w-12 h-7 rounded-full transition-colors ${
                        motorOn ? 'bg-blue-500' : 'bg-slate-300'
                      } ${!esp32Connected || controlLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} relative`}
                    >
                      <div
                        className={`absolute w-6 h-6 bg-white rounded-full top-0.5 transition-transform ${
                          motorOn ? 'translate-x-5' : 'translate-x-0.5'
                        } shadow-sm`}
                      ></div>
                    </button>
                  </div>

                  {/* Pump */}
                  <div className="mb-6 pb-6 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-slate-900">Pump</label>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${pumpOn ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                        <span className="text-xs font-medium text-slate-600">{pumpOn ? 'ON' : 'OFF'}</span>
                      </div>
                    </div>
                    <button
                      onClick={handlePumpToggle}
                      disabled={!esp32Connected || controlLoading}
                      className={`w-12 h-7 rounded-full transition-colors ${
                        pumpOn ? 'bg-blue-500' : 'bg-slate-300'
                      } ${!esp32Connected || controlLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} relative`}
                    >
                      <div
                        className={`absolute w-6 h-6 bg-white rounded-full top-0.5 transition-transform ${
                          pumpOn ? 'translate-x-5' : 'translate-x-0.5'
                        } shadow-sm`}
                      ></div>
                    </button>
                  </div>

                  {/* Fabric Type */}
                  <div className="mb-6 pb-6 border-b border-slate-100">
                    <label className="text-sm font-medium text-slate-900 mb-2 block">Fabric Type</label>
                    <select
                      value={fabricType}
                      onChange={(e) => setFabricType(e.target.value)}
                      disabled={cycleRunning || !esp32Connected}
                      className="w-full border border-slate-200 text-slate-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
                    >
                      <option value="cotton">Cotton</option>
                      <option value="wool">Wool</option>
                      <option value="silk">Silk</option>
                      <option value="synthetic">Synthetic</option>
                    </select>
                  </div>

                  {/* Wash Mode */}
                  <div className="mb-6 pb-6 border-b border-slate-100">
                    <label className="text-sm font-medium text-slate-900 mb-2 block">Wash Mode</label>
                    <select
                      value={washMode}
                      onChange={(e) => setWashMode(e.target.value)}
                      disabled={cycleRunning || !esp32Connected}
                      className="w-full border border-slate-200 text-slate-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
                    >
                      <option value="eco">Eco</option>
                      <option value="normal">Normal</option>
                      <option value="quick">Quick</option>
                      <option value="delicate">Delicate</option>
                    </select>
                  </div>

                  {cycleRunning && (
                    <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
                      Cycle running...
                    </div>
                  )}

                  {/* Cycle Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleStartCycle}
                      disabled={cycleRunning || !esp32Connected || controlLoading}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition-colors"
                    >
                      Start
                    </button>
                    <button
                      onClick={handleStopCycle}
                      disabled={!cycleRunning || controlLoading}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition-colors"
                    >
                      Stop
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live Sensor Data */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
              <h2 className="text-sm font-semibold text-slate-900 mb-6">Live Sensor Data</h2>

              {!backendOnline ? (
                <div className="text-center py-12 text-slate-400 text-sm">Backend offline</div>
              ) : sensorError ? (
                <div className="text-center py-12 text-slate-400 text-sm">No live data</div>
              ) : !sensorData ? (
                <div className="text-center py-12 text-slate-400 text-sm">Waiting for ESP32 data...</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <SensorCard icon="💧" label="Water" value={sensorData.waterLevel} unit="%" max={100} />
                  <SensorCard icon="🌡️" label="Temp" value={sensorData.temperature} unit="°C" max={60} />
                  <SensorCard icon="🌫️" label="Turbidity" value={sensorData.turbidity} unit="%" max={100} />
                  <SensorCard icon="⚖️" label="Load" value={sensorData.loadWeight} unit="kg" max={10} />
                  <SensorCard icon="⚡" label="Current" value={sensorData.current} unit="A" max={15} />
                  <SensorCard icon="🔄" label="Speed" value={sensorData.drumSpeed} unit="RPM" max={1600} />
                </div>
              )}

              <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-100 pt-4">
                Updated {new Date().toLocaleTimeString()} • Refresh: 3s
              </div>
            </div>

            {/* Activity Log */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
              <h2 className="text-sm font-semibold text-slate-900 mb-6">Activity Log</h2>

              {activities.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">No activities yet</div>
              ) : (
                <div className="space-y-1 max-h-80 overflow-y-auto">
                  {activities.map((activity, idx) => (
                    <div
                      key={activity.id}
                      className={`flex items-start gap-3 p-3 text-sm ${
                        idx !== activities.length - 1 ? 'border-b border-slate-100' : ''
                      }`}
                    >
                      <span className="text-lg">📝</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-slate-900">{activity.event}</div>
                        <div className="text-slate-500 text-xs mt-0.5">{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
                {activities.length} events
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

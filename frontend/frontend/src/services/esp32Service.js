/**
 * ESP32 Service — connects to ESP32 via WebSocket for real-time sensor data.
 */

const stamp = () =>
  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

const MAX_HISTORY = 30;
const CONNECT_TIMEOUT_MS = 8000;
const HEARTBEAT_CHECK_MS = 10000;
const MESSAGE_STALE_MS = 60000;
const RECONNECT_MIN_MS = 2000;
const RECONNECT_MAX_MS = 15000;
const LAST_ESP32_IP_KEY = 'washer_last_esp32_ip';
const SAMPLE_REFRESH_MS = 12000;

// Backend API URL — auto-detect based on frontend location
const getBackendURL = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:7099/api';
  }
  return `http://${window.location.hostname}:7099/api`;
};
const BACKEND_URL = getBackendURL();

class ESP32Service {
  constructor() {
    this._subs = [];
    this._ws = null;
    this._reconnectTimer = null;
    this._connectTimeout = null;
    this._heartbeatTimer = null;
    this._wantsConnection = false;
    this._lastMessageAt = 0;
    this._reconnectDelayMs = RECONNECT_MIN_MS;
    this._sampleTimer = null;

    this._sensor = { water_level: 0, temperature: 0, washer_speed: 0, turbidity: 0, load_weight: 0, current: 0 };
    this._history = [];
    this._sample = {
      sensor: { water_level: 0, temperature: 0, washer_speed: 0, turbidity: 0, load_weight: 0, current: 0 },
      history: [],
    };
    this._connected = false;
    this._connecting = false;
    this._motorOn = false;
    this._pumpOn = false;
    this._motorOverrideUntil = 0; // ignore ESP32 motor_status until this timestamp
    this._pumpOverrideUntil = 0;  // ignore ESP32 pump_status until this timestamp
    this._ip = '';
    this._error = '';

    this._cycle = {
      fabric_type: '—',
      wash_mode: '—',
      status: 'Idle',
      start_time: null,
      end_time: null,
      load_weight: 0,
    };

    this._resources = { water_used: 0, energy_used: 0, duration_min: 0 };
    this._eco = { water_saved: 0, energy_saved: 0, eco_rating: '—', remarks: 'No cycle data yet.' };
  }

  connectToESP32(ip) {
    this._cleanup();

    this._ip = ip;
    try {
      localStorage.setItem(LAST_ESP32_IP_KEY, ip);
    } catch {}
    this._wantsConnection = true;
    this._connecting = true;
    this._connected = false;
    this._error = '';
    this._notify();

    const url = `ws://${ip}/ws`;
    console.log(`[ESP32] Connecting to ${url}...`);

    try {
      this._ws = new WebSocket(url);
    } catch (err) {
      console.error('[ESP32] Invalid WebSocket URL:', err);
      this._connecting = false;
      this._error = 'Invalid address';
      this._notify();
      return;
    }

    // Connection timeout — 5 seconds
    this._connectTimeout = setTimeout(() => {
      if (!this._connected) {
        console.warn('[ESP32] Connection timed out');
        this._error = 'Connection timed out — check IP and ESP32 power';
        this._cleanup();
        this._connecting = false;
        this._notify();
        this._scheduleReconnect();
      }
    }, CONNECT_TIMEOUT_MS);

    this._ws.onopen = () => {
      clearTimeout(this._connectTimeout);
      this._connectTimeout = null;
      console.log('[ESP32] ✓ Connected!');
      this._connected = true;
      this._connecting = false;
      this._error = '';
      this._reconnectDelayMs = RECONNECT_MIN_MS;
      this._lastMessageAt = Date.now();
      this._startHeartbeatMonitor();
      this._notify();
    };

    this._ws.onmessage = (event) => {
      this._lastMessageAt = Date.now();
      try {
        const data = JSON.parse(event.data);
        this._handleIncomingData(data);
      } catch (err) {
        console.warn('[ESP32] Parse error:', err);
      }
    };

    this._ws.onerror = (err) => {
      console.error('[ESP32] WebSocket error:', err);
      // Don't change state here — onclose always follows onerror in browsers
    };

    this._ws.onclose = (e) => {
      clearTimeout(this._connectTimeout);
      this._connectTimeout = null;
      this._stopHeartbeatMonitor();
      const wasConnected = this._connected;
      this._connected = false;
      this._connecting = false;
      this._ws = null;

      if (wasConnected) {
        console.log('[ESP32] Connection lost');
        this._error = 'Connection lost — reconnecting...';
      } else {
        console.log('[ESP32] Could not connect');
        this._error = 'Could not connect — is ESP32 on same WiFi?';
      }

      this._loadSampleData();
      this._notify();
      this._scheduleReconnect();
    };
  }

  /** Disconnect from ESP32 */
  disconnectFromESP32() {
    this._wantsConnection = false;
    this._ip = '';
    try {
      localStorage.removeItem(LAST_ESP32_IP_KEY);
    } catch {}
    this._cleanup();

    this._connected = false;
    this._connecting = false;
    this._motorOn = false;
    this._pumpOn = false;
    this._error = '';
    this._zeroSensors();
    this._loadSampleData();
    this._notify();
  }

  /** Send a command to ESP32 */
  sendCommand(cmd) {
    if (this._ws && this._ws.readyState === WebSocket.OPEN) {
      this._ws.send(JSON.stringify(cmd));
      console.log('[ESP32] Sent:', cmd);
      return true;
    }
    console.warn('[ESP32] Cannot send — not connected');
    return false;
  }

  startCycle(opts = {}) {
    this.sendCommand({ action: 'start_cycle', ...opts });
  }

  stopCycle() {
    this.sendCommand({ action: 'stop_cycle' });
  }

  /** Toggle motor on/off */
  toggleMotor() {
    if (!this._connected) {
      console.warn('[ESP32] Motor toggle ignored — not connected to ESP32');
      return;
    }
    const newState = !this._motorOn;
    this._motorOn = newState;
    this._motorOverrideUntil = Date.now() + 3000;
    const sent = this.sendCommand({ action: 'motor', state: newState ? 'on' : 'off' });
    if (!sent) {
      this._motorOn = !newState;
    }
    fetch(`${BACKEND_URL}/motor-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motor_status: newState ? 'on' : 'off' }),
    }).catch(() => {});
    this._notify();
  }

  /** Toggle pump on/off */
  togglePump() {
    if (!this._connected) {
      console.warn('[ESP32] Pump toggle ignored — not connected to ESP32');
      return;
    }
    const newState = !this._pumpOn;
    this._pumpOn = newState;
    this._pumpOverrideUntil = Date.now() + 3000;
    const sent = this.sendCommand({ action: 'pump', state: newState ? 'on' : 'off' });
    if (!sent) {
      this._pumpOn = !newState;
    }
    fetch(`${BACKEND_URL}/pump-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pump_status: newState ? 'on' : 'off' }),
    }).catch(() => {});
    this._notify();
  }

  subscribe(fn) {
    this._subs.push(fn);
    return () => {
      this._subs = this._subs.filter((s) => s !== fn);
    };
  }

  snapshot() {
    const useSampleData = this._shouldUseSampleData();
    return {
      connected: this._connected,
      connecting: this._connecting,
      motorOn: this._motorOn,
      pumpOn: this._pumpOn,
      error: this._error,
      usingSampleData: useSampleData,
      sensor: useSampleData ? { ...this._sample.sensor } : { ...this._sensor },
      cycle: { ...this._cycle },
      resources: { ...this._resources },
      eco: { ...this._eco },
      history: useSampleData ? [...this._sample.history] : [...this._history],
    };
  }

  /* ── kept for backward compat ── */
  start() {
    if (this._connected || this._connecting || this._wantsConnection) return;
    this._startSamplePolling();
    this._loadSampleData();
    try {
      const savedIp = localStorage.getItem(LAST_ESP32_IP_KEY);
      if (savedIp) {
        this.connectToESP32(savedIp);
      }
    } catch {}
  }
  stop() {
    // Keep connection alive across transient remounts in development.
  }

  _shouldUseSampleData() {
    return !this._connected || !!this._error;
  }

  async _loadSampleData() {
    try {
      const response = await fetch(`${BACKEND_URL}/Data/getall`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: MAX_HISTORY }),
      });

      if (!response.ok) {
        throw new Error(`Sample API failed: ${response.status}`);
      }

      const payload = await response.json();
      const latest = payload?.latest || {};
      const history = Array.isArray(payload?.history) ? payload.history : [];

      this._sample.sensor = {
        water_level: Number(latest.water_level) || 0,
        temperature: Number(latest.temperature) || 0,
        washer_speed: Number(latest.washer_speed) || 0,
        turbidity: Number(latest.turbidity) || 0,
        load_weight: Number(latest.load_weight) || 0,
        current: Number(latest.current) || 0,
      };

      this._sample.history = history.map((row) => ({
        time: row.time || stamp(),
        water_level: Number(row.water_level) || 0,
        temperature: Number(row.temperature) || 0,
        washer_speed: Number(row.washer_speed) || 0,
        energy: Number(row.energy) || 0,
      }));

      if (this._shouldUseSampleData()) {
        this._notify();
      }
    } catch {
      if (this._sample.history.length === 0) {
        this._sample.history = Array.from({ length: MAX_HISTORY }, (_, idx) => ({
          time: stamp(),
          water_level: +(52 + Math.sin(idx / 3) * 10).toFixed(1),
          temperature: +(28 + Math.cos(idx / 4) * 2).toFixed(1),
          washer_speed: idx % 2 === 0 ? 780 : 650,
          energy: +(0.12 + idx * 0.006).toFixed(3),
        }));

        this._sample.sensor = {
          water_level: 56,
          temperature: 29,
          washer_speed: 760,
          turbidity: 34,
          load_weight: 3.1,
          current: 1.6,
        };
      }

      if (this._shouldUseSampleData()) {
        this._notify();
      }
    }
  }

  _startSamplePolling() {
    if (this._sampleTimer) return;
    this._sampleTimer = setInterval(() => {
      if (this._shouldUseSampleData()) {
        this._loadSampleData();
      }
    }, SAMPLE_REFRESH_MS);
  }

  /* ── internals ── */

  _cleanup() {
    clearTimeout(this._connectTimeout);
    clearTimeout(this._reconnectTimer);
    clearInterval(this._heartbeatTimer);
    this._connectTimeout = null;
    this._reconnectTimer = null;
    this._heartbeatTimer = null;
    if (this._ws) {
      this._ws.onopen = null;
      this._ws.onclose = null;
      this._ws.onerror = null;
      this._ws.onmessage = null;
      try { this._ws.close(); } catch {}
      this._ws = null;
    }
  }

  _scheduleReconnect() {
    if (this._reconnectTimer || !this._wantsConnection || !this._ip) return;
    const delay = Math.min(this._reconnectDelayMs, RECONNECT_MAX_MS);
    const jitter = Math.floor(Math.random() * 400);
    this._reconnectTimer = setTimeout(() => {
      this._reconnectTimer = null;
      if (this._wantsConnection && this._ip) {
        console.log(`[ESP32] Reconnecting in ${delay + jitter}ms...`);
        this.connectToESP32(this._ip);
      }
    }, delay + jitter);

    this._reconnectDelayMs = Math.min(this._reconnectDelayMs * 2, RECONNECT_MAX_MS);
  }

  _startHeartbeatMonitor() {
    this._stopHeartbeatMonitor();
    this._heartbeatTimer = setInterval(() => {
      if (!this._connected || !this._wantsConnection) return;

      const staleFor = Date.now() - this._lastMessageAt;
      if (staleFor <= MESSAGE_STALE_MS) return;

      console.warn(`[ESP32] No data for ${staleFor}ms, reconnecting...`);
      this._error = 'Connection unstable — recovering...';
      this._connected = false;
      this._connecting = false;
      this._notify();

      this._cleanup();
      this._scheduleReconnect();
    }, HEARTBEAT_CHECK_MS);
  }

  _stopHeartbeatMonitor() {
    if (this._heartbeatTimer) {
      clearInterval(this._heartbeatTimer);
      this._heartbeatTimer = null;
    }
  }

  _handleIncomingData(data) {
    // Update sensor values
    if (data.water_level !== undefined) this._sensor.water_level = data.water_level;
    if (data.temperature !== undefined) this._sensor.temperature = data.temperature;
    if (data.washer_speed !== undefined) this._sensor.washer_speed = data.washer_speed;
    if (data.turbidity !== undefined) this._sensor.turbidity = data.turbidity;
    if (data.load_weight !== undefined) this._sensor.load_weight = data.load_weight;
    if (data.weight !== undefined) this._sensor.load_weight = data.weight;
    if (data.current !== undefined) this._sensor.current = data.current;

    // Update motor status from ESP32 — but skip if user just toggled (cooldown period)
    if (data.motor_status !== undefined && Date.now() > this._motorOverrideUntil) {
      this._motorOn = data.motor_status === 'on' || data.motor_status === true;
    }

    // Update pump status from ESP32
    if (data.pump_status !== undefined && Date.now() > this._pumpOverrideUntil) {
      this._pumpOn = data.pump_status === 'on' || data.pump_status === true;
    }

    // Update cycle info if provided
    if (data.cycle_status) {
      const prevStatus = this._cycle.status;
      this._cycle.status = data.cycle_status;

      if (data.cycle_status === 'Running' && prevStatus !== 'Running') {
        this._cycle.start_time = new Date();
        this._cycle.end_time = null;
      }
      if ((data.cycle_status === 'Completed' || data.cycle_status === 'Idle') && prevStatus === 'Running') {
        this._cycle.end_time = new Date();
      }
    }
    if (data.fabric_type) this._cycle.fabric_type = data.fabric_type;
    if (data.wash_mode) this._cycle.wash_mode = data.wash_mode;
    if (data.load_weight !== undefined) this._cycle.load_weight = data.load_weight;

    // Update resources if provided
    if (data.water_used !== undefined) this._resources.water_used = data.water_used;
    if (data.energy_used !== undefined) this._resources.energy_used = data.energy_used;
    if (data.duration_min !== undefined) this._resources.duration_min = data.duration_min;
    if (this._cycle.start_time && this._cycle.status === 'Running') {
      this._resources.duration_min = +(
        (Date.now() - this._cycle.start_time.getTime()) / 60000
      ).toFixed(1);
    }

    // Update eco scores if provided
    if (data.eco_rating) {
      this._eco.eco_rating = data.eco_rating;
      this._eco.water_saved = data.water_saved || 0;
      this._eco.energy_saved = data.energy_saved || 0;
      const rating = data.eco_rating;
      this._eco.remarks =
        rating === 'A'
          ? 'Excellent efficiency — minimal resource waste.'
          : rating === 'B'
            ? 'Good performance — minor optimisations possible.'
            : rating === 'C'
              ? 'Below target — consider Eco wash mode.'
              : 'No cycle data yet.';
    }

    this._pushHistory();
    this._saveToDatabase(data);
    this._notify();
  }

  /** Forward sensor data to the backend for database storage */
  async _saveToDatabase(data) {
    try {
      await fetch(`${BACKEND_URL}/Data/insert-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          water_level: data.water_level ?? this._sensor.water_level,
          temperature: data.temperature ?? this._sensor.temperature,
          washer_speed: data.washer_speed ?? this._sensor.washer_speed,
          turbidity: data.turbidity ?? this._sensor.turbidity,
          load_weight: data.load_weight ?? this._sensor.load_weight,
          motor_status: data.motor_status ?? (this._motorOn ? 'on' : 'off'),
        }),
      });
    } catch {
      // Backend might not be running — silently ignore
    }
  }

  _pushHistory() {
    this._history.push({
      time: stamp(),
      water_level: +this._sensor.water_level.toFixed(1),
      temperature: +this._sensor.temperature.toFixed(1),
      washer_speed: +this._sensor.washer_speed,
      energy: +this._resources.energy_used.toFixed(3),
    });
    if (this._history.length > MAX_HISTORY) this._history.shift();
  }

  _zeroSensors() {
    this._sensor = { water_level: 0, temperature: 0, washer_speed: 0, turbidity: 0, load_weight: 0, current: 0 };
  }

  _notify() {
    const snap = this.snapshot();
    this._subs.forEach((fn) => fn(snap));
  }
}

export const esp32Service = new ESP32Service();
export default ESP32Service;

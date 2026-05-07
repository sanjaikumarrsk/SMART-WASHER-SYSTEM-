# Smart Washer - Connection Troubleshooting Guide

## Quick Diagnostics

### Check Backend Status
Visit: `http://localhost:7099/api/system/status`

This endpoint shows:
- ✓ Backend running status
- ✓ Database connection status + credentials  
- ✓ ESP32 WebSocket connection status
- ✓ .NET API forwarding status

## Database Connection Issues

### Problem: Database shows "disconnected"

**Check 1: Verify Backend Configuration**
- Backend `.env` file MUST exist (not just `.env.example`)
- Check `backend/.env` has correct MySQL credentials:
  ```
  DB_HOST=localhost
  DB_USER=root
  DB_PASSWORD=
  DB_NAME=smart_washer
  ```

**Check 2: Verify MySQL is Running**
```bash
# On Windows:
services.msc  # Look for "MySQL" or similar

# Or test connection:
mysql -h localhost -u root -p
```

**Check 3: Check Backend Logs**
When backend starts, you should see:
```
✓ Database connected
  Host: localhost
  Database: smart_washer
  User: root
```

Or if fails:
```
⚠ Database connection failed: Error: connect ECONNREFUSED 127.0.0.1:3306
  Check: host=localhost, user=root, db=smart_washer
```

**Fix: If Database Unavailable**
- Sensor data will auto-forward to .NET API if configured
- Or disable database and use fallback mode:
  ```env
  FORWARD_TO_DOTNET=false
  ```

---

## ESP32 Connection Issues

### Problem: "Cannot connect to ESP32"

**Check 1: Verify Frontend Uses Correct Backend URL**
- Open `frontend/.env`:
  ```
  VITE_BACKEND_URL=http://localhost:7099
  ```
- Should match backend PORT (default: 7099)
- **Port Mismatch** is the #1 cause!

**Check 2: Verify Backend is Running**
```bash
# Test from command line:
curl http://localhost:7099/ping
# Should respond: {"status":"pong","timestamp":"..."}
```

**Check 3: Verify ESP32 IP Address**
- Enter in correct format: `192.168.1.100` (not `192.168.1.100:81`)
- Verify ESP32 device is powered on
- Verify ESP32 is on same WiFi network as backend

**Check 4: Check Network Connectivity**
```bash
# From backend machine, ping ESP32:
ping 192.168.1.100

# Should see responses:
# Reply from 192.168.1.100: bytes=32 time=20ms TTL=...
```

### Backend WebSocket Connection Errors

When you enter ESP32 IP, check backend logs for:

✓ **Success:**
```
[ESP32-Bridge] Connecting to ws://192.168.1.100:81...
[ESP32-Bridge] ✓ Connected to ESP32 at 192.168.1.100 (took 234ms)
```

✗ **Connection Timeout (after 10 seconds):**
```
[ESP32-Bridge] ✓ Connection timeout: Unable to connect to ws://192.168.1.100:81
[ESP32-Bridge] Cannot connect to ws://192.168.1.100:81 - Check if:
  1. ESP32 IP address is correct
  2. ESP32 WebSocket server is running on port 81
  3. Network connectivity between backend and ESP32
```

**What this means:**
- Backend could not reach ESP32 at the IP you provided
- Either the IP is wrong OR ESP32 isn't listening on port 81
- Or there's a firewall blocking port 81

### Sensor Data Not Appearing

**Check 1: Verify ESP32 Connected**
- Check Dashboard: Should show "Connected to 192.168.1.100:81"
- Or check `http://localhost:7099/api/esp32/status`:
  ```json
  {
    "connected": true,
    "ip": "192.168.1.100"
  }
  ```

**Check 2: Verify ESP32 is Sending Data**
- Check backend logs, should show sensor readings every few seconds:
  ```
  [ESP32] Reading received — water:45% load:2.5kg current:0.8A temp:28°C pump:0 motor:1
  ```
- If no readings, ESP32 device isn't sending WebSocket messages

**Check 3: Check Latest Sensor Data**
```
GET http://localhost:7099/api/sensor-data/latest
```
Should return recent sensor readings

---

## Port Mismatch Issues

### The #1 Problem: Backend and Frontend on Different Ports

**Scenario:** Backend on 7099 but frontend tries to connect to 7100

**Files to Check:**
1. `backend/src/server.js` (line ~11):
   ```javascript
   const PORT = process.env.PORT || 7099;
   ```

2. `backend/.env`:
   ```
   PORT=7099  // ← This must match frontend's VITE_BACKEND_URL
   ```

3. `frontend/.env`:
   ```
   VITE_BACKEND_URL=http://localhost:7099  // ← Must match backend PORT
   ```

**Fix:** Ensure both point to same port (7099)

---

## Step-by-Step Connection Test

### 1. Start Backend
```bash
cd backend
npm start

# Should see:
# ✓ Database connected (or ⚠ Database connection failed)
# 🚀 Smart Washer Backend running on http://localhost:7099
```

### 2. Start Frontend
```bash
cd frontend  
npm run dev

# Should see:
# VITE v... ready in 250 ms
```

### 3. Test Backend Connectivity from Browser
Visit: `http://localhost:7099/api/system/status`

Should see something like:
```json
{
  "timestamp": "2024-05-06T10:30:45.123Z",
  "backend": {
    "running": true,
    "port": 7099,
    "uptime": 45.2
  },
  "database": {
    "connected": false,
    "host": "localhost",
    "database": "smart_washer",
    "message": "Database connection failed - data will be forwarded to .NET API"
  },
  "esp32": {
    "connected": false,
    "ip": null,
    "port": 81,
    "message": "Not connected - use POST /api/esp32/connect to connect"
  }
}
```

### 4. Open Frontend
Visit: `http://localhost:5173` (or whatever Vite shows)

### 5. Enter ESP32 IP and Connect
- Dashboard → "Set IP" → Enter `192.168.1.100` (or actual ESP32 IP)
- Watch backend logs for connection attempt
- Status should change from "Disconnected" to "Connecting..." to "Connected"

---

## Reading Backend Logs

### Log Message Format: `[COMPONENT] Message`

**Components:**
- `[Server Error]` - Express/HTTP errors
- `[ESP32-Bridge]` - ESP32 WebSocket connection
- `[ESP32]` - ESP32 data received  
- `[DOTNET]` - .NET API forwarding
- `[API]` - REST API requests
- `[Uncaught Exception]` - Unhandled errors

**Examples:**
```
[ESP32-Bridge] ✓ Connected to ESP32 at 192.168.1.100
[ESP32] Reading received — water:45% load:2.5kg...
[API] Stats error: Database is not available
[DOTNET] Forwarded reading (200) to https://localhost:7099...
```

---

## Common Scenarios

### "Cannot reach backend"
**Cause:** Frontend can't reach http://localhost:7099
**Fix:** 
1. Check backend is running: `curl http://localhost:7099/ping`
2. Check VITE_BACKEND_URL in frontend/.env
3. Check port mismatch

### "Still connecting..."
**Cause:** WebSocket connection to ESP32 is stuck
**Fix:**
1. Check ESP32 IP address is correct
2. Verify ESP32 is on same network
3. Check ESP32 WebSocket port (should be 81)
4. Try pinging ESP32: `ping 192.168.1.100`

### "Connected but no sensor data"
**Cause:** Connection established but ESP32 not sending
**Fix:**
1. Check ESP32 firmware is running
2. Check sensors are connected to ESP32
3. Check WebSocket message format on ESP32

### "Database unavailable"
**Cause:** MySQL not running or wrong credentials
**Fix:**
1. Start MySQL service
2. Verify .env credentials match your MySQL setup
3. Or set FORWARD_TO_DOTNET=true to use .NET API fallback

---

## Environment Variables Checklist

### Backend (`backend/.env`)
```
✓ PORT=7099                                    (matches frontend URL)
✓ DB_HOST=localhost                           (your MySQL host)
✓ DB_USER=root                                (your MySQL user)
✓ DB_PASSWORD=                                (your MySQL password)
✓ DB_NAME=smart_washer                        (your MySQL database)
✓ DOTNET_API_URL=https://localhost:7099/...  (if using .NET API)
✓ FORWARD_TO_DOTNET=false                     (or true if needed)
```

### Frontend (`frontend/.env`)
```
✓ VITE_BACKEND_URL=http://localhost:7099      (matches backend PORT)
```

---

## Still Not Working?

1. **Check Backend Logs** - Look for error messages
2. **Visit `/api/system/status`** - See real-time status
3. **Open Browser Console** - Check for CORS/network errors
4. **Verify Network** - Can you ping ESP32 from backend machine?
5. **Restart Services** - Kill and restart both backend and frontend
6. **Check Firewalls** - Port 81 and 7099 must be accessible

---

## Additional Debugging

### Enable Verbose Logging
Add to `backend/server.js`:
```javascript
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});
```
(This is already included)

### Test Database Directly
```bash
mysql -h localhost -u root -p smart_washer
SELECT * FROM sensor_readings ORDER BY created_at DESC LIMIT 5;
```

### Monitor Network Traffic
```bash
# Watch HTTP requests to backend
netstat -an | findstr :7099

# Test WebSocket connection
# (Requires WebSocket client tool)
```

---

Last Updated: May 2024  
Version: 1.0

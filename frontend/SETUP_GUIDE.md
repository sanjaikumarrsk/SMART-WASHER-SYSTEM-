# Smart Washer Project Setup Guide

## Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Dashboard.jsx       (Main dashboard with KPI charts)
│   │   └── Status.jsx          (Connection status & control)
│   ├── services/
│   │   └── esp32Service.js    (Backend API client service)
│   └── components/
├── package.json
└── .env.example

backend/
├── src/
│   ├── server.js              (Express server & ESP32 bridge)
│   ├── db.js                  (Database configuration)
│   ├── runtimeState.js        (In-memory state storage)
│   └── routes/
│       └── api.js             (API endpoint handlers)
├── package.json
├── .env.example
└── README.md
```

## Installation & Setup

### Step 1: Install Frontend Dependencies
```bash
cd frontend
npm install
```

### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 3: Configure Environment Variables

**Frontend** (`frontend/.env`):
```env
REACT_APP_BACKEND_URL=http://localhost:7099
```

**Backend** (`backend/.env`):
```env
PORT=7099
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=smart_washer
FORWARD_TO_DOTNET=false
```

## Running the Project

### In Terminal 1 - Start Backend:
```bash
cd backend
npm start
# Server runs on http://localhost:7099
```

### In Terminal 2 - Start Frontend:
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173 (or similar)
```

## How It Works

### Connection Flow:
1. **User enters ESP32 IP** in Dashboard → clicks "Set"
2. **Frontend sends** `POST /api/esp32/connect` to backend
3. **Backend connects** to ESP32 via WebSocket (ws://IP:81)
4. **Frontend polls** `GET /api/esp32/status` every 2 seconds
5. **Connection status updates** in real-time on Dashboard and Status pages

### Data Flow:
```
ESP32 Device
    ↓ (WebSocket: ws://ESP32_IP:81)
Node.js Backend (Port 7099)
    ├─ Stores sensor data
    ├─ Logs control events
    └─ Provides REST API
         ↓ (HTTP: http://localhost:7099/api/*)
React Frontend
    ├─ Dashboard (Live charts & KPIs)
    ├─ Status page (Connection status)
    └─ Controls (Motor, Pump, Cycle)
```

## Features

### Dashboard (`/dashboard`)
- **Real-time Sensor Data**: Water level, temperature, turbidity, current, load
- **Performance Analytics**:
  - Sensor Trends (Line chart)
  - Resource Consumption (Bar chart)
  - Water Quality (Area chart)
  - Efficiency Metrics (KPI cards)
- **Motor & Pump Control**: Toggle on/off when connected
- **Connection Status**: Shows connected IP address

### Status Page (`/status`)
- **Backend API Status**: Online/Offline
- **ESP32 Bridge Status**: Connected/Disconnected + IP
- **Latest Sensor Reading**: Real-time data
- **Database Status**: Available/Unavailable
- **Activity Log**: All events logged in real-time

## Backend API Endpoints

### ESP32 Management
- `POST /api/esp32/connect` - Connect to ESP32 device
- `POST /api/esp32/disconnect` - Disconnect from ESP32
- `GET /api/esp32/status` - Check connection status

### Data & Monitoring
- `GET /api/sensor-data/latest` - Get latest sensor reading
- `GET /api/stats` - Get database statistics

### Control Events
- `POST /api/motor-event` - Log motor state
- `POST /api/pump-event` - Log pump state
- `POST /api/Data/insert-update` - Log cycle data

## Troubleshooting

### Backend won't start
```bash
# Check if port 7099 is in use
# On Windows:
netstat -ano | findstr :7099
# Kill the process or use different PORT=7100
```

### Frontend can't connect to backend
- Verify backend is running on http://localhost:7099
- Check `REACT_APP_BACKEND_URL` in `frontend/.env`
- Check browser console for CORS errors

### ESP32 won't connect
- Verify ESP32 IP address (use `192.168.x.x` format)
- Ensure ESP32 is on same network as backend
- Check ESP32 is listening on port 81
- Look at backend logs for connection errors

### No sensor data appearing
- Check backend logs for ESP32 WebSocket connection
- Verify ESP32 is sending JSON data
- Confirm sensor readings are being received

### Database errors
- MySQL must be running (or set `FORWARD_TO_DOTNET=true`)
- Check DB credentials in `.env`
- Create required tables (see `backend/README.md`)

## Environment Variables

### Frontend (frontend/.env)
| Variable | Default | Description |
|----------|---------|-------------|
| REACT_APP_BACKEND_URL | http://localhost:7099 | Backend API URL |

### Backend (backend/.env)
| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 7099 | Server port |
| DB_HOST | localhost | MySQL host |
| DB_USER | root | MySQL username |
| DB_PASSWORD | (empty) | MySQL password |
| DB_NAME | smart_washer | Database name |
| DOTNET_API_URL | https://localhost:7099/api/Data/insert-update | .NET API endpoint |
| FORWARD_TO_DOTNET | false | Forward data to .NET API |

## Architecture Diagram

```
┌─────────────────────────────────────────────┐
│  React Frontend (Vite)                      │
│  ├─ Dashboard (Charts & Controls)           │
│  ├─ Status (Connection Monitor)             │
│  └─ esp32Service (API Client)               │
└────────────┬────────────────────────────────┘
             │ HTTP/JSON
             ▼ http://localhost:7099
┌─────────────────────────────────────────────┐
│  Node.js Backend (Express)                  │
│  ├─ REST API Endpoints                      │
│  ├─ Runtime State Management                │
│  └─ ESP32 WebSocket Bridge                  │
└────────────┬────────────────────────────────┘
             │ WebSocket
             ▼ ws://ESP32_IP:81
┌─────────────────────────────────────────────┐
│  ESP32 IoT Device                           │
│  ├─ Sensor Readings (Water, Temp, etc)      │
│  ├─ Motor Control                           │
│  └─ Pump Control                            │
└─────────────────────────────────────────────┘
```

## Next Steps

1. ✅ Backend setup complete
2. ✅ Frontend service integrated
3. ✅ API endpoints ready
4. → Configure database (optional)
5. → Start backend server
6. → Start frontend dev server
7. → Enter ESP32 IP and connect
8. → Monitor in Dashboard & Status pages

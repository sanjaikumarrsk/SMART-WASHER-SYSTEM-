# Smart Washer Backend

This backend bridges the frontend React application with the ESP32 IoT device. It manages WebSocket connections to the ESP32 and provides REST API endpoints for the frontend.

## Features

- **ESP32 WebSocket Bridge**: Connects to ESP32 device and receives sensor data in real-time
- **REST API**: Provides endpoints for frontend to control and monitor the device
- **Database Storage**: Stores sensor readings and control events in MySQL/MariaDB
- **.NET API Forwarding**: Can forward data to a .NET API endpoint if local DB is unavailable
- **Auto-Reconnection**: Automatically reconnects to ESP32 if connection drops

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=7099

# Database Configuration (Optional)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=smart_washer

# .NET API Forwarding (Optional)
DOTNET_API_URL=https://localhost:7099/api/Data/insert-update
FORWARD_TO_DOTNET=true
```

### 3. Database Setup (Optional)

If you want to store data locally, create these tables in your MySQL database:

```sql
CREATE TABLE sensor_readings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  weight FLOAT,
  load_weight FLOAT,
  water_level FLOAT,
  turbidity FLOAT,
  current FLOAT,
  hx711_ready BOOLEAN,
  pump_status BOOLEAN,
  motor_status BOOLEAN,
  temperature FLOAT,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE control_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  control_type VARCHAR(50),
  value INT,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cycle_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fabric_type VARCHAR(100),
  wash_mode VARCHAR(100),
  status VARCHAR(50),
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Running the Backend

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The backend will start on `http://localhost:7099`

## API Endpoints

### ESP32 Connection Management

- **POST /api/esp32/connect** - Connect to ESP32
  ```json
  { "ip": "192.168.1.100" }
  ```

- **POST /api/esp32/disconnect** - Disconnect from ESP32

- **GET /api/esp32/status** - Check ESP32 connection status

### Sensor Data

- **GET /api/sensor-data/latest** - Get latest sensor reading

- **GET /api/stats** - Get database statistics

### Control Events

- **POST /api/motor-event** - Log motor state change
  ```json
  { "motor_status": true }
  ```

- **POST /api/pump-event** - Log pump state change
  ```json
  { "pump_status": false }
  ```

- **POST /api/Data/insert-update** - Log cycle data
  ```json
  { "fabric_type": "cotton", "wash_mode": "normal", "cycle_status": "running" }
  ```

## Frontend Integration

The frontend `esp32Service` communicates with this backend API:

1. User enters ESP32 IP in the Dashboard
2. Frontend sends `POST /api/esp32/connect` to backend
3. Backend connects to ESP32 via WebSocket
4. Frontend polls `/api/esp32/status` to check connection status
5. Sensor data is automatically stored and can be fetched via `/api/sensor-data/latest`

## Health Check

Visit `http://localhost:7099` in your browser to see the backend status dashboard, which shows:
- Backend running status
- ESP32 bridge status and connected IP
- Latest sensor reading
- Database connection status

## Troubleshooting

- **Backend won't start**: Check if port 7099 is already in use
- **ESP32 won't connect**: Verify the IP address and that ESP32 is on the same network
- **Database connection failed**: Check MySQL credentials in `.env` file, or set `FORWARD_TO_DOTNET=true` to skip local storage
- **No sensor data**: Ensure ESP32 is sending data to `ws://backend-ip:7099/api/esp32/status`

## Architecture

```
ESP32 (WebSocket)
    ↓ (ws://backend:81)
Backend Server (Node.js/Express)
    ├─ Sensor Data Storage (MySQL)
    ├─ Control Event Logging
    └─ REST API Endpoints
         ↓ (HTTP/JSON)
    React Frontend
        └─ Dashboard, Status, Analytics
```

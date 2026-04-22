# 🏭 Shopfloor Copilot

![Version](https://img.shields.io/badge/version-1.0.0-red)
![Platform](https://img.shields.io/badge/platform-Jetson%20AGX%20Orin-green)
![Frontend](https://img.shields.io/badge/frontend-React%20+%20Vite-blue)
![Backend](https://img.shields.io/badge/backend-Flask-orange)
![Protocol](https://img.shields.io/badge/protocol-MQTT-purple)
![License](https://img.shields.io/badge/license-Proprietary-lightgrey)

---

## 🚀 AI-Powered Industrial Monitoring Platform

> Real-time machine monitoring + Predictive Maintenance dashboard  
> Built for **Industry 4.0 on Edge Devices (Jetson)**

---

## 🧠 Features

- 📡 Real-time sensor data via **MQTT**
- 📊 Live dashboards (Velocity, Acceleration, Temp, Acoustic)
- 🧠 AI Predictive Maintenance
- ⚠️ Fault Detection (Bearing fault etc.)
- 📈 Forecast graphs (Vibration, Temperature, Health)
- 💡 AI Recommendations system
- 📋 Live data table
- 📱 Fullscreen interactive charts (tap to expand)
- 🌙 Dark industrial UI theme

---

## 🏗️ System Architecture
Sensors → MQTT Broker → Flask Backend → React Frontend
↓
AI Model / Predictions

---

## ⚙️ Tech Stack

### Frontend
- React (Vite)
- TypeScript
- Tailwind CSS
- Recharts (graphs)
- ShadCN UI

### Backend
- Python
- Flask
- Paho MQTT

### Hardware
- NVIDIA Jetson (Edge AI)

---

## 📡 Data Flow

1. Sensors send data via MQTT
2. Flask subscribes to topic
3. Backend exposes API (`/api/live-data`)
4. Frontend fetches every 2 sec
5. Charts + cards update in real-time

---

## 🤖 Predictive Maintenance

Includes:

- Health Score
- Failure Risk %
- Remaining Life (days)
- AI Confidence
- Fault Detection (e.g. Bearing Fault)
- Forecast graphs
- Recommendations

⚠️ Currently:
- Uses mock AI data (fallback)
- Can be replaced with real ML model

---


---

## 🖥️ Installation (Jetson / Linux)

### 1. Clone repo

```bash
git clone https://github.com/YOUR_USERNAME/edge-watch.git
cd edge-watch

---

## ⚙️ Tech Stack

### Frontend
- React (Vite)
- TypeScript
- Tailwind CSS
- Recharts (graphs)
- ShadCN UI

### Backend
- Python
- Flask
- Paho MQTT

### Hardware
- NVIDIA Jetson (Edge AI)

---

## 📡 Data Flow

1. Sensors send data via MQTT
2. Flask subscribes to topic
3. Backend exposes API (`/api/live-data`)
4. Frontend fetches every 2 sec
5. Charts + cards update in real-time

---

## 🤖 Predictive Maintenance

Includes:

- Health Score
- Failure Risk %
- Remaining Life (days)
- AI Confidence
- Fault Detection (e.g. Bearing Fault)
- Forecast graphs
- Recommendations

⚠️ Currently:
- Uses mock AI data (fallback)
- Can be replaced with real ML model

---

## 🖥️ Installation (Jetson / Linux)

### 1. Clone repo

```bash
git clone https://github.com/YOUR_USERNAME/edge-watch.git
cd edge-watch
2. Backend Setup
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

Run:
python app.py

3. Frontend Setup
cd ..
npm install
npm run dev

Open:
http://localhost:8081

🔌 MQTT Configuration

In backend:broker = "YOUR_BROKER_URL"
port = 1883
topic = "YOUR_TOPIC"
username = "YOUR_USER"
password = "YOUR_PASS"


📊 API Endpoints
| Endpoint          | Description        |
| ----------------- | ------------------ |
| `/api/live-data`  | Latest sensor data |
| `/api/prediction` | AI prediction      |
| `/api/forecast`   | Forecast data      |\

🧪 Example Sensor Data
{
  "aRMSx": 0.054,
  "aRMSy": 0.097,
  "aRMSz": 0.055,
  "vRMSx": 0.66,
  "vRMSy": 0.97,
  "vRMSz": 0.70,
  "temperature": 24.7,
  "acousticRMS": 54.8
}

⚡ Future Improvements
Real ML model integration
Anomaly detection model (Isolation Forest / LSTM)
Database (InfluxDB / PostgreSQL)
Multi-machine support
Alerts via SMS / Email
Edge optimization

👨‍💻 Developed By

Somya Jaiswal

📜 License

Proprietary – Internal Use Only


---





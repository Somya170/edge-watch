# 🚀 EDGE AI – Predictive Maintenance Dashboard

An industrial-grade **real-time predictive maintenance system** that monitors machine health using sensor data (MQTT), processes it via a Flask backend, and visualizes insights through a modern React dashboard.

---

## 🏭 Project Overview

This project is designed for **manufacturing industries** to monitor machine conditions and prevent unexpected failures.

It collects real-time sensor data such as:

* Vibration (Acceleration & Velocity RMS)
* Temperature
* Acoustic signals

Using this data, the system:

* Displays live machine status
* Detects anomalies
* Provides predictive maintenance insights
* Visualizes trends and forecasts

---

## 🎯 Key Features

### 🔴 Real-Time Monitoring

* Live data streaming via MQTT
* Continuous updates every 2 seconds
* Interactive charts and tables

### 📊 Advanced Visualization

* Velocity & Acceleration RMS graphs
* Temperature & Acoustic monitoring
* Fullscreen expandable charts
* Dark industrial UI

### 🤖 Predictive Maintenance

* Health Score calculation
* Failure Risk estimation
* Remaining Useful Life (RUL)
* AI-based fault detection

### ⚠️ Alerts & Recommendations

* AI fault detection (e.g., bearing fault)
* Smart maintenance suggestions
* Priority-based recommendations

---

## 🧠 System Architecture

```
Sensors → MQTT Broker → Flask Backend → REST API → React Frontend
```

### Flow:

1. Sensors send data via MQTT
2. Flask subscribes to MQTT topics
3. Backend processes & stores latest data
4. Frontend fetches via API
5. Dashboard updates in real-time

---

## 🛠️ Tech Stack

### Frontend

* React + TypeScript
* Tailwind CSS
* Recharts
* Vite

### Backend

* Python
* Flask
* MQTT (paho-mqtt)

### AI / ML

* (Currently Mock / Placeholder)
* Planned: Anomaly Detection (Isolation Forest)

---

## 📡 API Endpoints

### 🔹 Get Live Data

```
GET /api/live-data
```

### 🔹 Get Prediction Data

```
GET /api/prediction
```

### 🔹 Get Forecast Data

```
GET /api/forecast
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```
git clone https://github.com/Somya170/edge-watch.git
cd edge-watch
```

---

### 2️⃣ Backend Setup (Flask)

```
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

Backend runs on:

```
http://127.0.0.1:5005
```

---

### 3️⃣ Frontend Setup (React)

```
cd ..
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:8081
```

---

## 🔌 MQTT Configuration

Update your MQTT credentials in backend:

```
broker_url = "YOUR_BROKER_URL"
topic = "YOUR_TOPIC"
username = "YOUR_USERNAME"
password = "YOUR_PASSWORD"
```

---

## 📊 Sample Data Format

```
{
  "timestamp": 83468,
  "aRMSx": 0.054,
  "aRMSy": 0.097,
  "aRMSz": 0.055,
  "vRMSx": 0.667,
  "vRMSy": 0.975,
  "vRMSz": 0.703,
  "temperature": 24.7,
  "acousticRMS": 54.8
}
```

---

## 🖥️ Dashboard Sections

* Machine Status Cards
* AI Predictive Maintenance Panel
* Forecast Charts
* Fault Detection
* Recommendations
* Real-Time Charts
* Live Data Table

---

## 🔥 Future Improvements

* Train ML model on historical data
* Implement anomaly detection
* Add fault classification (bearing, misalignment)
* Deploy on cloud (AWS / Azure)
* Add user authentication

---

## 👨‍💻 Author

**Somya**

---

## ⭐ Contribution

Feel free to fork this repo and contribute to improve the system!

---

## 📜 License

This project is open-source and available under the MIT License.

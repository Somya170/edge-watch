from flask import Flask, jsonify
from flask_cors import CORS
import paho.mqtt.client as mqtt
import json

app = Flask(__name__)
CORS(app)

latest_data = {}

# 🔴 TERA MQTT CONFIG (yaha apna daal)
BROKER = "broker.emqx.io"
PORT = 1883
TOPIC = "wired/rms/#"
USERNAME = "test"
PASSWORD = "test"

def on_connect(client, userdata, flags, rc):
    print("Connected to MQTT Broker:", rc)
    client.subscribe(TOPIC)

def on_message(client, userdata, msg):
    global latest_data
    try:
        payload = json.loads(msg.payload.decode())
        latest_data = payload
        print("Received:", latest_data)
    except Exception as e:
        print("Error:", e)

mqtt_client = mqtt.Client()

# Auth
mqtt_client.username_pw_set(USERNAME, PASSWORD)

mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message

mqtt_client.connect(BROKER, PORT, 60)
mqtt_client.loop_start()

# 🔗 API
@app.route("/api/live-data")
def get_live_data():
    return jsonify(latest_data)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5005)
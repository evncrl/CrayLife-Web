import json
import os

import paho.mqtt.client as mqtt

from shared_data import sensor_data
from database import (
    initialize_database,
    insert_reading
)

# =========================
# LOAD CONFIG
# =========================

with open("config.json", "r") as f:
    config = json.load(f)

BROKER = config["broker"]
PORT = config["port"]
TOPICS = config["topics"]

# =========================
# INITIALIZE DATABASE
# =========================

initialize_database()

# =========================
# MQTT CALLBACKS
# =========================

def on_connect(client, userdata, flags, reason_code, properties=None):
    print("✅ Connected to MQTT Broker")

    for topic in TOPICS.values():
        client.subscribe(topic)
        print(f"📡 Subscribed to: {topic}")


def on_message(client, userdata, msg):
    value = msg.payload.decode()

    for sensor_name, topic in TOPICS.items():
        if msg.topic == topic:

            # Update in-memory data
            sensor_data[sensor_name] = value

            # Save to SQLite
            try:
                insert_reading(sensor_name, float(value))
            except ValueError:
                insert_reading(sensor_name, value)

            break

    # Clear terminal
    os.system("clear")

    print("=" * 60)
    print("              CRAYLIFE SENSOR MONITOR")
    print("=" * 60)

    for key, val in sensor_data.items():
        print(f"{key:<12}: {val}")

    print("=" * 60)
    print(f"Latest Topic : {msg.topic}")
    print(f"Latest Value : {value}")


def on_disconnect(client, userdata, disconnect_flags, reason_code, properties=None):
    print("❌ Disconnected from MQTT Broker")


# =========================
# MQTT CLIENT
# =========================

mqtt_client = mqtt.Client(
    mqtt.CallbackAPIVersion.VERSION2
)

mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message
mqtt_client.on_disconnect = on_disconnect

# =========================
# START MQTT
# =========================

print("🚀 Starting CrayLife MQTT Listener")
print(f"Broker: {BROKER}")
print(f"Port  : {PORT}")

mqtt_client.connect(BROKER, PORT, 60)

try:
    mqtt_client.loop_forever()

except KeyboardInterrupt:
    print("\n🛑 Shutting down...")
    mqtt_client.disconnect()


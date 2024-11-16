import paho.mqtt.client as mqtt
import json

"""
    MQTT handler
"""
class MQTTManager:
    def __init__(self, db_manager):
        self.db_manager = db_manager
        self.mqtt_client = mqtt.Client()
        self.mqtt_client.on_connect = self.on_connect
        self.mqtt_client.on_message = self.on_message
        self.mqtt_client.connect("mqtt.eclipseprojects.io", 1883, 3600)

        self.topics = {
            "evomo/raw_data/loc_a": "A",
            "evomo/raw_data/loc_b": "B",
            "evomo/raw_data/loc_c": "C"
        }

        self.previous_data = {
            "A": None,
            "B": None,
            "C": None
        }

    """
        Connect callback
    """
    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            print("Connected to MQTT broker")
            for topic in self.topics:
                self.mqtt_client.subscribe(topic, qos=2)
                print(f"Subscribed to '{topic}' topic")
        else:
            print(f"Failed to connect, return code: {rc}")

    """
        Message callback
    """
    def on_message(self, client, userdata, msg):
        try:
            payload = json.loads(msg.payload.decode())
            data = payload.get("data")
            position = None

            for topic, pos in self.topics.items():
                if msg.topic == topic:
                    position = pos
                    break
            else:
                print(f"Unhandled topic: {msg.topic}")
                return
            
            prev_data = self.previous_data[position]

            if prev_data:
                diff_data = {
                    "reading_time": data.get("reading_time"),
                    "position": position,
                    "meter_type": data.get("meter_type"),
                    "meter_serial_number": data.get("meter_serial_number"),
                    "active_energy_import": data.get("active_energy_import") - prev_data.get("active_energy_import"),
                    "active_energy_export": data.get("active_energy_export") - prev_data.get("active_energy_export"),
                    "reactive_energy_import": data.get("reactive_energy_import") - prev_data.get("reactive_energy_import"),
                    "reactive_energy_export": data.get("reactive_energy_export") - prev_data.get("reactive_energy_export"),
                    "apparent_energy_import": data.get("apparent_energy_import") - prev_data.get("apparent_energy_import"),
                    "apparent_energy_export": data.get("apparent_energy_export") - prev_data.get("apparent_energy_export")
                }

                self.db_manager.save_energy_data(diff_data, position)

                result = self.mqtt_client.publish(f"evomo/final_data/loc_{position.lower()}", json.dumps(diff_data), qos=2)
                if result.rc == mqtt.MQTT_ERR_SUCCESS:
                    print(f"Data from {msg.topic} published to evomo/final_data/loc_{position.lower()}")
                else:
                    print("Failed to publish data")

            self.previous_data[position] = data

        except json.JSONDecodeError:
            print("Error: Payload is not valid JSON")
        except KeyError as e:
            print(f"Error: Required field not found - {e}")
        except Exception as e:
            print(f"Unexpected error: {e}")

    """
        MQTT loop
    """
    def start_mqtt_loop(self):
        self.mqtt_client.loop_start()

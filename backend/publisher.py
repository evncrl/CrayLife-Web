import os
import argparse
import paho.mqtt.client as mqtt


def main():
	p = argparse.ArgumentParser(description="MQTT publisher configurable host/port/topic/message")
	p.add_argument("--host", help="MQTT broker host", default=os.environ.get("MQTT_HOST", "localhost"))
	p.add_argument("--port", type=int, help="MQTT broker port", default=int(os.environ.get("MQTT_PORT", 1883)))
	p.add_argument("--topic", help="Topic to publish to", default=os.environ.get("MQTT_TOPIC", "test/topic"))
	p.add_argument("--message", help="Message payload", default=os.environ.get("MQTT_MESSAGE", "Hello MQTT!"))
	p.add_argument("--username", help="MQTT username", default=os.environ.get("MQTT_USERNAME"))
	p.add_argument("--password", help="MQTT password", default=os.environ.get("MQTT_PASSWORD"))
	args = p.parse_args()

	client = mqtt.Client()
	if args.username:
		client.username_pw_set(args.username, args.password)

	try:
		client.connect(args.host, args.port)
	except Exception as e:
		print(f"Failed to connect to {args.host}:{args.port} - {e}")
		return

	result = client.publish(args.topic, args.message)
	result.wait_for_publish()
	if result.rc == 0:
		print("Message sent")
	else:
		print("Failed to send message, rc=", result.rc)


if __name__ == "__main__":
	main()

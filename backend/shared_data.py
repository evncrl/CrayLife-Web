import json

with open("config.json", "r") as f:
    config = json.load(f)

sensor_data = {
    key: None
    for key in config["topics"].keys()
}
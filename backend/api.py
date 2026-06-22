from flask import Flask, jsonify, request
from flask_cors import CORS

from database import (
    initialize_database,
    get_all_latest,
    get_sensor_history,
    get_sensor_history_paginated,   # ← new function (see database.py snippet below)
)

initialize_database()

app = Flask(__name__)
CORS(app)


@app.route("/")
def home():
    return jsonify({"status": "online"})


@app.route("/api/sensors")
def sensors():
    return jsonify(get_all_latest())


# ── Original route (kept for backward compat) ────────────────────────────────
@app.route("/api/history/<sensor_name>")
def history(sensor_name):
    return jsonify(get_sensor_history(sensor_name, 100))


# ── New route used by the History page ───────────────────────────────────────
@app.route("/api/history")
def history_paginated():
    sensor = request.args.get("sensor", "all")
    limit  = min(int(request.args.get("limit",  25)), 200)
    offset = int(request.args.get("offset", 0))
    search = request.args.get("search", "").strip()

    rows, total = get_sensor_history_paginated(
        sensor=sensor,
        limit=limit,
        offset=offset,
        search=search,
    )
    return jsonify({"rows": rows, "total": total})

print(app.url_map)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
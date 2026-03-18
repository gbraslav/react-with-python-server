from flask import Flask, jsonify
from flask_cors import CORS
from datetime import datetime, timezone

app = Flask(__name__)
CORS(app)


@app.route("/api/hello")
def hello():
    return jsonify({
        "message": "Hello from Flask!",
        "timestamp": datetime.now(timezone.utc).isoformat()
    })


CHART_DATA = [
    {"id": 1,  "month": "2024-01", "data_field1": 45.20, "data_field2": 320.00, "data_field3": 12.50, "data_field4": "A"},
    {"id": 2,  "month": "2024-01", "data_field1": 52.10, "data_field2": 450.00, "data_field3": 18.30, "data_field4": "B"},
    {"id": 3,  "month": "2024-02", "data_field1": 38.70, "data_field2": 280.00, "data_field3": 22.10, "data_field4": "AB"},
    {"id": 4,  "month": "2024-02", "data_field1": 61.40, "data_field2": 510.00, "data_field3": 8.90,  "data_field4": "A"},
    {"id": 5,  "month": "2024-03", "data_field1": 29.80, "data_field2": 390.00, "data_field3": 31.00, "data_field4": "B"},
    {"id": 6,  "month": "2024-03", "data_field1": 74.50, "data_field2": 620.00, "data_field3": 15.70, "data_field4": "A"},
    {"id": 7,  "month": "2024-04", "data_field1": 55.00, "data_field2": 470.00, "data_field3": 27.40, "data_field4": "AB"},
    {"id": 8,  "month": "2024-04", "data_field1": 41.30, "data_field2": 350.00, "data_field3": 19.80, "data_field4": "B"},
    {"id": 9,  "month": "2024-05", "data_field1": 68.90, "data_field2": 580.00, "data_field3": 10.20, "data_field4": "A"},
    {"id": 10, "month": "2024-05", "data_field1": 33.60, "data_field2": 410.00, "data_field3": 35.50, "data_field4": "AB"},
    {"id": 11, "month": "2024-06", "data_field1": 47.80, "data_field2": 300.00, "data_field3": 14.60, "data_field4": "B"},
    {"id": 12, "month": "2024-06", "data_field1": 59.20, "data_field2": 540.00, "data_field3": 23.90, "data_field4": "A"},
    {"id": 13, "month": "2024-07", "data_field1": 82.10, "data_field2": 710.00, "data_field3": 7.30,  "data_field4": "A"},
    {"id": 14, "month": "2024-07", "data_field1": 36.40, "data_field2": 260.00, "data_field3": 29.10, "data_field4": "AB"},
    {"id": 15, "month": "2024-08", "data_field1": 50.70, "data_field2": 480.00, "data_field3": 16.80, "data_field4": "B"},
    {"id": 16, "month": "2024-08", "data_field1": 71.30, "data_field2": 650.00, "data_field3": 21.40, "data_field4": "A"},
    {"id": 17, "month": "2024-09", "data_field1": 28.50, "data_field2": 330.00, "data_field3": 38.20, "data_field4": "B"},
    {"id": 18, "month": "2024-09", "data_field1": 63.80, "data_field2": 560.00, "data_field3": 11.90, "data_field4": "AB"},
    {"id": 19, "month": "2024-10", "data_field1": 44.90, "data_field2": 420.00, "data_field3": 25.60, "data_field4": "A"},
    {"id": 20, "month": "2024-10", "data_field1": 57.60, "data_field2": 500.00, "data_field3": 17.30, "data_field4": "B"},
    {"id": 21, "month": "2024-11", "data_field1": 39.20, "data_field2": 370.00, "data_field3": 33.70, "data_field4": "AB"},
    {"id": 22, "month": "2024-11", "data_field1": 76.40, "data_field2": 690.00, "data_field3": 9.50,  "data_field4": "A"},
    {"id": 23, "month": "2024-12", "data_field1": 31.10, "data_field2": 240.00, "data_field3": 28.80, "data_field4": "B"},
    {"id": 24, "month": "2024-12", "data_field1": 66.50, "data_field2": 590.00, "data_field3": 13.40, "data_field4": "A"},
    {"id": 25, "month": "2024-12", "data_field1": 48.30, "data_field2": 440.00, "data_field3": 20.60, "data_field4": "AB"},
]


@app.route("/api/chart-data")
def get_chart_data():
    return jsonify(CHART_DATA)


if __name__ == "__main__":
    app.run(debug=True, port=5001)

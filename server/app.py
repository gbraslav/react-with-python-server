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


if __name__ == "__main__":
    app.run(debug=True, port=5001)

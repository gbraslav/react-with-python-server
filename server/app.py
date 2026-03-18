import os
import sys
from decimal import Decimal
from functools import wraps
from pathlib import Path
from datetime import datetime, timezone

import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, request, g
from flask_cors import CORS
from sqlalchemy import create_engine, Integer, String, Numeric, text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session

# Load .env from the same directory as this file
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(env_path)

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    print("ERROR: DATABASE_URL environment variable is not set.", file=sys.stderr)
    print("Copy server/.env.example to server/.env and fill in your connection string.", file=sys.stderr)
    sys.exit(1)

engine = create_engine(DATABASE_URL)


# --- ORM Model ---

class Base(DeclarativeBase):
    pass


class ChartData(Base):
    __tablename__ = "chart_data"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    month: Mapped[str] = mapped_column(String)
    data_field1: Mapped[Decimal] = mapped_column(Numeric)
    data_field2: Mapped[Decimal] = mapped_column(Numeric)
    data_field3: Mapped[Decimal] = mapped_column(Numeric)
    data_field4: Mapped[str] = mapped_column(String)


# --- Session Auth via Neon Auth ---

NEON_AUTH_URL = os.environ.get("NEON_AUTH_URL")

if not NEON_AUTH_URL:
    print("WARNING: NEON_AUTH_URL not set. Auth endpoints will reject all requests.", file=sys.stderr)


def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Authorization header required"}), 401

        token = auth_header.split("Bearer ", 1)[1]

        if not NEON_AUTH_URL:
            return jsonify({"error": "Auth not configured"}), 401

        # Validate session token by calling Neon Auth's get-session endpoint
        try:
            resp = requests.get(
                f"{NEON_AUTH_URL}/get-session",
                headers={"Authorization": f"Bearer {token}"},
                cookies={"better-auth.session_token": token},
                timeout=5,
            )
            if resp.status_code != 200:
                return jsonify({"error": "Invalid or expired token"}), 401
            session_data = resp.json()
            if not session_data or not session_data.get("user"):
                return jsonify({"error": "Invalid or expired token"}), 401
            g.user = session_data["user"]
        except Exception:
            return jsonify({"error": "Auth service unavailable"}), 401

        return f(*args, **kwargs)
    return decorated


# --- Flask App ---

app = Flask(__name__)
CORS(app, supports_credentials=True, expose_headers=["Authorization"])


@app.route("/api/hello")
def hello():
    return jsonify({
        "message": "Hello from Flask!",
        "timestamp": datetime.now(timezone.utc).isoformat()
    })


@app.route("/api/chart-data")
# @require_auth  # TODO: re-enable auth
def get_chart_data():
    try:
        with Session(engine) as session:
            rows = session.query(ChartData).all()
            result = [
                {
                    "id": row.id,
                    "month": row.month,
                    "data_field1": float(row.data_field1) if row.data_field1 is not None else None,
                    "data_field2": float(row.data_field2) if row.data_field2 is not None else None,
                    "data_field3": float(row.data_field3) if row.data_field3 is not None else None,
                    "data_field4": row.data_field4,
                }
                for row in rows
            ]
            return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/health")
@require_auth
def health():
    try:
        with Session(engine) as session:
            session.execute(text("SELECT 1"))
            return jsonify({"status": "ok"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 503


if __name__ == "__main__":
    app.run(debug=True, port=5001)

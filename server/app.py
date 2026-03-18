import os
import sys
from decimal import Decimal
from pathlib import Path
from datetime import datetime, timezone

from dotenv import load_dotenv
from flask import Flask, jsonify
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


# --- Flask App ---

app = Flask(__name__)
CORS(app)


@app.route("/api/hello")
def hello():
    return jsonify({
        "message": "Hello from Flask!",
        "timestamp": datetime.now(timezone.utc).isoformat()
    })


@app.route("/api/chart-data")
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
def health():
    try:
        with Session(engine) as session:
            session.execute(text("SELECT 1"))
            return jsonify({"status": "ok"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 503


if __name__ == "__main__":
    app.run(debug=True, port=5001)

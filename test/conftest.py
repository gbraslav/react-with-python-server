import sys
from pathlib import Path

# Add project root to sys.path so "server.app" is importable
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pytest
from server.app import app


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

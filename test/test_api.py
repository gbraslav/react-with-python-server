def test_health_requires_auth(client):
    resp = client.get("/api/health")
    assert resp.status_code == 401


def test_chart_data_requires_auth(client):
    resp = client.get("/api/chart-data")
    assert resp.status_code == 401


def test_hello_is_public(client):
    resp = client.get("/api/hello")
    assert resp.status_code == 200
    data = resp.get_json()
    assert "message" in data
    assert "timestamp" in data

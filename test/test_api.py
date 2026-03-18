def test_health_returns_ok(client):
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["status"] == "ok"


def test_hello_returns_message_and_timestamp(client):
    resp = client.get("/api/hello")
    assert resp.status_code == 200
    data = resp.get_json()
    assert "message" in data
    assert "timestamp" in data


def test_chart_data_returns_list(client):
    resp = client.get("/api/chart-data")
    assert resp.status_code == 200
    data = resp.get_json()
    assert isinstance(data, list)


def test_chart_data_items_have_expected_keys(client):
    resp = client.get("/api/chart-data")
    data = resp.get_json()
    expected_keys = {"id", "month", "data_field1", "data_field2", "data_field3", "data_field4"}
    for item in data:
        assert expected_keys.issubset(item.keys())

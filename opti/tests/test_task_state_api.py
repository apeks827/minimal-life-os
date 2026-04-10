import os
from pathlib import Path

from fastapi.testclient import TestClient


def _client(tmp_path: Path) -> TestClient:
    os.environ["OPT_DATA_DIR"] = str(tmp_path)
    from app.main import app

    return TestClient(app)


def test_get_new_session_returns_default_shape(tmp_path: Path):
    client = _client(tmp_path)

    response = client.get("/api/v1/task-state")

    assert response.status_code == 200
    payload = response.json()
    assert payload["inbox"] == []
    assert payload["today"] == []
    assert payload["later"] == []
    assert payload["focus"] is None
    assert payload["completed"] == []
    assert payload["session_count"] == 0
    assert payload["carry_forward_queue"] == []


def test_put_and_get_persists_state(tmp_path: Path):
    client = _client(tmp_path)

    state = {
        "inbox": [{"id": "a", "title": "Inbox A", "completed": False}],
        "today": [{"id": "b", "title": "Today B", "completed": False}],
        "later": [{"id": "c", "title": "Later C", "completed": False}],
        "focus": {"id": "b", "title": "Today B", "completed": False},
        "completed": [{"id": "d", "title": "Done D", "completed": True}],
        "session_count": 2,
        "carry_forward_queue": [],
    }

    put_response = client.put("/api/v1/task-state", json=state)
    assert put_response.status_code == 200

    get_response = client.get("/api/v1/task-state")
    assert get_response.status_code == 200
    assert get_response.json()["session_count"] == 2
    assert len(get_response.json()["inbox"]) == 1
    assert get_response.json()["focus"]["id"] == "b"


def test_today_limit_enforced(tmp_path: Path):
    client = _client(tmp_path)

    invalid = {
        "inbox": [],
        "today": [
            {"id": "1", "title": "1", "completed": False},
            {"id": "2", "title": "2", "completed": False},
            {"id": "3", "title": "3", "completed": False},
            {"id": "4", "title": "4", "completed": False},
        ],
        "later": [],
        "focus": None,
        "completed": [],
        "session_count": 0,
        "carry_forward_queue": [],
    }

    response = client.put("/api/v1/task-state", json=invalid)

    assert response.status_code == 422


def test_carry_forward_queue_normalized_to_empty(tmp_path: Path):
    client = _client(tmp_path)

    invalid = {
        "inbox": [],
        "today": [],
        "later": [],
        "focus": None,
        "completed": [],
        "session_count": 0,
        "carry_forward_queue": [
            {"id": "x", "title": "Should drop", "completed": False}
        ],
    }

    response = client.put("/api/v1/task-state", json=invalid)

    assert response.status_code == 422

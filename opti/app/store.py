import json
import os
from pathlib import Path
from .models import TaskState, DEFAULT_TASK_STATE

DATA_DIR = Path(os.environ.get("OPT_DATA_DIR", "data"))
DATA_FILE = DATA_DIR / "task_state.json"


def _ensure_data_dir() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)


def load_state() -> TaskState:
    _ensure_data_dir()
    if not DATA_FILE.exists():
        return DEFAULT_TASK_STATE.model_copy(deep=True)
    raw = DATA_FILE.read_text()
    data = json.loads(raw)
    state = TaskState.model_validate(data)
    state.carry_forward_queue = []
    return state


def save_state(state: TaskState) -> TaskState:
    state.carry_forward_queue = []
    _ensure_data_dir()
    serializable = state.model_dump(mode="json")
    DATA_FILE.write_text(json.dumps(serializable, indent=2))
    return state

from fastapi import APIRouter

from .models import TaskState
from .store import load_state, save_state

router = APIRouter(prefix="/api/v1", tags=["task-state"])


@router.get("/task-state", response_model=TaskState)
def get_task_state() -> TaskState:
    return load_state()


@router.put("/task-state", response_model=TaskState)
def put_task_state(state: TaskState) -> TaskState:
    state.carry_forward_queue = []
    return save_state(state)

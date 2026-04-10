from pydantic import BaseModel, Field, field_validator
from typing import List, Optional


class TaskItem(BaseModel):
    id: str = Field(..., description="Unique task identifier")
    title: str = Field(..., description="Task title text")
    completed: bool = Field(default=False, description="Completion status")


class TaskState(BaseModel):
    inbox: List[TaskItem] = Field(default_factory=list)
    today: List[TaskItem] = Field(default_factory=list)
    later: List[TaskItem] = Field(default_factory=list)
    focus: Optional[TaskItem] = Field(default=None)
    completed: List[TaskItem] = Field(default_factory=list)
    session_count: int = Field(default=0, ge=0)
    carry_forward_queue: List[TaskItem] = Field(default_factory=list)

    @field_validator("today")
    @classmethod
    def today_max_three(cls, v):
        if len(v) > 3:
            raise ValueError("today list must have at most 3 items")
        return v

    @field_validator("carry_forward_queue")
    @classmethod
    def carry_forward_queue_must_be_empty(cls, v):
        if len(v) != 0:
            raise ValueError("carryForwardQueue must be empty on load/save")
        return v

    def model_post_init(self, _):
        self.carry_forward_queue = []


DEFAULT_TASK_STATE = TaskState()

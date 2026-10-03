"""
Schedule and Scheduling Run Models for Smart OR Scheduler
"""

from typing import Dict, Any, Optional
import time

class Schedule:
    def __init__(
        self,
        id: str,
        surgery_id: str,
        room_id: str,
        start_time: str,
        end_time: str,
        score: float = 0.0,
        status: str = "Confirmed",
        created_at: Optional[float] = None
    ):
        self.id = id
        self.surgery_id = surgery_id
        self.room_id = room_id
        self.start_time = start_time
        self.end_time = end_time
        self.score = float(score)
        self.status = status
        self.created_at = created_at or time.time()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "surgery_id": self.surgery_id,
            "room_id": self.room_id,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "score": self.score,
            "status": self.status,
            "created_at": self.created_at
        }

class SchedulingRun:
    def __init__(
        self,
        id: str,
        run_name: str,
        total_surgeries: int,
        scheduled_surgeries: int,
        unscheduled_surgeries: int,
        objective_value: float,
        average_waiting_time: float,
        room_utilization: float,
        deadline_compliance: float,
        total_idle_time: float,
        created_at: Optional[float] = None
    ):
        self.id = id
        self.run_name = run_name
        self.total_surgeries = total_surgeries
        self.scheduled_surgeries = scheduled_surgeries
        self.unscheduled_surgeries = unscheduled_surgeries
        self.objective_value = objective_value
        self.average_waiting_time = average_waiting_time
        self.room_utilization = room_utilization
        self.deadline_compliance = deadline_compliance
        self.total_idle_time = total_idle_time
        self.created_at = created_at or time.time()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "run_name": self.run_name,
            "total_surgeries": self.total_surgeries,
            "scheduled_surgeries": self.scheduled_surgeries,
            "unscheduled_surgeries": self.unscheduled_surgeries,
            "objective_value": self.objective_value,
            "average_waiting_time": self.average_waiting_time,
            "room_utilization": self.room_utilization,
            "deadline_compliance": self.deadline_compliance,
            "total_idle_time": self.total_idle_time,
            "created_at": self.created_at
        }

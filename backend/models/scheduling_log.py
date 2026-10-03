"""
Scheduling Log Model for Smart OR Scheduler
"""

from typing import Dict, Any, List, Optional
import time

class SchedulingLog:
    def __init__(
        self,
        id: str,
        scheduling_run_id: str,
        surgery_id: str,
        selected_priority: float,
        candidate_rooms: List[str],
        candidate_slots: List[Dict[str, Any]],
        rejected_candidates: List[Any],
        selected_room: Optional[str],
        selected_start: Optional[str],
        selected_end: Optional[str],
        decision: str, # SCHEDULED or UNSCHEDULED
        reason: str,
        score: float = 0.0,
        created_at: Optional[float] = None
    ):
        self.id = id
        self.scheduling_run_id = scheduling_run_id
        self.surgery_id = surgery_id
        self.selected_priority = selected_priority
        self.candidate_rooms = candidate_rooms
        self.candidate_slots = candidate_slots
        self.rejected_candidates = rejected_candidates
        self.selected_room = selected_room
        self.selected_start = selected_start
        self.selected_end = selected_end
        self.decision = decision
        self.reason = reason
        self.score = score
        self.created_at = created_at or time.time()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "scheduling_run_id": self.scheduling_run_id,
            "surgery_id": self.surgery_id,
            "selected_priority": self.selected_priority,
            "candidate_rooms": self.candidate_rooms,
            "candidate_slots": self.candidate_slots,
            "rejected_candidates": self.rejected_candidates,
            "selected_room": self.selected_room,
            "selected_start": self.selected_start,
            "selected_end": self.selected_end,
            "decision": self.decision,
            "reason": self.reason,
            "score": self.score,
            "created_at": self.created_at
        }

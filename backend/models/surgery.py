"""
Surgery Model for Smart OR Scheduler
"""

from typing import Dict, Any, List, Optional
import time

class Surgery:
    def __init__(
        self,
        id: str,
        patient_name: str,
        patient_id: str,
        surgery_name: str,
        surgery_type: str,
        surgeon_name: str,
        duration_minutes: int,
        priority_level: str, # Emergency, Critical, High, Medium, Low
        urgency_level: str,  # Immediate, Very Urgent, Urgent, Normal
        requested_start: str = "08:00",
        deadline: str = "17:00",
        required_room_type: str = "General",
        required_equipment: Optional[List[str]] = None,
        priority_score: float = 0.0,
        status: str = "Pending", # Pending, Scheduled, Unscheduled, Completed
        created_at: Optional[float] = None
    ):
        self.id = id
        self.patient_name = patient_name
        self.patient_id = patient_id
        self.surgery_name = surgery_name
        self.surgery_type = surgery_type
        self.surgeon_name = surgeon_name
        self.duration_minutes = int(duration_minutes)
        self.priority_level = priority_level
        self.urgency_level = urgency_level
        self.requested_start = requested_start
        self.deadline = deadline
        self.required_room_type = required_room_type
        self.required_equipment = required_equipment or []
        self.priority_score = float(priority_score)
        self.status = status
        self.created_at = created_at or time.time()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "patient_name": self.patient_name,
            "patient_id": self.patient_id,
            "surgery_name": self.surgery_name,
            "surgery_type": self.surgery_type,
            "surgeon_name": self.surgeon_name,
            "duration_minutes": self.duration_minutes,
            "priority_level": self.priority_level,
            "urgency_level": self.urgency_level,
            "requested_start": self.requested_start,
            "deadline": self.deadline,
            "required_room_type": self.required_room_type,
            "required_equipment": self.required_equipment,
            "priority_score": self.priority_score,
            "status": self.status,
            "created_at": self.created_at
        }

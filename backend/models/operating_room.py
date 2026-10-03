"""
Operating Room and Unavailability Models for Smart OR Scheduler
"""

from typing import Dict, Any, List, Optional

class OperatingRoom:
    def __init__(
        self,
        id: str,
        room_name: str,
        room_type: str,
        opening_time: str = "08:00",
        closing_time: str = "17:00",
        equipment: Optional[List[str]] = None,
        status: str = "Active"
    ):
        self.id = id
        self.room_name = room_name
        self.room_type = room_type
        self.opening_time = opening_time
        self.closing_time = closing_time
        self.equipment = equipment or []
        self.status = status

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "room_name": self.room_name,
            "room_type": self.room_type,
            "opening_time": self.opening_time,
            "closing_time": self.closing_time,
            "equipment": self.equipment,
            "status": self.status
        }

class RoomUnavailability:
    def __init__(
        self,
        id: str,
        room_id: str,
        unavailable_start: str,
        unavailable_end: str,
        reason: str
    ):
        self.id = id
        self.room_id = room_id
        self.unavailable_start = unavailable_start
        self.unavailable_end = unavailable_end
        self.reason = reason

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "room_id": self.room_id,
            "unavailable_start": self.unavailable_start,
            "unavailable_end": self.unavailable_end,
            "reason": self.reason
        }

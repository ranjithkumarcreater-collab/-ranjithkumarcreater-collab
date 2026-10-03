"""
Job Sequencing Algorithm for Smart OR Scheduler
Duration-aware Job Sequencing that treats surgeries as contiguous jobs requiring
multiple discrete time units (e.g. 15-minute or 30-minute blocks) without interruption.
"""

from typing import List, Dict, Any, Tuple
from backend.algorithms.scoring import time_str_to_minutes, minutes_to_time_str
from backend.algorithms.constraint_checker import evaluate_slot_feasibility

class SurgeryJob:
    """Represents a surgery formatted as a scheduling Job."""

    def __init__(self, surgery_dict: Dict[str, Any]):
        self.raw = surgery_dict
        self.id = surgery_dict.get("id") or surgery_dict.get("patient_id")
        self.patient_name = surgery_dict.get("patient_name", "")
        self.surgery_name = surgery_dict.get("surgery_name", "")
        self.duration_minutes = int(surgery_dict.get("duration_minutes", 60))
        self.priority_level = surgery_dict.get("priority_level", "Medium")
        self.urgency_level = surgery_dict.get("urgency_level", "Normal")
        self.requested_start = surgery_dict.get("requested_start", "08:00")
        self.deadline = surgery_dict.get("deadline", "17:00")
        self.required_room_type = surgery_dict.get("required_room_type", "General")
        self.required_equipment = surgery_dict.get("required_equipment", [])

    def duration_in_slots(self, slot_interval_minutes: int = 30) -> int:
        """Returns the number of discrete time slots needed."""
        return (self.duration_minutes + slot_interval_minutes - 1) // slot_interval_minutes

    def __repr__(self) -> str:
        return f"<Job {self.id}: {self.surgery_name} ({self.duration_minutes}m, due {self.deadline})>"


def find_feasible_candidate_slots(
    surgery: Dict[str, Any],
    room: Dict[str, Any],
    room_bookings: List[Dict[str, Any]],
    room_unavailabilities: List[Dict[str, Any]],
    all_bookings: List[Dict[str, Any]] = None,
    slot_interval_minutes: int = 30,
    enforce_deadline: bool = True
) -> List[Dict[str, Any]]:
    """
    Finds all contiguous feasible start and end time windows in a room for the given surgery duration.
    Iterates through the room's open schedule using the configured scheduling increment (e.g. 30 mins).
    Verifies that the entire continuous duration [start, start + duration] is free from:
    - Closures / maintenance
    - Booked surgeries
    - Room closing bounds
    - Deadline constraints
    """
    duration = int(surgery.get("duration_minutes", 60))
    if duration <= 0:
        return []

    room_open = time_str_to_minutes(room.get("opening_time", "08:00"))
    room_close = time_str_to_minutes(room.get("closing_time", "17:00"))
    deadline_mins = time_str_to_minutes(surgery.get("deadline", "18:00"))
    req_start_mins = time_str_to_minutes(surgery.get("requested_start", "08:00"))

    candidate_slots = []

    # Sort existing bookings to easily measure idle gaps
    sorted_bookings = sorted(
        room_bookings,
        key=lambda b: time_str_to_minutes(b.get("start_time", "00:00"))
    )

    current_start = room_open
    while current_start + duration <= room_close:
        current_end = current_start + duration

        # Check feasibility against all hard constraints
        feasible, reasons = evaluate_slot_feasibility(
            surgery=surgery,
            room=room,
            start_minutes=current_start,
            end_minutes=current_end,
            existing_bookings=sorted_bookings,
            room_unavailabilities=room_unavailabilities,
            all_bookings=all_bookings,
            enforce_deadline=enforce_deadline
        )

        # Determine previous event end time in this room for idle time computation
        prev_end = room_open
        for b in sorted_bookings:
            b_end = time_str_to_minutes(b.get("end_time", "00:00"))
            if b_end <= current_start:
                prev_end = max(prev_end, b_end)

        slot_info = {
            "room_id": room.get("id"),
            "room_name": room.get("room_name"),
            "start_minutes": current_start,
            "end_minutes": current_end,
            "start_time": minutes_to_time_str(current_start),
            "end_time": minutes_to_time_str(current_end),
            "duration_minutes": duration,
            "feasible": feasible,
            "reasons": reasons,
            "previous_end_minutes": prev_end,
            "is_preferred_start": current_start == req_start_mins,
            "exceeds_deadline": current_end > deadline_mins
        }

        candidate_slots.append(slot_info)
        current_start += slot_interval_minutes

    return candidate_slots


def get_free_intervals_for_room(
    room: Dict[str, Any],
    room_bookings: List[Dict[str, Any]],
    room_unavailabilities: List[Dict[str, Any]]
) -> List[Tuple[int, int]]:
    """
    Returns list of contiguous (start_min, end_min) free windows in the room.
    Useful for quick visualization of available room chunks.
    """
    room_open = time_str_to_minutes(room.get("opening_time", "08:00"))
    room_close = time_str_to_minutes(room.get("closing_time", "17:00"))

    # Blocked intervals
    blocked = []
    for b in room_bookings:
        blocked.append((
            time_str_to_minutes(b.get("start_time", "00:00")),
            time_str_to_minutes(b.get("end_time", "00:00"))
        ))
    for u in room_unavailabilities:
        blocked.append((
            time_str_to_minutes(u.get("unavailable_start", "00:00")),
            time_str_to_minutes(u.get("unavailable_end", "00:00"))
        ))

    # Sort and merge overlapping blocks
    if not blocked:
        return [(room_open, room_close)]

    blocked.sort(key=lambda x: x[0])
    merged = []
    for interval in blocked:
        if not merged or merged[-1][1] < interval[0]:
            merged.append(interval)
        else:
            merged[-1] = (merged[-1][0], max(merged[-1][1], interval[1]))

    # Now calculate complementary free intervals
    free_intervals = []
    cursor = room_open
    for b_start, b_end in merged:
        if b_start > cursor:
            free_intervals.append((cursor, min(b_start, room_close)))
        cursor = max(cursor, b_end)

    if cursor < room_close:
        free_intervals.append((cursor, room_close))

    return [(s, e) for s, e in free_intervals if e > s]

"""
Constraint Checker for Smart OR Scheduler
Enforces all 8 Hard Constraints:
1. No overlapping surgeries in one room
2. Surgery must fit inside room working hours
3. Surgery duration must be completely accommodated (contiguous block)
4. Surgery must finish before deadline (or flags deadline violation)
5. Room type must match surgery requirement
6. Required equipment must exist in the selected room
7. Temporary room closures must be respected
8. The same exclusive resource cannot be assigned to conflicting surgeries
"""

from typing import Dict, Any, List, Tuple
from backend.algorithms.scoring import time_str_to_minutes, minutes_to_time_str

def check_room_type_match(surgery: Dict[str, Any], room: Dict[str, Any]) -> Tuple[bool, str]:
    """Constraint 5: Room type compatibility check."""
    req_type = surgery.get("required_room_type", "").strip().lower()
    room_type = room.get("room_type", "").strip().lower()

    if not req_type or req_type == "general":
        # General can be accommodated in most rooms or General
        return True, "Compatible room type"

    # Specific room type required
    if req_type in room_type or room_type in req_type:
        return True, f"Room type matches '{surgery.get('required_room_type')}'"

    # Hybrid OR is compatible with Cardiac and Vascular and Orthopedic
    if "hybrid" in room_type and any(t in req_type for t in ["cardiac", "vascular", "orthopedic"]):
        return True, "Hybrid OR satisfies specialized requirement"

    return False, f"Room type mismatch: surgery requires '{surgery.get('required_room_type')}', but room is '{room.get('room_type')}'"


def check_equipment_availability(surgery: Dict[str, Any], room: Dict[str, Any]) -> Tuple[bool, str]:
    """Constraint 6: Required equipment verification."""
    req_equip = surgery.get("required_equipment", [])
    if isinstance(req_equip, str):
        # Could be comma separated
        req_equip = [e.strip() for e in req_equip.split(",") if e.strip()]

    if not req_equip:
        return True, "No special equipment required"

    room_equip = room.get("equipment", [])
    if isinstance(room_equip, str):
        room_equip = [e.strip().lower() for e in room_equip.split(",") if e.strip()]
    else:
        room_equip = [str(e).strip().lower() for e in room_equip]

    missing = []
    for eq in req_equip:
        if not any(eq.lower() in r_eq for r_eq in room_equip):
            missing.append(eq)

    if missing:
        return False, f"Required equipment missing: {', '.join(missing)}"
    return True, "All required equipment present"


def check_working_hours(
    start_minutes: int,
    end_minutes: int,
    room: Dict[str, Any]
) -> Tuple[bool, str]:
    """Constraint 2 & 3: Surgery must fit completely within room operating hours."""
    open_mins = time_str_to_minutes(room.get("opening_time", "08:00"))
    close_mins = time_str_to_minutes(room.get("closing_time", "17:00"))

    if start_minutes < open_mins:
        return False, f"Starts before room opening ({minutes_to_time_str(open_mins)})"
    if end_minutes > close_mins:
        return False, f"Exceeds room closing time ({minutes_to_time_str(close_mins)})"
    if end_minutes <= start_minutes:
        return False, "Invalid non-positive duration interval"

    return True, "Fits within room operating hours"


def check_room_unavailability_overlap(
    start_minutes: int,
    end_minutes: int,
    unavailabilities: List[Dict[str, Any]]
) -> Tuple[bool, str]:
    """Constraint 7: Temporary room closures / maintenance must be respected."""
    for unavail in unavailabilities:
        un_start = time_str_to_minutes(unavail.get("unavailable_start", "00:00"))
        un_end = time_str_to_minutes(unavail.get("unavailable_end", "00:00"))
        reason = unavail.get("reason", "Maintenance")

        # Check interval intersection: max(start1, start2) < min(end1, end2)
        if max(start_minutes, un_start) < min(end_minutes, un_end):
            return False, f"Conflicts with temporary room closure ({minutes_to_time_str(un_start)} - {minutes_to_time_str(un_end)}: {reason})"

    return True, "No conflict with temporary closures"


def check_booking_overlap(
    start_minutes: int,
    end_minutes: int,
    existing_bookings: List[Dict[str, Any]],
    exclude_surgery_id: Any = None
) -> Tuple[bool, str]:
    """Constraint 1: No overlapping surgeries in the same operating room."""
    for booking in existing_bookings:
        if exclude_surgery_id and booking.get("surgery_id") == exclude_surgery_id:
            continue

        b_start = time_str_to_minutes(booking.get("start_time", "00:00"))
        b_end = time_str_to_minutes(booking.get("end_time", "00:00"))

        if max(start_minutes, b_start) < min(end_minutes, b_end):
            conflict_name = booking.get("surgery_name", booking.get("surgery_id", "Another procedure"))
            return False, f"Overlaps with scheduled surgery: {conflict_name} ({booking.get('start_time')} - {booking.get('end_time')})"

    return True, "No booking overlap"


def check_deadline_compliance(
    end_minutes: int,
    surgery: Dict[str, Any],
    strict: bool = True
) -> Tuple[bool, str]:
    """Constraint 4: Surgery should finish before its deadline."""
    deadline_str = surgery.get("deadline", "18:00")
    deadline_mins = time_str_to_minutes(deadline_str)

    if end_minutes > deadline_mins:
        msg = f"Finishes at {minutes_to_time_str(end_minutes)}, which violates deadline ({deadline_str})"
        if strict:
            return False, msg
        return True, msg + " (warning: late completion)"

    buffer_mins = deadline_mins - end_minutes
    return True, f"Satisfies deadline {deadline_str} with {buffer_mins}m buffer"


def check_exclusive_resource_conflict(
    surgery: Dict[str, Any],
    start_minutes: int,
    end_minutes: int,
    all_room_schedules: List[Dict[str, Any]]
) -> Tuple[bool, str]:
    """Constraint 8: The same exclusive resource (e.g. specialized mobile C-Arm, robotic console) cannot be shared simultaneously."""
    req_exclusive = surgery.get("exclusive_equipment", [])
    if isinstance(req_exclusive, str):
        req_exclusive = [e.strip() for e in req_exclusive.split(",") if e.strip()]

    if not req_exclusive:
        return True, "No exclusive shared resource constraint"

    for booking in all_room_schedules:
        b_start = time_str_to_minutes(booking.get("start_time", "00:00"))
        b_end = time_str_to_minutes(booking.get("end_time", "00:00"))

        if max(start_minutes, b_start) < min(end_minutes, b_end):
            b_exclusive = booking.get("exclusive_equipment", [])
            for res in req_exclusive:
                if res in b_exclusive:
                    return False, f"Exclusive resource '{res}' already in use by {booking.get('surgery_name', 'surgery')} at this time"

    return True, "No exclusive resource conflicts"


def evaluate_slot_feasibility(
    surgery: Dict[str, Any],
    room: Dict[str, Any],
    start_minutes: int,
    end_minutes: int,
    existing_bookings: List[Dict[str, Any]],
    room_unavailabilities: List[Dict[str, Any]],
    all_bookings: List[Dict[str, Any]] = None,
    enforce_deadline: bool = True
) -> Tuple[bool, List[str]]:
    """
    Evaluates whether a candidate slot [start_minutes, end_minutes] in room satisfies all constraints.
    Returns (is_feasible, list_of_reasons_or_failures).
    """
    reasons = []

    # 1. Working hours
    ok, msg = check_working_hours(start_minutes, end_minutes, room)
    if not ok:
        return False, [msg]
    reasons.append(msg)

    # 2. Temporary closures
    ok, msg = check_room_unavailability_overlap(start_minutes, end_minutes, room_unavailabilities)
    if not ok:
        return False, [msg]
    reasons.append(msg)

    # 3. Booking overlap
    ok, msg = check_booking_overlap(start_minutes, end_minutes, existing_bookings)
    if not ok:
        return False, [msg]
    reasons.append(msg)

    # 4. Deadline compliance
    ok, msg = check_deadline_compliance(end_minutes, surgery, strict=enforce_deadline)
    if not ok:
        return False, [msg]
    reasons.append(msg)

    # 5. Exclusive resources
    if all_bookings:
        ok, msg = check_exclusive_resource_conflict(surgery, start_minutes, end_minutes, all_bookings)
        if not ok:
            return False, [msg]
        reasons.append(msg)

    return True, reasons

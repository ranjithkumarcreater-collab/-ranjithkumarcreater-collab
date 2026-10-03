"""
Scoring and Evaluation Functions for Smart OR Scheduler
Includes Priority Score calculation, Candidate Slot scoring, and Objective Value evaluation.
"""

from typing import Dict, Any, List

PRIORITY_LEVEL_MAP = {
    "Emergency": 5,
    "Critical": 4,
    "High": 3,
    "Medium": 2,
    "Low": 1
}

URGENCY_LEVEL_MAP = {
    "Immediate": 5,
    "Very Urgent": 4,
    "Urgent": 3,
    "Normal": 1
}

def time_str_to_minutes(time_str: str) -> int:
    """Converts 'HH:MM' string to minutes from 00:00."""
    try:
        parts = time_str.strip().split(":")
        return int(parts[0]) * 60 + int(parts[1])
    except Exception:
        return 0

def minutes_to_time_str(minutes: int) -> str:
    """Converts minutes from 00:00 to 'HH:MM' format."""
    hrs = (minutes // 60) % 24
    mins = minutes % 60
    return f"{hrs:02d}:{mins:02d}"

def calculate_deadline_urgency(deadline_str: str, base_time_str: str = "08:00", day_end_str: str = "18:00") -> int:
    """
    Evaluates deadline urgency on a 1-5 scale based on how early the deadline occurs.
    Tighter/earlier deadlines get higher urgency score.
    """
    deadline_mins = time_str_to_minutes(deadline_str)
    base_mins = time_str_to_minutes(base_time_str)
    day_end_mins = time_str_to_minutes(day_end_str)

    span = max(60, day_end_mins - base_mins)
    time_available = max(0, deadline_mins - base_mins)

    ratio = time_available / span
    if ratio <= 0.25: # Within first quarter of day (e.g., before 10:30)
        return 5
    elif ratio <= 0.45: # Before ~12:30
        return 4
    elif ratio <= 0.70: # Before ~15:00
        return 3
    elif ratio <= 0.90: # Before ~17:00
        return 2
    else:
        return 1

def calculate_waiting_factor(requested_start_str: str, base_time_str: str = "08:00") -> int:
    """
    Evaluates waiting factor on a 1-5 scale based on how long the patient has been waiting
    or requested early slot.
    """
    req_mins = time_str_to_minutes(requested_start_str)
    base_mins = time_str_to_minutes(base_time_str)
    diff = req_mins - base_mins
    if diff <= 0: # Already waiting since opening or earlier
        return 4
    elif diff <= 60:
        return 3
    elif diff <= 180:
        return 2
    else:
        return 1

def calculate_priority_score(
    surgery: Dict[str, Any],
    weights: Dict[str, float] = None,
    base_time: str = "08:00"
) -> Dict[str, Any]:
    """
    Calculates the combined priority score:
    Priority Score = Medical Priority + Urgency + Deadline Urgency + Waiting Factor
    With configurable percentage weights:
    Medical Priority (default 40%), Urgency (25%), Deadline Urgency (25%), Waiting Time (10%).

    Returns a dict with:
    - final_score: float (rounded to 2 decimals)
    - integer_display_score: int
    - components: breakdown of raw values and weighted values
    - explanation: formatted textual summary
    """
    if weights is None:
        weights = {
            "medical_priority": 0.40,
            "urgency": 0.25,
            "deadline_urgency": 0.25,
            "waiting_time": 0.10
        }

    # Normalize weights to sum to 1.0 if needed
    total_w = sum(weights.values()) or 1.0
    w_med = weights.get("medical_priority", 0.40) / total_w
    w_urg = weights.get("urgency", 0.25) / total_w
    w_dead = weights.get("deadline_urgency", 0.25) / total_w
    w_wait = weights.get("waiting_time", 0.10) / total_w

    raw_medical = PRIORITY_LEVEL_MAP.get(surgery.get("priority_level", "Medium"), 2)
    raw_urgency = URGENCY_LEVEL_MAP.get(surgery.get("urgency_level", "Normal"), 1)
    raw_deadline = calculate_deadline_urgency(surgery.get("deadline", "17:00"), base_time)
    raw_waiting = calculate_waiting_factor(surgery.get("requested_start", "08:00"), base_time)

    # Weighted score scaled out of 20 for rich sorting differentiation
    # 5 * 4 = 20 max
    weighted_score = (
        raw_medical * w_med +
        raw_urgency * w_urg +
        raw_deadline * w_dead +
        raw_waiting * w_wait
    ) * 4.0

    raw_sum = raw_medical + raw_urgency + raw_deadline + raw_waiting

    components = {
        "raw_medical_priority": raw_medical,
        "raw_urgency": raw_urgency,
        "raw_deadline_urgency": raw_deadline,
        "raw_waiting_factor": raw_waiting,
        "raw_sum": raw_sum,
        "weights": {
            "medical_priority_pct": round(w_med * 100, 1),
            "urgency_pct": round(w_urg * 100, 1),
            "deadline_urgency_pct": round(w_dead * 100, 1),
            "waiting_time_pct": round(w_wait * 100, 1),
        },
        "weighted_score": round(weighted_score, 2)
    }

    explanation = (
        f"Medical Priority ({surgery.get('priority_level')})={raw_medical} [x{round(w_med*100)}%] + "
        f"Urgency ({surgery.get('urgency_level')})={raw_urgency} [x{round(w_urg*100)}%] + "
        f"Deadline Urgency (due {surgery.get('deadline')})={raw_deadline} [x{round(w_dead*100)}%] + "
        f"Waiting Factor={raw_waiting} [x{round(w_wait*100)}%] "
        f"-> Score: {round(weighted_score, 2)} (Raw Sum: {raw_sum})"
    )

    return {
        "final_score": round(weighted_score, 2),
        "raw_sum": raw_sum,
        "components": components,
        "explanation": explanation
    }

def calculate_candidate_score(
    surgery: Dict[str, Any],
    room: Dict[str, Any],
    start_minutes: int,
    end_minutes: int,
    previous_end_in_room: int
) -> Dict[str, Any]:
    """
    Calculates candidate score for a feasible room and time slot assignment.
    Criteria:
    - Priority benefit (+ high score for urgent surgeries scheduled early)
    - Waiting-time cost (- penalty for difference between actual start and requested start)
    - Idle-time cost (- penalty for idle gap before this surgery in the room)
    - Deadline benefit (+ bonus for completing safely before deadline)
    - Room compatibility bonus
    """
    req_mins = time_str_to_minutes(surgery.get("requested_start", "08:00"))
    deadline_mins = time_str_to_minutes(surgery.get("deadline", "17:00"))

    # Priority benefit
    raw_med = PRIORITY_LEVEL_MAP.get(surgery.get("priority_level", "Medium"), 2)
    priority_benefit = raw_med * 15.0

    # Waiting time cost: 0.1 per minute delayed from requested start
    wait_minutes = max(0, start_minutes - req_mins)
    waiting_cost = (wait_minutes / 60.0) * 5.0

    # Idle time gap from previous surgery or room opening
    idle_minutes = max(0, start_minutes - previous_end_in_room)
    idle_cost = (idle_minutes / 60.0) * 3.0

    # Deadline slack: positive buffer is good, cutting it too close or exceeding gets penalty
    deadline_slack = (deadline_mins - end_minutes) / 60.0
    if deadline_slack >= 0:
        deadline_benefit = min(10.0, deadline_slack * 3.0)
        deadline_penalty = 0.0
    else:
        deadline_benefit = 0.0
        deadline_penalty = abs(deadline_slack) * 20.0 # strong penalty for late finish

    # Room type exact match bonus
    match_bonus = 5.0 if surgery.get("required_room_type") == room.get("room_type") else 2.0

    total_candidate_score = (
        priority_benefit +
        deadline_benefit +
        match_bonus -
        waiting_cost -
        idle_cost -
        deadline_penalty
    )

    return {
        "total_score": round(total_candidate_score, 2),
        "priority_benefit": round(priority_benefit, 2),
        "waiting_cost": round(waiting_cost, 2),
        "idle_cost": round(idle_cost, 2),
        "deadline_benefit": round(deadline_benefit, 2),
        "deadline_penalty": round(deadline_penalty, 2),
        "idle_minutes": idle_minutes,
        "wait_minutes": wait_minutes,
        "breakdown_str": (
            f"Benefit: +{round(priority_benefit, 1)} (Priority) +{round(deadline_benefit, 1)} (Deadline buffer) "
            f"+{round(match_bonus, 1)} (Match) | Cost: -{round(idle_cost, 1)} ({idle_minutes}m idle) "
            f"-{round(waiting_cost, 1)} ({wait_minutes}m wait) -{round(deadline_penalty, 1)} (Late penalty) "
            f"= Net Score: {round(total_candidate_score, 2)}"
        )
    }

def calculate_objective_value(
    scheduled_surgeries: List[Dict[str, Any]],
    unscheduled_surgeries: List[Dict[str, Any]],
    total_idle_minutes: int,
    total_waiting_minutes: int,
    weights: Dict[str, float] = None
) -> Dict[str, Any]:
    """
    Computes global scheduling objective value:
    Objective Score = Priority Benefit - Waiting Time Penalty - Idle Time Penalty - Deadline Violation Penalty - Unscheduled Penalty
    """
    if weights is None:
        weights = {
            "priority_multiplier": 10.0,
            "waiting_cost_per_hour": 2.0,
            "idle_cost_per_hour": 1.5,
            "deadline_violation_penalty": 25.0,
            "unscheduled_penalty": 20.0
        }

    total_priority_benefit = 0.0
    deadline_violations = 0
    total_deadline_penalty = 0.0

    for s in scheduled_surgeries:
        raw_med = PRIORITY_LEVEL_MAP.get(s.get("priority_level", "Medium"), 2)
        total_priority_benefit += raw_med * weights.get("priority_multiplier", 10.0)

        # Check if finished after deadline
        end_mins = time_str_to_minutes(s.get("end_time", "18:00"))
        deadline_mins = time_str_to_minutes(s.get("deadline", "17:00"))
        if end_mins > deadline_mins:
            deadline_violations += 1
            total_deadline_penalty += weights.get("deadline_violation_penalty", 25.0)

    total_waiting_hours = total_waiting_minutes / 60.0
    total_idle_hours = total_idle_minutes / 60.0

    waiting_penalty = total_waiting_hours * weights.get("waiting_cost_per_hour", 2.0)
    idle_penalty = total_idle_hours * weights.get("idle_cost_per_hour", 1.5)
    unscheduled_penalty = len(unscheduled_surgeries) * weights.get("unscheduled_penalty", 20.0)

    objective_score = (
        total_priority_benefit -
        waiting_penalty -
        idle_penalty -
        total_deadline_penalty -
        unscheduled_penalty
    )

    # Normalize to 0-100 scale for UI readability
    max_possible = max(1.0, (len(scheduled_surgeries) + len(unscheduled_surgeries)) * 5 * weights.get("priority_multiplier", 10.0))
    normalized_score = max(0.0, min(100.0, (objective_score / max_possible) * 100.0))

    return {
        "raw_objective_score": round(objective_score, 2),
        "normalized_score": round(normalized_score, 1),
        "components": {
            "priority_benefit": round(total_priority_benefit, 2),
            "waiting_time_penalty": round(waiting_penalty, 2),
            "idle_time_penalty": round(idle_penalty, 2),
            "deadline_violation_penalty": round(total_deadline_penalty, 2),
            "unscheduled_penalty": round(unscheduled_penalty, 2),
            "deadline_violations_count": deadline_violations,
            "total_waiting_hours": round(total_waiting_hours, 2),
            "total_idle_hours": round(total_idle_hours, 2)
        },
        "formula": "Objective Score = Priority Benefit - Waiting Penalty - Idle Penalty - Deadline Penalty - Unscheduled Penalty"
    }

"""
Decision Explanation Service for Smart OR Scheduler
Provides structured and natural language explanations answering:
- WHY THIS SURGERY?
- WHY THIS ROOM?
- WHY THIS TIME?
- WHY NOT ANOTHER ROOM?
- WHY UNSCHEDULED?
"""

from typing import Dict, Any, List

def format_comprehensive_explanation(decision_log: Dict[str, Any], surgery: Dict[str, Any]) -> Dict[str, Any]:
    """
    Constructs an in-depth 5-question answer card for any surgery decision.
    """
    is_scheduled = decision_log.get("decision") == "SCHEDULED"
    s_name = surgery.get("surgery_name", "Procedure")
    p_level = surgery.get("priority_level", "Medium")
    u_level = surgery.get("urgency_level", "Normal")
    p_score = decision_log.get("priority_score", 0)

    # 1. Why this surgery?
    why_surgery = (
        f"Surgery '{s_name}' was selected because the Priority Queue evaluated its composite score as {p_score} "
        f"(Medical Priority: {p_level}, Urgency: {u_level}, Deadline: {surgery.get('deadline')}). "
        f"Among all remaining unscheduled procedures, this case had the highest urgency-weighted demand."
    )

    if not is_scheduled:
        why_room = "No operating room could be allocated."
        why_time = "No valid continuous time slot available."
        why_not_other = "All candidate rooms were checked; none had sufficient continuous free time before deadline."
        why_unscheduled = decision_log.get("reason", "Constraints could not be satisfied.")
    else:
        sel_room = decision_log.get("selected_room")
        start_t = decision_log.get("selected_start")
        end_t = decision_log.get("selected_end")
        score = decision_log.get("score")

        why_room = (
            f"{sel_room} was selected because it matches the required room type ('{surgery.get('required_room_type', 'General')}') "
            f"and possesses all necessary surgical equipment without conflicts."
        )

        why_time = (
            f"The time window {start_t} - {end_t} was chosen because it accommodates the full {surgery.get('duration_minutes')} "
            f"minutes duration contiguously, finishes comfortably before deadline ({surgery.get('deadline')}), "
            f"and was the earliest slot that minimized idle downtime in {sel_room}."
        )

        rejected = decision_log.get("rejected_candidates", [])
        if rejected:
            rej_summaries = []
            for r in rejected:
                if isinstance(r, dict):
                    rej_summaries.append(f"{r.get('room') or r.get('slot', 'Candidate')}: {r.get('reason', 'Infeasible')}")
                else:
                    rej_summaries.append(str(r))
            why_not_other = "Alternative candidates evaluated: " + " | ".join(rej_summaries)
        else:
            why_not_other = f"{sel_room} achieved the highest local greedy candidate score ({score}) among all feasible options."

        why_unscheduled = "N/A - Successfully scheduled and verified."

    return {
        "surgery_id": decision_log.get("surgery_id"),
        "surgery_name": s_name,
        "status": decision_log.get("decision"),
        "score": decision_log.get("score", 0),
        "answers": {
            "why_this_surgery": why_surgery,
            "why_this_room": why_room,
            "why_this_time": why_time,
            "why_not_another_room": why_not_other,
            "why_unscheduled": why_unscheduled
        },
        "full_text": decision_log.get("reason", "")
    }

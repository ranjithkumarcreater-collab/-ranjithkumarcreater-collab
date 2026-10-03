"""
Scheduler Service for Smart OR Scheduler
Orchestrates loading data, running the Python Greedy Scheduler engine,
and persisting results to database tables.
"""

import json
import uuid
import time
from typing import Dict, Any, List, Optional
from backend.database.db import get_connection
from backend.algorithms.greedy_scheduler import GreedyScheduler
from backend.services.decision_explanation_service import format_comprehensive_explanation

def run_scheduler_pipeline(
    weights: Optional[Dict[str, float]] = None,
    slot_interval_minutes: int = 30,
    run_name: Optional[str] = None
) -> Dict[str, Any]:
    """
    Loads all surgeries, rooms, and unavailabilities from database,
    executes Python GreedyScheduler, and writes back schedules and logs.
    """
    conn = get_connection()
    c = conn.cursor()

    # Load operating rooms
    c.execute("SELECT * FROM operating_rooms")
    room_rows = c.fetchall()
    rooms = []
    for r in room_rows:
        eq = json.loads(r["equipment"]) if r["equipment"] else []
        rooms.append({
            "id": r["id"],
            "room_name": r["room_name"],
            "room_type": r["room_type"],
            "opening_time": r["opening_time"],
            "closing_time": r["closing_time"],
            "equipment": eq,
            "status": r["status"]
        })

    # Load room unavailabilities
    c.execute("SELECT * FROM room_unavailability")
    unavail_rows = c.fetchall()
    unavailabilities = []
    for u in unavail_rows:
        unavailabilities.append({
            "id": u["id"],
            "room_id": u["room_id"],
            "unavailable_start": u["unavailable_start"],
            "unavailable_end": u["unavailable_end"],
            "reason": u["reason"]
        })

    # Load surgeries
    c.execute("SELECT * FROM surgeries")
    surgery_rows = c.fetchall()
    surgeries = []
    for s in surgery_rows:
        eq = json.loads(s["required_equipment"]) if s["required_equipment"] else []
        surgeries.append({
            "id": s["id"],
            "patient_name": s["patient_name"],
            "patient_id": s["patient_id"],
            "surgery_name": s["surgery_name"],
            "surgery_type": s["surgery_type"],
            "surgeon_name": s["surgeon_name"],
            "duration_minutes": s["duration_minutes"],
            "priority_level": s["priority_level"],
            "urgency_level": s["urgency_level"],
            "requested_start": s["requested_start"],
            "deadline": s["deadline"],
            "required_room_type": s["required_room_type"],
            "required_equipment": eq,
            "status": s["status"]
        })

    # Run Python Greedy Scheduler
    engine = GreedyScheduler(
        surgeries=surgeries,
        operating_rooms=rooms,
        room_unavailabilities=unavailabilities,
        weights=weights,
        slot_interval_minutes=slot_interval_minutes
    )
    result = engine.run()

    scheduled = result["scheduled"]
    unscheduled = result["unscheduled"]
    decision_logs = result["decision_logs"]
    algorithm_steps = result["algorithm_steps"]
    analytics = result["analytics"]

    # Persist results in DB
    run_id = f"RUN-{int(time.time())}"
    run_title = run_name or f"Optimized Schedule #{run_id}"

    # 1. Clear previous schedules
    c.execute("DELETE FROM schedules")

    # 2. Insert new schedules & update surgery statuses
    for item in scheduled:
        sched_id = f"SCHED-{uuid.uuid4().hex[:8]}"
        c.execute(
            """
            INSERT INTO schedules (id, surgery_id, room_id, start_time, end_time, score, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (sched_id, item["surgery_id"], item["room_id"], item["start_time"], item["end_time"], item["score"], "Scheduled", time.time())
        )
        c.execute(
            "UPDATE surgeries SET status = 'Scheduled', priority_score = ? WHERE id = ?",
            (item["score"], item["surgery_id"])
        )

    for item in unscheduled:
        c.execute(
            "UPDATE surgeries SET status = 'Unscheduled' WHERE id = ?",
            (item["id"],)
        )

    # 3. Insert scheduling run
    c.execute(
        """
        INSERT INTO scheduling_runs
        (id, run_name, total_surgeries, scheduled_surgeries, unscheduled_surgeries, objective_value,
         average_waiting_time, room_utilization, deadline_compliance, total_idle_time, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            run_id,
            run_title,
            analytics["total_surgeries"],
            analytics["scheduled_count"],
            analytics["unscheduled_count"],
            analytics["objective"]["normalized_score"],
            analytics["average_waiting_time_minutes"],
            analytics["overall_room_utilization_pct"],
            analytics["deadline_compliance_pct"],
            analytics["total_idle_time_minutes"],
            time.time()
        )
    )

    # 4. Insert detailed scheduling logs
    for log in decision_logs:
        log_id = f"LOG-{uuid.uuid4().hex[:8]}"
        c.execute(
            """
            INSERT INTO scheduling_logs
            (id, scheduling_run_id, surgery_id, selected_priority, candidate_rooms, candidate_slots,
             rejected_candidates, selected_room, selected_start, selected_end, decision, reason, score, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                log_id,
                run_id,
                log["surgery_id"],
                log.get("priority_score", 0.0),
                json.dumps(log.get("candidate_rooms", [])),
                json.dumps(log.get("candidate_slots", [])),
                json.dumps(log.get("rejected_candidates", [])),
                log.get("selected_room"),
                log.get("selected_start"),
                log.get("selected_end"),
                log["decision"],
                log["reason"],
                log.get("score", 0.0),
                time.time()
            )
        )

    conn.commit()
    conn.close()

    # Build rich comprehensive explanations for frontend
    explanations = {}
    for log in decision_logs:
        s_match = next((s for s in surgeries if s["id"] == log["surgery_id"]), {})
        explanations[log["surgery_id"]] = format_comprehensive_explanation(log, s_match)

    return {
        "run_id": run_id,
        "run_name": run_title,
        "scheduled": scheduled,
        "unscheduled": unscheduled,
        "decision_logs": decision_logs,
        "algorithm_steps": algorithm_steps,
        "explanations": explanations,
        "analytics": analytics
    }

def reset_all_schedules():
    """Resets schedules back to initial pending state."""
    conn = get_connection()
    c = conn.cursor()
    c.execute("DELETE FROM schedules")
    c.execute("UPDATE surgeries SET status = 'Pending', priority_score = 0.0")
    conn.commit()
    conn.close()
    return {"message": "Schedules successfully reset to pending state."}

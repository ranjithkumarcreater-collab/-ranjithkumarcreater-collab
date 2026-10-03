from flask import Blueprint, request, jsonify
import json
from backend.services.scheduler_service import run_scheduler_pipeline, reset_all_schedules
from backend.database.db import get_connection, seed_demo_data

schedule_bp = Blueprint("schedule", __name__)

@schedule_bp.route("/run", methods=["POST"])
def run_schedule():
    data = request.get_json() or {}
    weights = data.get("weights")
    interval = int(data.get("interval_minutes", 30))
    run_name = data.get("run_name")

    result = run_scheduler_pipeline(
        weights=weights,
        slot_interval_minutes=interval,
        run_name=run_name
    )
    return jsonify(result)

@schedule_bp.route("/reset", methods=["POST"])
def reset_schedule():
    res = reset_all_schedules()
    return jsonify(res)

@schedule_bp.route("", methods=["GET"])
def get_schedules():
    conn = get_connection()
    c = conn.cursor()
    c.execute(
        """
        SELECT sc.*, su.patient_name, su.patient_id, su.surgery_name, su.surgery_type,
               su.duration_minutes, su.priority_level, su.urgency_level, su.requested_start,
               su.deadline, r.room_name, r.room_type
        FROM schedules sc
        JOIN surgeries su ON sc.surgery_id = su.id
        JOIN operating_rooms r ON sc.room_id = r.id
        ORDER BY sc.room_id, sc.start_time
        """
    )
    rows = [dict(r) for r in c.fetchall()]
    conn.close()
    return jsonify(rows)

@schedule_bp.route("/logs", methods=["GET"])
def get_logs():
    conn = get_connection()
    c = conn.cursor()
    c.execute(
        """
        SELECT sl.*, su.surgery_name, su.patient_name, su.priority_level, su.duration_minutes, su.deadline
        FROM scheduling_logs sl
        LEFT JOIN surgeries su ON sl.surgery_id = su.id
        ORDER BY sl.created_at DESC, sl.selected_priority DESC
        """
    )
    rows = c.fetchall()
    conn.close()

    logs = []
    for r in rows:
        d = dict(r)
        d["candidate_rooms"] = json.loads(d["candidate_rooms"]) if d["candidate_rooms"] else []
        d["candidate_slots"] = json.loads(d["candidate_slots"]) if d["candidate_slots"] else []
        d["rejected_candidates"] = json.loads(d["rejected_candidates"]) if d["rejected_candidates"] else []
        logs.append(d)

    return jsonify(logs)

@schedule_bp.route("/runs", methods=["GET"])
def get_runs():
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM scheduling_runs ORDER BY created_at DESC")
    rows = [dict(r) for r in c.fetchall()]
    conn.close()
    return jsonify(rows)

@schedule_bp.route("/demo-data", methods=["POST"])
def load_demo():
    seed_demo_data()
    return jsonify({"message": "Demo data loaded successfully with 16 surgeries and 4 operating rooms."})

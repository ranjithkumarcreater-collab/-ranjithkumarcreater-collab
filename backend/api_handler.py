"""
Python API Handler for Smart OR Scheduler
Handles all backend operations and queries through Python's standard library and sqlite3.
"""

import sys
import os
import json
import uuid
import time

# Ensure project root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database.db import get_connection, init_db, seed_demo_data
from backend.services.scheduler_service import run_scheduler_pipeline, reset_all_schedules
from backend.services.analytics_service import get_latest_analytics
from backend.models.user import verify_password, hash_password

def handle_request():
    init_db()
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No action provided"}))
        return

    action = sys.argv[1]

    # --- HEALTH ---
    if action == "health":
        print(json.dumps({
            "status": "healthy",
            "service": "Smart OR Scheduler Python Engine",
            "algorithms": ["Priority Queue (heapq)", "Job Sequencing (continuous duration)", "Greedy Optimization"],
            "version": "1.0.0"
        }))
        return

    # --- AUTH LOGIN ---
    if action == "login":
        payload = json.loads(sys.argv[2]) if len(sys.argv) > 2 else {}
        email = payload.get("email", "").strip().lower()
        password = payload.get("password", "")

        conn = get_connection()
        c = conn.cursor()
        c.execute("SELECT * FROM users WHERE LOWER(email) = ?", (email,))
        user = c.fetchone()
        conn.close()

        if not user or not verify_password(password, user["password_hash"]):
            print(json.dumps({"success": False, "message": "Invalid login details", "error": "Invalid login details"}))
            sys.exit(1)

        print(json.dumps({
            "success": True,
            "message": "Login successful",
            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "role": user["role"]
            },
            "token": f"token-{user['id']}-{user['role']}"
        }))
        return

    # --- DEMO DATA ---
    if action == "seed_demo":
        seed_demo_data()
        print(json.dumps({"message": "Demo data successfully loaded"}))
        return

    # --- SURGERIES ---
    if action == "get_surgeries":
        conn = get_connection()
        c = conn.cursor()
        c.execute("SELECT * FROM surgeries ORDER BY created_at DESC")
        rows = c.fetchall()
        conn.close()
        surgeries = []
        for r in rows:
            eq = json.loads(r["required_equipment"]) if r["required_equipment"] else []
            surgeries.append({
                "id": r["id"],
                "patient_name": r["patient_name"],
                "patient_id": r["patient_id"],
                "surgery_name": r["surgery_name"],
                "surgery_type": r["surgery_type"],
                "surgeon_name": r["surgeon_name"],
                "duration_minutes": r["duration_minutes"],
                "priority_level": r["priority_level"],
                "priority_score": r["priority_score"],
                "urgency_level": r["urgency_level"],
                "requested_start": r["requested_start"],
                "deadline": r["deadline"],
                "required_room_type": r["required_room_type"],
                "required_equipment": eq,
                "status": r["status"],
                "created_at": r["created_at"]
            })
        print(json.dumps(surgeries))
        return

    if action == "get_surgery":
        s_id = sys.argv[2]
        conn = get_connection()
        c = conn.cursor()
        c.execute("SELECT * FROM surgeries WHERE id = ?", (s_id,))
        r = c.fetchone()
        conn.close()
        if not r:
            print(json.dumps({"error": "Not found"}))
            sys.exit(1)
        eq = json.loads(r["required_equipment"]) if r["required_equipment"] else []
        print(json.dumps({
            "id": r["id"],
            "patient_name": r["patient_name"],
            "patient_id": r["patient_id"],
            "surgery_name": r["surgery_name"],
            "surgery_type": r["surgery_type"],
            "surgeon_name": r["surgeon_name"],
            "duration_minutes": r["duration_minutes"],
            "priority_level": r["priority_level"],
            "priority_score": r["priority_score"],
            "urgency_level": r["urgency_level"],
            "requested_start": r["requested_start"],
            "deadline": r["deadline"],
            "required_room_type": r["required_room_type"],
            "required_equipment": eq,
            "status": r["status"],
            "created_at": r["created_at"]
        }))
        return

    if action == "create_surgery":
        data = json.loads(sys.argv[2])
        duration = int(data.get("duration_minutes", 0))
        if duration <= 0:
            print(json.dumps({"error": "Duration must be greater than zero"}))
            sys.exit(1)

        s_id = data.get("id") or f"S{int(time.time()*1000)%10000}"
        patient_id = data.get("patient_id") or f"P-{uuid.uuid4().hex[:4].upper()}"
        eq = json.dumps(data.get("required_equipment", []))

        conn = get_connection()
        c = conn.cursor()
        c.execute(
            """
            INSERT INTO surgeries
            (id, patient_name, patient_id, surgery_name, surgery_type, surgeon_name, duration_minutes,
             priority_level, priority_score, urgency_level, requested_start, deadline, required_room_type,
             required_equipment, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                s_id,
                data["patient_name"],
                patient_id,
                data["surgery_name"],
                data.get("surgery_type", "General"),
                data.get("surgeon_name", "Unassigned"),
                duration,
                data["priority_level"],
                0.0,
                data["urgency_level"],
                data.get("requested_start", "08:00"),
                data["deadline"],
                data.get("required_room_type", "General"),
                eq,
                "Pending",
                time.time()
            )
        )
        conn.commit()
        conn.close()
        print(json.dumps({"message": "Surgery created", "id": s_id}))
        return

    if action == "update_surgery":
        s_id = sys.argv[2]
        data = json.loads(sys.argv[3])
        conn = get_connection()
        c = conn.cursor()
        eq = json.dumps(data.get("required_equipment", [])) if "required_equipment" in data else None
        c.execute(
            """
            UPDATE surgeries SET
                patient_name = COALESCE(?, patient_name),
                surgery_name = COALESCE(?, surgery_name),
                surgery_type = COALESCE(?, surgery_type),
                surgeon_name = COALESCE(?, surgeon_name),
                duration_minutes = COALESCE(?, duration_minutes),
                priority_level = COALESCE(?, priority_level),
                urgency_level = COALESCE(?, urgency_level),
                requested_start = COALESCE(?, requested_start),
                deadline = COALESCE(?, deadline),
                required_room_type = COALESCE(?, required_room_type),
                required_equipment = COALESCE(?, required_equipment),
                status = COALESCE(?, status)
            WHERE id = ?
            """,
            (
                data.get("patient_name"),
                data.get("surgery_name"),
                data.get("surgery_type"),
                data.get("surgeon_name"),
                int(data["duration_minutes"]) if "duration_minutes" in data else None,
                data.get("priority_level"),
                data.get("urgency_level"),
                data.get("requested_start"),
                data.get("deadline"),
                data.get("required_room_type"),
                eq,
                data.get("status"),
                s_id
            )
        )
        conn.commit()
        conn.close()
        print(json.dumps({"message": "Surgery updated", "id": s_id}))
        return

    if action == "delete_surgery":
        s_id = sys.argv[2]
        conn = get_connection()
        c = conn.cursor()
        c.execute("DELETE FROM schedules WHERE surgery_id = ?", (s_id,))
        c.execute("DELETE FROM surgeries WHERE id = ?", (s_id,))
        conn.commit()
        conn.close()
        print(json.dumps({"message": "Surgery deleted"}))
        return

    # --- ROOMS ---
    if action == "get_rooms":
        conn = get_connection()
        c = conn.cursor()
        c.execute("SELECT * FROM operating_rooms")
        room_rows = c.fetchall()
        c.execute("SELECT * FROM room_unavailability")
        unavail_rows = c.fetchall()
        conn.close()

        unavails_by_room = {}
        for u in unavail_rows:
            rid = u["room_id"]
            if rid not in unavails_by_room:
                unavails_by_room[rid] = []
            unavails_by_room[rid].append({
                "id": u["id"],
                "unavailable_start": u["unavailable_start"],
                "unavailable_end": u["unavailable_end"],
                "reason": u["reason"]
            })

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
                "status": r["status"],
                "unavailabilities": unavails_by_room.get(r["id"], [])
            })
        print(json.dumps(rooms))
        return

    if action == "create_room":
        data = json.loads(sys.argv[2])
        r_id = data.get("id") or f"OR-{data.get('room_name', 'Room')[:4]}"
        eq = json.dumps(data.get("equipment", []))
        conn = get_connection()
        c = conn.cursor()
        c.execute(
            """
            INSERT INTO operating_rooms (id, room_name, room_type, opening_time, closing_time, equipment, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                r_id,
                data.get("room_name", "Operating Room"),
                data.get("room_type", "General"),
                data.get("opening_time", "08:00"),
                data.get("closing_time", "17:00"),
                eq,
                data.get("status", "Active")
            )
        )
        conn.commit()
        conn.close()
        print(json.dumps({"message": "Room created", "id": r_id}))
        return

    if action == "update_room":
        r_id = sys.argv[2]
        data = json.loads(sys.argv[3])
        conn = get_connection()
        c = conn.cursor()
        eq = json.dumps(data.get("equipment", [])) if "equipment" in data else None
        c.execute(
            """
            UPDATE operating_rooms SET
                room_name = COALESCE(?, room_name),
                room_type = COALESCE(?, room_type),
                opening_time = COALESCE(?, opening_time),
                closing_time = COALESCE(?, closing_time),
                equipment = COALESCE(?, equipment),
                status = COALESCE(?, status)
            WHERE id = ?
            """,
            (
                data.get("room_name"),
                data.get("room_type"),
                data.get("opening_time"),
                data.get("closing_time"),
                eq,
                data.get("status"),
                r_id
            )
        )
        conn.commit()
        conn.close()
        print(json.dumps({"message": "Room updated", "id": r_id}))
        return

    if action == "delete_room":
        r_id = sys.argv[2]
        conn = get_connection()
        c = conn.cursor()
        c.execute("DELETE FROM room_unavailability WHERE room_id = ?", (r_id,))
        c.execute("DELETE FROM schedules WHERE room_id = ?", (r_id,))
        c.execute("DELETE FROM operating_rooms WHERE id = ?", (r_id,))
        conn.commit()
        conn.close()
        print(json.dumps({"message": "Room deleted"}))
        return

    if action == "add_unavailability":
        r_id = sys.argv[2]
        data = json.loads(sys.argv[3])
        u_id = f"UN-{uuid.uuid4().hex[:6]}"
        conn = get_connection()
        c = conn.cursor()
        c.execute(
            """
            INSERT INTO room_unavailability (id, room_id, unavailable_start, unavailable_end, reason)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                u_id,
                r_id,
                data.get("unavailable_start", "12:00"),
                data.get("unavailable_end", "13:00"),
                data.get("reason", "Maintenance")
            )
        )
        conn.commit()
        conn.close()
        print(json.dumps({"message": "Unavailability registered", "id": u_id}))
        return

    # --- SCHEDULING ---
    if action == "run_scheduler":
        payload = json.loads(sys.argv[2]) if len(sys.argv) > 2 else {}
        weights = payload.get("weights")
        interval = int(payload.get("interval_minutes", 30))
        run_name = payload.get("run_name")

        res = run_scheduler_pipeline(
            weights=weights,
            slot_interval_minutes=interval,
            run_name=run_name
        )
        print(json.dumps(res))
        return

    if action == "reset_scheduler":
        res = reset_all_schedules()
        print(json.dumps(res))
        return

    if action == "get_schedules":
        conn = get_connection()
        c = conn.cursor()
        c.execute(
            """
            SELECT sc.*, su.patient_name, su.patient_id, su.surgery_name, su.surgery_type,
                   su.surgeon_name, su.duration_minutes, su.priority_level, su.urgency_level,
                   su.requested_start, su.deadline, r.room_name, r.room_type
            FROM schedules sc
            JOIN surgeries su ON sc.surgery_id = su.id
            JOIN operating_rooms r ON sc.room_id = r.id
            ORDER BY sc.room_id, sc.start_time
            """
        )
        rows = [dict(r) for r in c.fetchall()]
        conn.close()
        print(json.dumps(rows))
        return

    if action == "get_logs":
        conn = get_connection()
        c = conn.cursor()
        c.execute(
            """
            SELECT sl.*, su.surgery_name, su.patient_name, su.priority_level, su.duration_minutes, su.deadline
            FROM scheduling_logs sl
            LEFT JOIN surgeries su ON sl.surgery_id = su.id
            ORDER BY sl.created_at DESC
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
        print(json.dumps(logs))
        return

    if action == "get_runs":
        conn = get_connection()
        c = conn.cursor()
        c.execute("SELECT * FROM scheduling_runs ORDER BY created_at DESC")
        rows = [dict(r) for r in c.fetchall()]
        conn.close()
        print(json.dumps(rows))
        return

    if action == "get_analytics":
        res = get_latest_analytics()
        print(json.dumps(res))
        return

    print(json.dumps({"error": f"Unknown action: {action}"}))

if __name__ == "__main__":
    handle_request()

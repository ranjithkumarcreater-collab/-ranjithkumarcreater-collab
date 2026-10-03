from flask import Blueprint, request, jsonify
import json
import uuid
import time
from backend.database.db import get_connection

surgery_bp = Blueprint("surgeries", __name__)

@surgery_bp.route("", methods=["GET"])
def get_surgeries():
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
    return jsonify(surgeries)

@surgery_bp.route("/<surgery_id>", methods=["GET"])
def get_surgery(surgery_id):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM surgeries WHERE id = ?", (surgery_id,))
    r = c.fetchone()
    conn.close()

    if not r:
        return jsonify({"error": "Surgery not found"}), 404

    eq = json.loads(r["required_equipment"]) if r["required_equipment"] else []
    return jsonify({
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

@surgery_bp.route("", methods=["POST"])
def create_surgery():
    data = request.get_json() or {}

    # Validation
    required_fields = ["patient_name", "surgery_name", "duration_minutes", "priority_level", "urgency_level", "deadline"]
    for f in required_fields:
        if f not in data or data[f] is None:
            return jsonify({"error": f"Field '{f}' is required"}), 400

    duration = int(data.get("duration_minutes", 0))
    if duration <= 0:
        return jsonify({"error": "Duration must be greater than zero"}), 400

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

    return jsonify({"message": "Surgery created successfully", "id": s_id}), 201

@surgery_bp.route("/<surgery_id>", methods=["PUT"])
def update_surgery(surgery_id):
    data = request.get_json() or {}
    conn = get_connection()
    c = conn.cursor()

    c.execute("SELECT * FROM surgeries WHERE id = ?", (surgery_id,))
    if not c.fetchone():
        conn.close()
        return jsonify({"error": "Surgery not found"}), 404

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
            surgery_id
        )
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "Surgery updated successfully"})

@surgery_bp.route("/<surgery_id>", methods=["DELETE"])
def delete_surgery(surgery_id):
    conn = get_connection()
    c = conn.cursor()
    c.execute("DELETE FROM schedules WHERE surgery_id = ?", (surgery_id,))
    c.execute("DELETE FROM surgeries WHERE id = ?", (surgery_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Surgery deleted successfully"})

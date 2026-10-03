from flask import Blueprint, request, jsonify
import json
from backend.database.db import get_connection

room_bp = Blueprint("rooms", __name__)

@room_bp.route("", methods=["GET"])
def get_rooms():
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

    return jsonify(rooms)

@room_bp.route("/<room_id>", methods=["GET"])
def get_room(room_id):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM operating_rooms WHERE id = ?", (room_id,))
    r = c.fetchone()
    if not r:
        conn.close()
        return jsonify({"error": "Room not found"}), 404

    c.execute("SELECT * FROM room_unavailability WHERE room_id = ?", (room_id,))
    unavails = [dict(u) for u in c.fetchall()]
    conn.close()

    eq = json.loads(r["equipment"]) if r["equipment"] else []
    return jsonify({
        "id": r["id"],
        "room_name": r["room_name"],
        "room_type": r["room_type"],
        "opening_time": r["opening_time"],
        "closing_time": r["closing_time"],
        "equipment": eq,
        "status": r["status"],
        "unavailabilities": unavails
    })

@room_bp.route("", methods=["POST"])
def create_room():
    data = request.get_json() or {}
    room_id = data.get("id") or f"OR-{data.get('room_name', 'Room')[:4]}"
    eq = json.dumps(data.get("equipment", []))

    conn = get_connection()
    c = conn.cursor()
    c.execute(
        """
        INSERT INTO operating_rooms (id, room_name, room_type, opening_time, closing_time, equipment, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            room_id,
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
    return jsonify({"message": "Room created successfully", "id": room_id}), 201

@room_bp.route("/<room_id>", methods=["PUT"])
def update_room(room_id):
    data = request.get_json() or {}
    conn = get_connection()
    c = conn.cursor()

    c.execute("SELECT * FROM operating_rooms WHERE id = ?", (room_id,))
    if not c.fetchone():
        conn.close()
        return jsonify({"error": "Room not found"}), 404

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
            room_id
        )
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Room updated successfully"})

@room_bp.route("/<room_id>", methods=["DELETE"])
def delete_room(room_id):
    conn = get_connection()
    c = conn.cursor()
    c.execute("DELETE FROM room_unavailability WHERE room_id = ?", (room_id,))
    c.execute("DELETE FROM schedules WHERE room_id = ?", (room_id,))
    c.execute("DELETE FROM operating_rooms WHERE id = ?", (room_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Room deleted successfully"})

@room_bp.route("/<room_id>/unavailability", methods=["POST"])
def add_unavailability(room_id):
    data = request.get_json() or {}
    import uuid
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
            room_id,
            data.get("unavailable_start", "12:00"),
            data.get("unavailable_end", "13:00"),
            data.get("reason", "Maintenance")
        )
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Unavailability registered", "id": u_id}), 201

from flask import Blueprint, request, jsonify
from backend.database.db import get_connection
from backend.models.user import verify_password

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE LOWER(email) = ?", (email,))
    user = c.fetchone()
    conn.close()

    if not user:
        return jsonify({"error": "Invalid email or password"}), 401

    if not verify_password(password, user["password_hash"]):
        return jsonify({"error": "Invalid email or password"}), 401

    return jsonify({
        "message": "Login successful",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        },
        "token": f"mock-jwt-token-{user['id']}-{user['role']}"
    })

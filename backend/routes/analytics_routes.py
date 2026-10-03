from flask import Blueprint, jsonify
from backend.services.analytics_service import get_latest_analytics

analytics_bp = Blueprint("analytics", __name__)

@analytics_bp.route("", methods=["GET"])
def get_analytics():
    data = get_latest_analytics()
    return jsonify(data)

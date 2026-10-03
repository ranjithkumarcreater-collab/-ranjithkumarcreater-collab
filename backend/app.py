"""
Smart OR Scheduler - Flask REST API Entry Point
Production-ready Flask application designed for Cloud deployment and local execution.
"""

from flask import Flask, jsonify
from flask_cors import CORS
import os
import sys
import logging

# Ensure project root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.config import Config
from backend.database.db import init_db
from backend.routes.auth_routes import auth_bp
from backend.routes.surgery_routes import surgery_bp
from backend.routes.room_routes import room_bp
from backend.routes.schedule_routes import schedule_bp
from backend.routes.analytics_routes import analytics_bp

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("SmartORScheduler")

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Enable CORS for frontend integration
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize Database
    init_db()

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(surgery_bp, url_prefix="/api/surgeries")
    app.register_blueprint(room_bp, url_prefix="/api/rooms")
    app.register_blueprint(schedule_bp, url_prefix="/api/schedule")
    app.register_blueprint(analytics_bp, url_prefix="/api/analytics")

    # Global health and demo aliases
    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({
            "status": "healthy",
            "service": "Smart OR Scheduler REST API",
            "algorithms": ["Priority Queue (heapq)", "Job Sequencing (contiguous duration)", "Greedy Optimization"],
            "version": "1.0.0"
        })

    @app.route("/api/demo-data", methods=["POST"])
    def demo_data():
        from backend.database.db import seed_demo_data
        seed_demo_data()
        return jsonify({"message": "Demo data loaded successfully."})

    @app.route("/api/scheduling-logs", methods=["GET"])
    def scheduling_logs():
        from backend.routes.schedule_routes import get_logs
        return get_logs()

    @app.route("/api/scheduling-runs", methods=["GET"])
    def scheduling_runs():
        from backend.routes.schedule_routes import get_runs
        return get_runs()

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Endpoint not found"}), 404

    @app.errorhandler(500)
    def internal_error(e):
        logger.error(f"Internal server error: {e}")
        return jsonify({"error": "Internal server error occurred"}), 500

    return app

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    logger.info(f"Starting Smart OR Scheduler Flask service on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=False)

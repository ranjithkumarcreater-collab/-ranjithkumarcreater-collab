import os

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "smart-or-scheduler-secret-key-2026")
    DATABASE_URL = os.environ.get(
        "DATABASE_URL",
        "sqlite:///smart_or_scheduler.db"
    )
    # Default scheduling weights
    DEFAULT_WEIGHTS = {
        "medical_priority": 0.40,
        "urgency": 0.25,
        "deadline_urgency": 0.25,
        "waiting_time": 0.10
    }
    # Objective function weights
    OBJECTIVE_WEIGHTS = {
        "priority_benefit_multiplier": 10.0,
        "waiting_time_penalty_per_hour": 2.0,
        "idle_time_penalty_per_hour": 1.5,
        "deadline_violation_penalty": 25.0
    }
    # Default scheduling interval in minutes (15 or 30)
    SCHEDULING_INTERVAL_MINUTES = 30

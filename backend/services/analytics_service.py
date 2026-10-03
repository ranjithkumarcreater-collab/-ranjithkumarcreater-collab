"""
Analytics Service for Smart OR Scheduler
Retrieves historical performance, room metrics, compliance, and objective scores.
"""

from typing import Dict, Any, List
from backend.database.db import get_connection

def get_latest_analytics() -> Dict[str, Any]:
    conn = get_connection()
    c = conn.cursor()

    # Total and status counts
    c.execute("SELECT COUNT(*) as total FROM surgeries")
    total_surgeries = c.fetchone()["total"]

    c.execute("SELECT COUNT(*) as scheduled FROM surgeries WHERE status = 'Scheduled'")
    scheduled = c.fetchone()["scheduled"]

    c.execute("SELECT COUNT(*) as unscheduled FROM surgeries WHERE status = 'Unscheduled'")
    unscheduled = c.fetchone()["unscheduled"]

    c.execute("SELECT COUNT(*) as pending FROM surgeries WHERE status = 'Pending'")
    pending = c.fetchone()["pending"]

    # Priority counts
    c.execute("SELECT priority_level, COUNT(*) as cnt FROM surgeries GROUP BY priority_level")
    priority_distribution = {row["priority_level"]: row["cnt"] for row in c.fetchall()}

    # Recent runs
    c.execute("SELECT * FROM scheduling_runs ORDER BY created_at DESC LIMIT 5")
    runs = [dict(row) for row in c.fetchall()]

    conn.close()

    return {
        "total_surgeries": total_surgeries,
        "scheduled": scheduled,
        "unscheduled": unscheduled,
        "pending": pending,
        "priority_distribution": priority_distribution,
        "recent_runs": runs
    }

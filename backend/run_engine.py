"""
CLI / Process Bridge to run the Python Scheduling Engine directly from Node or Shell
Takes JSON parameters from stdin or args, runs the Python algorithm suite, and outputs pure JSON.
"""

import sys
import os
import json

# Ensure project root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.services.scheduler_service import run_scheduler_pipeline, reset_all_schedules
from backend.database.db import init_db, seed_demo_data

def main():
    init_db()
    command = sys.argv[1] if len(sys.argv) > 1 else "run"

    if command == "demo":
        seed_demo_data()
        print(json.dumps({"status": "success", "message": "Demo data initialized"}))
        return

    if command == "reset":
        res = reset_all_schedules()
        print(json.dumps(res))
        return

    if command == "run":
        payload = {}
        if "--stdin" in sys.argv:
            try:
                input_str = sys.stdin.read().strip()
                if input_str:
                    payload = json.loads(input_str)
            except Exception:
                pass
        elif len(sys.argv) > 2 and sys.argv[2].startswith("{"):
            try:
                payload = json.loads(sys.argv[2])
            except Exception:
                pass

        weights = payload.get("weights")
        interval = int(payload.get("interval_minutes", 30))
        run_name = payload.get("run_name")

        result = run_scheduler_pipeline(
            weights=weights,
            slot_interval_minutes=interval,
            run_name=run_name
        )
        print(json.dumps(result))
        return

if __name__ == "__main__":
    main()

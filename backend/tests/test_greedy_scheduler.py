import unittest
from backend.algorithms.greedy_scheduler import GreedyScheduler

class TestGreedyScheduler(unittest.TestCase):

    def setUp(self):
        self.rooms = [
            {
                "id": "OR1",
                "room_name": "OR-1 General",
                "room_type": "General",
                "opening_time": "08:00",
                "closing_time": "17:00",
                "equipment": ["Standard Monitor", "Electrocautery"],
                "status": "Active"
            },
            {
                "id": "OR2",
                "room_name": "OR-2 Cardiac",
                "room_type": "Cardiac",
                "opening_time": "08:00",
                "closing_time": "17:00",
                "equipment": ["Heart-Lung Machine", "C-Arm", "Defibrillator"],
                "status": "Active"
            }
        ]

        self.surgeries = [
            {
                "id": "S101",
                "patient_name": "John Doe",
                "surgery_name": "Coronary Bypass",
                "surgery_type": "Cardiac",
                "duration_minutes": 180,
                "priority_level": "Emergency",
                "urgency_level": "Immediate",
                "requested_start": "08:00",
                "deadline": "14:00",
                "required_room_type": "Cardiac",
                "required_equipment": ["Heart-Lung Machine"]
            },
            {
                "id": "S102",
                "patient_name": "Jane Smith",
                "surgery_name": "Appendectomy",
                "surgery_type": "General",
                "duration_minutes": 60,
                "priority_level": "High",
                "urgency_level": "Urgent",
                "requested_start": "08:00",
                "deadline": "12:00",
                "required_room_type": "General",
                "required_equipment": []
            },
            {
                "id": "S103",
                "patient_name": "Unfeasible Patient",
                "surgery_name": "Late Impossible Surgery",
                "surgery_type": "Cardiac",
                "duration_minutes": 300,
                "priority_level": "Low",
                "urgency_level": "Normal",
                "requested_start": "15:00",
                "deadline": "15:00", # cannot fit 300 minutes before 15:00 (earliest start is 11:00, ends at 16:00 > 15:00)
                "required_room_type": "Cardiac",
                "required_equipment": ["Heart-Lung Machine"]
            }
        ]

        self.unavails = [
            {
                "room_id": "OR1",
                "unavailable_start": "12:00",
                "unavailable_end": "13:00",
                "reason": "Sterilization Routine"
            }
        ]

    def test_scheduling_execution(self):
        scheduler = GreedyScheduler(
            surgeries=self.surgeries,
            operating_rooms=self.rooms,
            room_unavailabilities=self.unavails
        )
        result = scheduler.run()

        scheduled = result["scheduled"]
        unscheduled = result["unscheduled"]
        analytics = result["analytics"]

        # Emergency cardiac procedure must be scheduled in OR-2
        s101_match = [s for s in scheduled if s["surgery_id"] == "S101"]
        self.assertEqual(len(s101_match), 1)
        self.assertEqual(s101_match[0]["room_name"], "OR-2 Cardiac")
        self.assertEqual(s101_match[0]["start_time"], "08:00")
        self.assertEqual(s101_match[0]["end_time"], "11:00")

        # Appendectomy must be scheduled in OR-1
        s102_match = [s for s in scheduled if s["surgery_id"] == "S102"]
        self.assertEqual(len(s102_match), 1)
        self.assertEqual(s102_match[0]["room_name"], "OR-1 General")
        self.assertEqual(s102_match[0]["start_time"], "08:00")

        # Impossible surgery should be in unscheduled list
        s103_match = [s for s in unscheduled if s["id"] == "S103"]
        self.assertEqual(len(s103_match), 1)
        self.assertIn("deadline", s103_match[0]["failure_reason"].lower())

        # Verify analytics and objective calculation
        self.assertGreaterEqual(analytics["success_rate_pct"], 60.0)
        self.assertIn("objective", analytics)
        self.assertIn("normalized_score", analytics["objective"])

if __name__ == "__main__":
    unittest.main()

import unittest
from backend.algorithms.job_sequencing import SurgeryJob, find_feasible_candidate_slots, get_free_intervals_for_room

class TestJobSequencing(unittest.TestCase):

    def test_duration_in_slots(self):
        job90 = SurgeryJob({"duration_minutes": 90})
        self.assertEqual(job90.duration_in_slots(30), 3)

        job45 = SurgeryJob({"duration_minutes": 45})
        self.assertEqual(job45.duration_in_slots(30), 2)

    def test_find_feasible_candidate_slots(self):
        surgery = {
            "id": "S101",
            "duration_minutes": 120,
            "deadline": "14:00",
            "required_room_type": "General",
            "required_equipment": []
        }
        room = {
            "id": "OR1",
            "room_name": "OR-1",
            "room_type": "General",
            "opening_time": "08:00",
            "closing_time": "17:00",
            "equipment": []
        }
        existing_bookings = [
            {"surgery_id": "S99", "start_time": "08:00", "end_time": "10:00"}
        ]
        unavails = []

        slots = find_feasible_candidate_slots(
            surgery=surgery,
            room=room,
            room_bookings=existing_bookings,
            room_unavailabilities=unavails,
            slot_interval_minutes=30,
            enforce_deadline=True
        )

        feasible_slots = [s for s in slots if s["feasible"]]
        self.assertGreater(len(feasible_slots), 0)

        # The first feasible slot must start at or after 10:00
        first_feasible = feasible_slots[0]
        self.assertEqual(first_feasible["start_time"], "10:00")
        self.assertEqual(first_feasible["end_time"], "12:00")

    def test_free_intervals(self):
        room = {
            "opening_time": "08:00",
            "closing_time": "17:00"
        }
        bookings = [
            {"start_time": "09:00", "end_time": "11:00"}
        ]
        unavails = [
            {"unavailable_start": "13:00", "unavailable_end": "14:00"}
        ]

        free = get_free_intervals_for_room(room, bookings, unavails)
        # 08:00-09:00 (480-540), 11:00-13:00 (660-780), 14:00-17:00 (840-1020)
        self.assertEqual(len(free), 3)
        self.assertEqual(free[0], (480, 540))
        self.assertEqual(free[1], (660, 780))
        self.assertEqual(free[2], (840, 1020))

if __name__ == "__main__":
    unittest.main()

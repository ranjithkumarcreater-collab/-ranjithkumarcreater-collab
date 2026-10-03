import unittest
from backend.algorithms.constraint_checker import (
    check_room_type_match,
    check_equipment_availability,
    check_working_hours,
    check_room_unavailability_overlap,
    check_booking_overlap,
    check_deadline_compliance
)

class TestConstraints(unittest.TestCase):

    def test_room_type_match(self):
        surgery = {"required_room_type": "Orthopedic"}
        room_ortho = {"room_type": "Orthopedic"}
        room_cardiac = {"room_type": "Cardiac"}

        ok, _ = check_room_type_match(surgery, room_ortho)
        self.assertTrue(ok)

        bad, _ = check_room_type_match(surgery, room_cardiac)
        self.assertFalse(bad)

    def test_equipment_availability(self):
        surgery = {"required_equipment": ["C-Arm", "Orthopedic Table"]}
        room_complete = {"equipment": ["c-arm", "orthopedic table", "defibrillator"]}
        room_missing = {"equipment": ["laparoscope", "general monitor"]}

        ok, _ = check_equipment_availability(surgery, room_complete)
        self.assertTrue(ok)

        bad, msg = check_equipment_availability(surgery, room_missing)
        self.assertFalse(bad)
        self.assertIn("missing", msg.lower())

    def test_working_hours(self):
        room = {"opening_time": "08:00", "closing_time": "17:00"}
        # Valid: 09:00 to 11:00 (540m to 660m)
        ok, _ = check_working_hours(540, 660, room)
        self.assertTrue(ok)

        # Invalid: starts before 08:00 (07:30 = 450m)
        bad_start, _ = check_working_hours(450, 600, room)
        self.assertFalse(bad_start)

        # Invalid: ends after 17:00 (17:30 = 1050m)
        bad_end, _ = check_working_hours(960, 1050, room)
        self.assertFalse(bad_end)

    def test_temporary_room_closure(self):
        unavails = [{"unavailable_start": "12:00", "unavailable_end": "13:00", "reason": "Maintenance"}]
        # 12:00 - 13:00 is 720m to 780m

        # Slot 11:30 to 12:30 (690m to 750m) overlaps with maintenance
        bad, msg = check_room_unavailability_overlap(690, 750, unavails)
        self.assertFalse(bad)
        self.assertIn("closure", msg.lower())

        # Slot 10:00 to 11:30 (600m to 690m) is clean
        ok, _ = check_room_unavailability_overlap(600, 690, unavails)
        self.assertTrue(ok)

    def test_booking_overlap(self):
        bookings = [{"surgery_id": "S1", "start_time": "08:00", "end_time": "10:00"}]
        # Slot 09:30 to 11:00 overlaps
        bad, _ = check_booking_overlap(570, 660, bookings)
        self.assertFalse(bad)

        # Slot 10:00 to 12:00 does not overlap
        ok, _ = check_booking_overlap(600, 720, bookings)
        self.assertTrue(ok)

    def test_deadline_compliance(self):
        surgery = {"deadline": "12:00"} # 720 mins
        # Ends at 11:30 (690 mins) -> OK
        ok, _ = check_deadline_compliance(690, surgery, strict=True)
        self.assertTrue(ok)

        # Ends at 12:30 (750 mins) -> Violates
        bad, _ = check_deadline_compliance(750, surgery, strict=True)
        self.assertFalse(bad)

if __name__ == "__main__":
    unittest.main()

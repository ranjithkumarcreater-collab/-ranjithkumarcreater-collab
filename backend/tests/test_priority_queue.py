import unittest
from backend.algorithms.priority_queue import SurgeryPriorityQueue, build_priority_queue
from backend.algorithms.scoring import calculate_priority_score

class TestPriorityQueue(unittest.TestCase):

    def test_priority_score_calculation(self):
        surgery = {
            "id": "S101",
            "surgery_name": "Emergency Cardiac",
            "priority_level": "Emergency",
            "urgency_level": "Immediate",
            "requested_start": "08:00",
            "deadline": "11:00"
        }
        res = calculate_priority_score(surgery)
        self.assertIn("final_score", res)
        self.assertGreater(res["final_score"], 10.0)
        self.assertEqual(res["components"]["raw_medical_priority"], 5)
        self.assertEqual(res["components"]["raw_urgency"], 5)

    def test_priority_queue_order(self):
        s_emergency = {
            "id": "S_EMERG",
            "priority_level": "Emergency",
            "urgency_level": "Immediate",
            "requested_start": "08:00",
            "deadline": "10:00"
        }
        s_low = {
            "id": "S_LOW",
            "priority_level": "Low",
            "urgency_level": "Normal",
            "requested_start": "14:00",
            "deadline": "18:00"
        }
        s_high = {
            "id": "S_HIGH",
            "priority_level": "High",
            "urgency_level": "Urgent",
            "requested_start": "09:00",
            "deadline": "14:00"
        }

        pq = build_priority_queue([s_low, s_emergency, s_high])
        self.assertEqual(len(pq), 3)

        first = pq.pop()
        self.assertEqual(first["id"], "S_EMERG")

        second = pq.pop()
        self.assertEqual(second["id"], "S_HIGH")

        third = pq.pop()
        self.assertEqual(third["id"], "S_LOW")
        self.assertTrue(pq.is_empty())

if __name__ == "__main__":
    unittest.main()

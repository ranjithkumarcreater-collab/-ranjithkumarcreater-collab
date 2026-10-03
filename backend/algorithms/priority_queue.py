"""
Priority Queue Algorithm for Smart OR Scheduler
Implements a max-priority queue using Python's standard `heapq` module.
Every pending surgery is inserted into the priority queue and popped in order
of calculated priority score.
"""

import heapq
from typing import List, Dict, Any, Optional
from backend.algorithms.scoring import calculate_priority_score

class SurgeryPriorityQueue:
    """
    Max-heap Priority Queue wrapper around python's heapq.
    Stores entries as: (-priority_score, insertion_order, surgery_dict, score_details)
    """

    def __init__(self, weights: Optional[Dict[str, float]] = None):
        self._heap: List[Any] = []
        self._counter: int = 0
        self.weights = weights or {
            "medical_priority": 0.40,
            "urgency": 0.25,
            "deadline_urgency": 0.25,
            "waiting_time": 0.10
        }
        self.queue_history: List[Dict[str, Any]] = []

    def push(self, surgery: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculates priority score and inserts surgery into the priority queue.
        Returns the calculated score details.
        """
        score_info = calculate_priority_score(surgery, self.weights)
        score = score_info["final_score"]

        # Store with negative score for max-heap behavior
        self._counter += 1
        entry = (-score, self._counter, surgery, score_info)
        heapq.heappush(self._heap, entry)

        record = {
            "order": self._counter,
            "surgery_id": surgery.get("id") or surgery.get("patient_id"),
            "surgery_name": surgery.get("surgery_name"),
            "patient_name": surgery.get("patient_name"),
            "priority_level": surgery.get("priority_level"),
            "urgency_level": surgery.get("urgency_level"),
            "deadline": surgery.get("deadline"),
            "score": score,
            "raw_sum": score_info["raw_sum"],
            "components": score_info["components"],
            "explanation": score_info["explanation"]
        }
        self.queue_history.append(record)
        return score_info

    def pop(self) -> Optional[Dict[str, Any]]:
        """
        Pops and returns the highest-priority surgery from the queue.
        Returns None if queue is empty.
        """
        if not self._heap:
            return None
        neg_score, order, surgery, score_info = heapq.heappop(self._heap)
        result = dict(surgery)
        result["calculated_priority_score"] = -neg_score
        result["priority_score_details"] = score_info
        return result

    def peek(self) -> Optional[Dict[str, Any]]:
        """Views the highest-priority surgery without removing it."""
        if not self._heap:
            return None
        neg_score, order, surgery, score_info = self._heap[0]
        result = dict(surgery)
        result["calculated_priority_score"] = -neg_score
        result["priority_score_details"] = score_info
        return result

    def is_empty(self) -> bool:
        return len(self._heap) == 0

    def __len__(self) -> int:
        return len(self._heap)

    def get_ranked_order(self) -> List[Dict[str, Any]]:
        """
        Returns all items currently in the queue sorted in descending order of priority,
        with rank and full score breakdown. Does not mutate the heap.
        """
        sorted_entries = sorted(self._heap, key=lambda x: (x[0], x[1]))
        ranked = []
        for idx, (neg_score, order, surgery, score_info) in enumerate(sorted_entries, 1):
            ranked.append({
                "rank": idx,
                "surgery_id": surgery.get("id") or surgery.get("patient_id"),
                "patient_name": surgery.get("patient_name"),
                "surgery_name": surgery.get("surgery_name"),
                "priority_level": surgery.get("priority_level"),
                "urgency_level": surgery.get("urgency_level"),
                "duration_minutes": surgery.get("duration_minutes"),
                "deadline": surgery.get("deadline"),
                "priority_score": -neg_score,
                "raw_sum": score_info["raw_sum"],
                "components": score_info["components"],
                "explanation": score_info["explanation"]
            })
        return ranked


def build_priority_queue(surgeries: List[Dict[str, Any]], weights: Optional[Dict[str, float]] = None) -> SurgeryPriorityQueue:
    """
    Utility function to build and populate a priority queue with a list of surgeries.
    """
    pq = SurgeryPriorityQueue(weights)
    for s in surgeries:
        pq.push(s)
    return pq

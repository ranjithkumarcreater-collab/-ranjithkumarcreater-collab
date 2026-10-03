"""
Greedy Scheduler Algorithm for Smart OR Scheduler
Implements the core Greedy assignment logic:
"Choose the highest-priority pending surgery and assign it to the earliest feasible
compatible time slot that minimizes idle time while satisfying all hard constraints."
"""

from typing import List, Dict, Any, Tuple, Optional
from backend.algorithms.priority_queue import SurgeryPriorityQueue
from backend.algorithms.job_sequencing import find_feasible_candidate_slots
from backend.algorithms.constraint_checker import (
    check_room_type_match,
    check_equipment_availability
)
from backend.algorithms.scoring import (
    calculate_candidate_score,
    calculate_objective_value,
    time_str_to_minutes,
    minutes_to_time_str
)

class GreedyScheduler:
    """
    Greedy Operating Room Scheduling Engine.
    Executes the step-by-step pipeline and logs rich decisions for full transparency.
    """

    def __init__(
        self,
        surgeries: List[Dict[str, Any]],
        operating_rooms: List[Dict[str, Any]],
        room_unavailabilities: Optional[List[Dict[str, Any]]] = None,
        weights: Optional[Dict[str, float]] = None,
        slot_interval_minutes: int = 30
    ):
        self.raw_surgeries = [dict(s) for s in surgeries]
        self.operating_rooms = [dict(r) for r in operating_rooms]
        self.room_unavailabilities = [dict(u) for u in (room_unavailabilities or [])]
        self.weights = weights or {
            "medical_priority": 0.40,
            "urgency": 0.25,
            "deadline_urgency": 0.25,
            "waiting_time": 0.10
        }
        self.slot_interval_minutes = slot_interval_minutes

        # Working state
        self.schedules_by_room: Dict[Any, List[Dict[str, Any]]] = {
            r.get("id"): [] for r in self.operating_rooms
        }
        self.all_scheduled: List[Dict[str, Any]] = []
        self.unscheduled: List[Dict[str, Any]] = []
        self.decision_logs: List[Dict[str, Any]] = []
        self.algorithm_steps: List[Dict[str, Any]] = []

    def get_compatible_rooms(self, surgery: Dict[str, Any]) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Filters rooms into compatible and rejected rooms with explicit reasons.
        """
        compatible = []
        rejected = []

        for room in self.operating_rooms:
            # Check room status
            if room.get("status", "Active").lower() == "inactive":
                rejected.append({
                    "room_id": room.get("id"),
                    "room_name": room.get("room_name"),
                    "reason": "Room is currently marked Inactive/Decommissioned"
                })
                continue

            # Check room type match
            match_ok, match_msg = check_room_type_match(surgery, room)
            if not match_ok:
                rejected.append({
                    "room_id": room.get("id"),
                    "room_name": room.get("room_name"),
                    "reason": match_msg
                })
                continue

            # Check equipment availability
            equip_ok, equip_msg = check_equipment_availability(surgery, room)
            if not equip_ok:
                rejected.append({
                    "room_id": room.get("id"),
                    "room_name": room.get("room_name"),
                    "reason": equip_msg
                })
                continue

            compatible.append(room)

        return compatible, rejected

    def find_suggested_next_slot(self, surgery: Dict[str, Any]) -> Optional[str]:
        """
        For unscheduled surgeries, searches relaxed windows (ignoring deadline or looking later)
        to suggest when the surgery could fit.
        """
        duration = int(surgery.get("duration_minutes", 60))
        for room in self.operating_rooms:
            match_ok, _ = check_room_type_match(surgery, room)
            equip_ok, _ = check_equipment_availability(surgery, room)
            if not (match_ok and equip_ok):
                continue

            unavails = [u for u in self.room_unavailabilities if u.get("room_id") == room.get("id")]
            bookings = self.schedules_by_room.get(room.get("id"), [])

            # Relax deadline constraint
            relaxed_slots = find_feasible_candidate_slots(
                surgery=surgery,
                room=room,
                room_bookings=bookings,
                room_unavailabilities=unavails,
                all_bookings=self.all_scheduled,
                slot_interval_minutes=self.slot_interval_minutes,
                enforce_deadline=False
            )
            for s in relaxed_slots:
                # If slot was rejected only due to deadline or after-hours
                return f"{room.get('room_name')} ({s.get('start_time')} - {s.get('end_time')})"

        return "Next operating shift (all room working hours fully booked)"

    def run(self) -> Dict[str, Any]:
        """
        Executes the full scheduling pipeline:
        1. Initialize Priority Queue
        2. Push all pending surgeries
        3. Loop: Pop highest-priority surgery
        4. Find compatible rooms
        5. Generate feasible candidate slots via Job Sequencing
        6. Score all feasible candidate slots
        7. Greedily pick the highest-scoring candidate (earliest minimal-idle slot)
        8. Log detailed decision explanation
        9. Calculate overall objective function & analytics
        """
        # Step 1 & 2: Build priority queue
        pq = SurgeryPriorityQueue(self.weights)
        for s in self.raw_surgeries:
            pq.push(s)

        ranked_order = pq.get_ranked_order()
        self.algorithm_steps.append({
            "step_number": 1,
            "title": "Priority Queue Built",
            "description": f"Initialized priority queue with {len(self.raw_surgeries)} pending surgeries sorted by composite score.",
            "data": ranked_order
        })

        order_idx = 1
        while not pq.is_empty():
            surgery = pq.pop()
            s_id = surgery.get("id") or surgery.get("patient_id")
            s_name = surgery.get("surgery_name")
            p_score = surgery.get("calculated_priority_score", 0.0)

            # Step 3: Compatible rooms
            compatible_rooms, room_rejections = self.get_compatible_rooms(surgery)

            step_record = {
                "step_number": len(self.algorithm_steps) + 1,
                "surgery_id": s_id,
                "surgery_name": s_name,
                "patient_name": surgery.get("patient_name"),
                "priority_score": p_score,
                "priority_level": surgery.get("priority_level"),
                "duration_minutes": surgery.get("duration_minutes"),
                "deadline": surgery.get("deadline"),
                "compatible_rooms": [r.get("room_name") for r in compatible_rooms],
                "rejected_rooms": room_rejections,
                "candidate_slots": [],
                "selected_candidate": None,
                "decision": "",
                "reason": ""
            }

            if not compatible_rooms:
                # Cannot be scheduled due to room incompatibility
                reasons_str = "; ".join([f"{r['room_name']}: {r['reason']}" for r in room_rejections])
                fail_reason = f"No compatible operating rooms found. ({reasons_str})"
                suggested_slot = self.find_suggested_next_slot(surgery)

                unscheduled_entry = {
                    **surgery,
                    "status": "UNSCHEDULED",
                    "failure_reason": fail_reason,
                    "suggested_slot": suggested_slot,
                    "rejected_rooms": room_rejections
                }
                self.unscheduled.append(unscheduled_entry)

                step_record["decision"] = "UNSCHEDULED"
                step_record["reason"] = fail_reason
                step_record["suggested_slot"] = suggested_slot
                self.algorithm_steps.append(step_record)

                self.decision_logs.append({
                    "surgery_id": s_id,
                    "surgery_name": s_name,
                    "patient_name": surgery.get("patient_name"),
                    "priority_score": p_score,
                    "candidate_rooms": [r.get("room_name") for r in compatible_rooms],
                    "rejected_candidates": room_rejections,
                    "selected_room": None,
                    "selected_start": None,
                    "selected_end": None,
                    "decision": "UNSCHEDULED",
                    "reason": fail_reason,
                    "score": 0.0
                })
                continue

            # Step 4: Search feasible slots across all compatible rooms
            all_candidate_slots = []
            rejected_slots = []

            for room in compatible_rooms:
                r_id = room.get("id")
                r_bookings = self.schedules_by_room.get(r_id, [])
                r_unavails = [u for u in self.room_unavailabilities if u.get("room_id") == r_id]

                slots = find_feasible_candidate_slots(
                    surgery=surgery,
                    room=room,
                    room_bookings=r_bookings,
                    room_unavailabilities=r_unavails,
                    all_bookings=self.all_scheduled,
                    slot_interval_minutes=self.slot_interval_minutes,
                    enforce_deadline=True
                )

                for slot in slots:
                    if slot["feasible"]:
                        # Calculate greedy candidate score
                        score_data = calculate_candidate_score(
                            surgery=surgery,
                            room=room,
                            start_minutes=slot["start_minutes"],
                            end_minutes=slot["end_minutes"],
                            previous_end_in_room=slot["previous_end_minutes"]
                        )
                        slot["candidate_score"] = score_data["total_score"]
                        slot["score_data"] = score_data
                        all_candidate_slots.append(slot)
                    else:
                        rejected_slots.append({
                            "room_name": room.get("room_name"),
                            "slot": f"{slot['start_time']} - {slot['end_time']}",
                            "reasons": slot["reasons"]
                        })

            step_record["candidate_slots"] = [
                {
                    "room_name": c["room_name"],
                    "start_time": c["start_time"],
                    "end_time": c["end_time"],
                    "score": c["candidate_score"],
                    "breakdown": c["score_data"]["breakdown_str"],
                    "idle_minutes": c["score_data"]["idle_minutes"],
                    "wait_minutes": c["score_data"]["wait_minutes"]
                }
                for c in all_candidate_slots
            ]
            step_record["rejected_slots"] = rejected_slots[:8] # sample of rejected time intervals

            if not all_candidate_slots:
                # No continuous slot before deadline or within working hours
                duration_m = surgery.get("duration_minutes")
                deadline_t = surgery.get("deadline")
                fail_reason = (
                    f"No compatible operating room has a continuous {duration_m}-minute feasible slot "
                    f"before deadline ({deadline_t}). Room schedules are fully occupied or constrained."
                )
                suggested_slot = self.find_suggested_next_slot(surgery)

                unscheduled_entry = {
                    **surgery,
                    "status": "UNSCHEDULED",
                    "failure_reason": fail_reason,
                    "suggested_slot": suggested_slot,
                    "rejected_slots": rejected_slots
                }
                self.unscheduled.append(unscheduled_entry)

                step_record["decision"] = "UNSCHEDULED"
                step_record["reason"] = fail_reason
                step_record["suggested_slot"] = suggested_slot
                self.algorithm_steps.append(step_record)

                self.decision_logs.append({
                    "surgery_id": s_id,
                    "surgery_name": s_name,
                    "patient_name": surgery.get("patient_name"),
                    "priority_score": p_score,
                    "candidate_rooms": [r.get("room_name") for r in compatible_rooms],
                    "rejected_candidates": [{"room": r["room_name"], "reason": "; ".join(r["reasons"])} for r in rejected_slots[:5]],
                    "selected_room": None,
                    "selected_start": None,
                    "selected_end": None,
                    "decision": "UNSCHEDULED",
                    "reason": fail_reason,
                    "score": 0.0
                })
                continue

            # Step 5: Greedy Selection
            # Sort candidate slots by highest candidate score, then earlier start time, then least idle time
            all_candidate_slots.sort(
                key=lambda c: (
                    -c["candidate_score"],
                    c["start_minutes"],
                    c["score_data"]["idle_minutes"]
                )
            )

            best_slot = all_candidate_slots[0]
            assigned_room_id = best_slot["room_id"]
            assigned_room_name = best_slot["room_name"]
            start_t = best_slot["start_time"]
            end_t = best_slot["end_time"]
            candidate_score = best_slot["candidate_score"]

            # Format explainable narrative
            alt_rooms = [r.get("room_name") for r in compatible_rooms if r.get("id") != assigned_room_id]
            rejection_summary = ""
            if room_rejections:
                rejection_summary = f" {len(room_rejections)} room(s) rejected ({', '.join(r['room_name'] for r in room_rejections)} due to equipment or type requirements)."
            if alt_rooms:
                alt_summary = f" Alternative compatible room(s) evaluated: {', '.join(alt_rooms)}."
            else:
                alt_summary = ""

            explanation_reason = (
                f"Selected {s_id} ({s_name}) because it had composite priority score of {p_score}. "
                f"Assigned to {assigned_room_name} at {start_t} - {end_t} with optimal score of {candidate_score}. "
                f"Satisfies {surgery.get('duration_minutes')}m continuous duration, satisfies deadline ({surgery.get('deadline')}), "
                f"and minimizes room idle time ({best_slot['score_data']['idle_minutes']}m idle gap)."
                f"{rejection_summary}{alt_summary}"
            )

            # Record schedule booking
            booking = {
                "surgery_id": s_id,
                "patient_name": surgery.get("patient_name"),
                "patient_id": surgery.get("patient_id"),
                "surgery_name": s_name,
                "surgery_type": surgery.get("surgery_type"),
                "surgeon_name": surgery.get("surgeon_name"),
                "room_id": assigned_room_id,
                "room_name": assigned_room_name,
                "start_time": start_t,
                "end_time": end_t,
                "duration_minutes": surgery.get("duration_minutes"),
                "priority_level": surgery.get("priority_level"),
                "urgency_level": surgery.get("urgency_level"),
                "requested_start": surgery.get("requested_start"),
                "deadline": surgery.get("deadline"),
                "score": candidate_score,
                "status": "Scheduled",
                "explanation": explanation_reason,
                "breakdown": best_slot["score_data"]
            }

            self.schedules_by_room[assigned_room_id].append(booking)
            self.all_scheduled.append(booking)

            step_record["selected_candidate"] = {
                "room_name": assigned_room_name,
                "start_time": start_t,
                "end_time": end_t,
                "score": candidate_score
            }
            step_record["decision"] = "SCHEDULED"
            step_record["reason"] = explanation_reason
            self.algorithm_steps.append(step_record)

            self.decision_logs.append({
                "surgery_id": s_id,
                "surgery_name": s_name,
                "patient_name": surgery.get("patient_name"),
                "priority_score": p_score,
                "candidate_rooms": [r.get("room_name") for r in compatible_rooms],
                "rejected_candidates": [{"room": r["room_name"], "reason": r["reason"]} for r in room_rejections] +
                                      [{"slot": f"{r['room_name']} {r['slot']}", "reason": "; ".join(r["reasons"])} for r in rejected_slots[:3]],
                "selected_room": assigned_room_name,
                "selected_start": start_t,
                "selected_end": end_t,
                "decision": "SCHEDULED",
                "reason": explanation_reason,
                "score": candidate_score
            })

            order_idx += 1

        # Calculate final analytics & objective function
        analytics = self._calculate_final_analytics()

        return {
            "scheduled": self.all_scheduled,
            "schedules_by_room": self.schedules_by_room,
            "unscheduled": self.unscheduled,
            "decision_logs": self.decision_logs,
            "algorithm_steps": self.algorithm_steps,
            "analytics": analytics
        }

    def _calculate_final_analytics(self) -> Dict[str, Any]:
        """Calculates global metrics across operating rooms and surgeries."""
        total_surgeries = len(self.raw_surgeries)
        scheduled_count = len(self.all_scheduled)
        unscheduled_count = len(self.unscheduled)

        success_rate = (scheduled_count / total_surgeries * 100.0) if total_surgeries else 0.0

        emergency_count = sum(1 for s in self.all_scheduled if s.get("priority_level") == "Emergency")
        critical_count = sum(1 for s in self.all_scheduled if s.get("priority_level") == "Critical")
        high_count = sum(1 for s in self.all_scheduled if s.get("priority_level") == "High")
        medium_count = sum(1 for s in self.all_scheduled if s.get("priority_level") == "Medium")
        low_count = sum(1 for s in self.all_scheduled if s.get("priority_level") == "Low")

        # Room metrics
        room_analytics = []
        total_used_mins = 0
        total_available_mins = 0
        total_idle_mins = 0

        for room in self.operating_rooms:
            r_id = room.get("id")
            open_m = time_str_to_minutes(room.get("opening_time", "08:00"))
            close_m = time_str_to_minutes(room.get("closing_time", "17:00"))
            room_span = max(0, close_m - open_m)

            # Unavailability time
            unavails = [u for u in self.room_unavailabilities if u.get("room_id") == r_id]
            unavail_mins = 0
            for u in unavails:
                u_s = max(open_m, time_str_to_minutes(u.get("unavailable_start", "00:00")))
                u_e = min(close_m, time_str_to_minutes(u.get("unavailable_end", "00:00")))
                if u_e > u_s:
                    unavail_mins += (u_e - u_s)

            avail_mins = max(0, room_span - unavail_mins)

            # Bookings in this room
            bookings = sorted(
                self.schedules_by_room.get(r_id, []),
                key=lambda b: time_str_to_minutes(b.get("start_time", "00:00"))
            )
            used_mins = sum(int(b.get("duration_minutes", 0)) for b in bookings)

            # Idle time inside the room's working day
            cursor = open_m
            idle_in_room = 0
            for b in bookings:
                b_start = time_str_to_minutes(b.get("start_time", "00:00"))
                if b_start > cursor:
                    # check if gap falls into unavailability
                    gap_start = cursor
                    gap_end = b_start
                    # subtract any maintenance in this gap
                    effective_gap = gap_end - gap_start
                    for u in unavails:
                        u_s = time_str_to_minutes(u.get("unavailable_start", "00:00"))
                        u_e = time_str_to_minutes(u.get("unavailable_end", "00:00"))
                        overlap = max(0, min(gap_end, u_e) - max(gap_start, u_s))
                        effective_gap -= overlap
                    idle_in_room += max(0, effective_gap)
                cursor = max(cursor, time_str_to_minutes(b.get("end_time", "00:00")))

            util_pct = (used_mins / avail_mins * 100.0) if avail_mins else 0.0

            total_used_mins += used_mins
            total_available_mins += avail_mins
            total_idle_mins += idle_in_room

            room_analytics.append({
                "room_id": r_id,
                "room_name": room.get("room_name"),
                "room_type": room.get("room_type"),
                "working_hours": f"{room.get('opening_time')} - {room.get('closing_time')}",
                "available_hours": round(avail_mins / 60.0, 1),
                "used_hours": round(used_mins / 60.0, 1),
                "idle_hours": round(idle_in_room / 60.0, 1),
                "utilization_pct": round(util_pct, 1),
                "surgeries_count": len(bookings)
            })

        overall_utilization = (total_used_mins / total_available_mins * 100.0) if total_available_mins else 0.0

        # Waiting time: Actual Start - Requested Start
        total_waiting_mins = 0
        for b in self.all_scheduled:
            actual_start = time_str_to_minutes(b.get("start_time", "08:00"))
            req_start = time_str_to_minutes(b.get("requested_start", "08:00"))
            wait_m = max(0, actual_start - req_start)
            total_waiting_mins += wait_m

        avg_waiting_mins = (total_waiting_mins / scheduled_count) if scheduled_count else 0.0

        # Deadline compliance
        compliant_count = 0
        for b in self.all_scheduled:
            end_m = time_str_to_minutes(b.get("end_time", "18:00"))
            dead_m = time_str_to_minutes(b.get("deadline", "18:00"))
            if end_m <= dead_m:
                compliant_count += 1

        deadline_compliance_pct = (compliant_count / scheduled_count * 100.0) if scheduled_count else 100.0

        # Objective Function
        objective = calculate_objective_value(
            scheduled_surgeries=self.all_scheduled,
            unscheduled_surgeries=self.unscheduled,
            total_idle_minutes=total_idle_mins,
            total_waiting_minutes=total_waiting_mins
        )

        return {
            "total_surgeries": total_surgeries,
            "scheduled_count": scheduled_count,
            "unscheduled_count": unscheduled_count,
            "success_rate_pct": round(success_rate, 1),
            "emergency_scheduled": emergency_count,
            "critical_scheduled": critical_count,
            "high_scheduled": high_count,
            "medium_scheduled": medium_count,
            "low_scheduled": low_count,
            "overall_room_utilization_pct": round(overall_utilization, 1),
            "average_waiting_time_minutes": round(avg_waiting_mins, 1),
            "deadline_compliance_pct": round(deadline_compliance_pct, 1),
            "total_idle_time_minutes": total_idle_mins,
            "total_idle_hours": round(total_idle_mins / 60.0, 1),
            "room_utilization_breakdown": room_analytics,
            "objective": objective
        }

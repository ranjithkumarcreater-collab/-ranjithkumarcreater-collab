export type PriorityLevel = "Emergency" | "Critical" | "High" | "Medium" | "Low";
export type UrgencyLevel = "Immediate" | "Very Urgent" | "Urgent" | "Normal";
export type UserRole = "Admin" | "Scheduler" | "Viewer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Surgery {
  id: string;
  patient_name: string;
  patient_id: string;
  surgery_name: string;
  surgery_type: string;
  surgeon_name: string;
  duration_minutes: number;
  priority_level: PriorityLevel;
  priority_score?: number;
  urgency_level: UrgencyLevel;
  requested_start: string;
  deadline: string;
  required_room_type: string;
  required_equipment: string[];
  status: "Pending" | "Scheduled" | "Unscheduled" | "Completed";
  created_at?: number;
}

export interface RoomUnavailability {
  id: string;
  room_id: string;
  unavailable_start: string;
  unavailable_end: string;
  reason: string;
}

export interface OperatingRoom {
  id: string;
  room_name: string;
  room_type: string;
  opening_time: string;
  closing_time: string;
  equipment: string[];
  status: "Active" | "Inactive";
  unavailabilities?: RoomUnavailability[];
}

export interface ScheduledSurgery {
  surgery_id: string;
  patient_name: string;
  patient_id: string;
  surgery_name: string;
  surgery_type: string;
  surgeon_name: string;
  room_id: string;
  room_name: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  priority_level: PriorityLevel;
  urgency_level: UrgencyLevel;
  requested_start: string;
  deadline: string;
  score: number;
  status: string;
  explanation?: string;
  breakdown?: {
    priority_benefit: number;
    deadline_benefit: number;
    waiting_cost: number;
    idle_cost: number;
    deadline_penalty: number;
    idle_minutes: number;
    wait_minutes: number;
    breakdown_str: string;
  };
}

export interface UnscheduledSurgery extends Surgery {
  failure_reason: string;
  suggested_slot?: string;
  rejected_rooms?: Array<{ room_name: string; reason: string }>;
}

export interface DecisionLog {
  id?: string;
  surgery_id: string;
  surgery_name: string;
  patient_name: string;
  priority_score: number;
  candidate_rooms: string[];
  rejected_candidates: Array<{ room?: string; slot?: string; reason: string }>;
  selected_room?: string | null;
  selected_start?: string | null;
  selected_end?: string | null;
  decision: "SCHEDULED" | "UNSCHEDULED";
  reason: string;
  score: number;
}

export interface AlgorithmStep {
  step_number: number;
  title?: string;
  description?: string;
  surgery_id?: string;
  surgery_name?: string;
  patient_name?: string;
  priority_score?: number;
  priority_level?: PriorityLevel;
  duration_minutes?: number;
  deadline?: string;
  compatible_rooms?: string[];
  rejected_rooms?: Array<{ room_id: string; room_name: string; reason: string }>;
  candidate_slots?: Array<{
    room_name: string;
    start_time: string;
    end_time: string;
    score: number;
    breakdown: string;
    idle_minutes: number;
    wait_minutes: number;
  }>;
  selected_candidate?: {
    room_name: string;
    start_time: string;
    end_time: string;
    score: number;
  };
  decision?: string;
  reason?: string;
  suggested_slot?: string;
  data?: any;
}

export interface RoomUtilizationMetric {
  room_id: string;
  room_name: string;
  room_type: string;
  working_hours: string;
  available_hours: number;
  used_hours: number;
  idle_hours: number;
  utilization_pct: number;
  surgeries_count: number;
}

export interface ObjectiveComponents {
  priority_benefit: number;
  waiting_time_penalty: number;
  idle_time_penalty: number;
  deadline_violation_penalty: number;
  unscheduled_penalty: number;
  deadline_violations_count: number;
  total_waiting_hours: number;
  total_idle_hours: number;
}

export interface AnalyticsData {
  total_surgeries: number;
  scheduled_count: number;
  unscheduled_count: number;
  success_rate_pct: number;
  emergency_scheduled: number;
  critical_scheduled: number;
  high_scheduled: number;
  medium_scheduled: number;
  low_scheduled: number;
  overall_room_utilization_pct: number;
  average_waiting_time_minutes: number;
  deadline_compliance_pct: number;
  total_idle_time_minutes: number;
  total_idle_hours: number;
  room_utilization_breakdown: RoomUtilizationMetric[];
  objective: {
    raw_objective_score: number;
    normalized_score: number;
    components: ObjectiveComponents;
    formula: string;
  };
}

export interface SchedulingRun {
  id: string;
  run_name: string;
  total_surgeries: number;
  scheduled_surgeries: number;
  unscheduled_surgeries: number;
  objective_value: number;
  average_waiting_time: number;
  room_utilization: number;
  deadline_compliance: number;
  total_idle_time: number;
  created_at: number;
}

export interface ComprehensiveExplanation {
  surgery_id: string;
  surgery_name: string;
  status: string;
  score: number;
  answers: {
    why_this_surgery: string;
    why_this_room: string;
    why_this_time: string;
    why_not_another_room: string;
    why_unscheduled: string;
  };
  full_text: string;
}

export interface ScheduleRunResult {
  run_id: string;
  run_name: string;
  scheduled: ScheduledSurgery[];
  unscheduled: UnscheduledSurgery[];
  decision_logs: DecisionLog[];
  algorithm_steps: AlgorithmStep[];
  explanations: Record<string, ComprehensiveExplanation>;
  analytics: AnalyticsData;
}

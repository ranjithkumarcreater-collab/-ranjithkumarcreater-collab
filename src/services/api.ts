import {
  Surgery,
  OperatingRoom,
  ScheduledSurgery,
  DecisionLog,
  SchedulingRun,
  ScheduleRunResult,
  User,
  RoomUnavailability
} from "../types";

export const API_BASE = "/api";

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {})
    },
    ...options
  });

  if (!res.ok) {
    let errMessage = `HTTP ${res.status}: ${res.statusText}`;
    try {
      const errObj = await res.json();
      if (errObj.error) errMessage = errObj.error;
    } catch {
      // ignore
    }
    throw new Error(errMessage);
  }

  return res.json();
}

export const api = {
  // Health
  checkHealth: () => fetchJson<{ status: string; service: string; algorithms: string[] }>(`${API_BASE}/health`),

  // Auth
  login: (email: string, password: string) =>
    fetchJson<{ success?: boolean; message?: string; user: User; token?: string }>(`${API_BASE}/auth/login`, {
      method: "POST",
      body: JSON.stringify({ email, password })
    }),

  // Demo Data
  loadDemoData: () =>
    fetchJson<{ message: string }>(`${API_BASE}/demo-data`, {
      method: "POST"
    }),

  // Surgeries
  getSurgeries: () => fetchJson<Surgery[]>(`${API_BASE}/surgeries`),
  getSurgery: (id: string) => fetchJson<Surgery>(`${API_BASE}/surgeries/${id}`),
  createSurgery: (surgery: Partial<Surgery>) =>
    fetchJson<{ message: string; id: string }>(`${API_BASE}/surgeries`, {
      method: "POST",
      body: JSON.stringify(surgery)
    }),
  updateSurgery: (id: string, surgery: Partial<Surgery>) =>
    fetchJson<{ message: string }>(`${API_BASE}/surgeries/${id}`, {
      method: "PUT",
      body: JSON.stringify(surgery)
    }),
  deleteSurgery: (id: string) =>
    fetchJson<{ message: string }>(`${API_BASE}/surgeries/${id}`, {
      method: "DELETE"
    }),

  // Operating Rooms
  getRooms: () => fetchJson<OperatingRoom[]>(`${API_BASE}/rooms`),
  getRoom: (id: string) => fetchJson<OperatingRoom>(`${API_BASE}/rooms/${id}`),
  createRoom: (room: Partial<OperatingRoom>) =>
    fetchJson<{ message: string; id: string }>(`${API_BASE}/rooms`, {
      method: "POST",
      body: JSON.stringify(room)
    }),
  updateRoom: (id: string, room: Partial<OperatingRoom>) =>
    fetchJson<{ message: string }>(`${API_BASE}/rooms/${id}`, {
      method: "PUT",
      body: JSON.stringify(room)
    }),
  deleteRoom: (id: string) =>
    fetchJson<{ message: string }>(`${API_BASE}/rooms/${id}`, {
      method: "DELETE"
    }),
  addUnavailability: (roomId: string, data: Partial<RoomUnavailability>) =>
    fetchJson<{ message: string; id: string }>(`${API_BASE}/rooms/${roomId}/unavailability`, {
      method: "POST",
      body: JSON.stringify(data)
    }),

  // Scheduling Execution
  runScheduler: (params?: { weights?: any; interval_minutes?: number; run_name?: string }) =>
    fetchJson<ScheduleRunResult>(`${API_BASE}/schedule/run`, {
      method: "POST",
      body: JSON.stringify(params || {})
    }),
  resetScheduler: () =>
    fetchJson<{ message: string }>(`${API_BASE}/schedule/reset`, {
      method: "POST"
    }),
  getSchedule: () => fetchJson<ScheduledSurgery[]>(`${API_BASE}/schedule`),
  getSchedulingLogs: () => fetchJson<DecisionLog[]>(`${API_BASE}/scheduling-logs`),
  getSchedulingRuns: () => fetchJson<SchedulingRun[]>(`${API_BASE}/scheduling-runs`),

  // Analytics
  getAnalytics: () => fetchJson<any>(`${API_BASE}/analytics`)
};

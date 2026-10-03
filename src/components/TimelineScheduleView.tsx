import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  Hospital,
  Wrench,
  Info,
  ChevronRight,
  Maximize2
} from "lucide-react";
import { OperatingRoom, ScheduledSurgery, Surgery } from "../types";

interface TimelineScheduleViewProps {
  rooms: OperatingRoom[];
  schedules: ScheduledSurgery[];
  surgeries: Surgery[];
  onSelectSurgery: (s: any) => void;
}

// Convert "HH:MM" to minutes from 08:00 (which is 480 minutes)
const TIMELINE_START_MINUTES = 8 * 60; // 08:00 = 480
const TIMELINE_END_MINUTES = 18 * 60;  // 18:00 = 1080
const TOTAL_TIMELINE_SPAN = TIMELINE_END_MINUTES - TIMELINE_START_MINUTES; // 600 mins

function timeStrToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(":");
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

export const TimelineScheduleView: React.FC<TimelineScheduleViewProps> = ({
  rooms,
  schedules,
  surgeries,
  onSelectSurgery
}) => {
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string>("ALL");
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredRooms = selectedRoomFilter === "ALL"
    ? rooms
    : rooms.filter((r) => r.id === selectedRoomFilter);

  // Time ticks: 08:00, 09:00, ..., 18:00
  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "Emergency":
        return "bg-rose-500/20 border-rose-500/50 text-rose-200 hover:bg-rose-500/30 shadow-rose-950/40";
      case "Critical":
        return "bg-orange-500/20 border-orange-500/50 text-orange-200 hover:bg-orange-500/30 shadow-orange-950/40";
      case "High":
        return "bg-blue-500/20 border-blue-500/50 text-blue-200 hover:bg-blue-500/30 shadow-blue-950/40";
      case "Medium":
        return "bg-cyan-500/20 border-cyan-500/50 text-cyan-200 hover:bg-cyan-500/30 shadow-cyan-950/40";
      case "Low":
      default:
        return "bg-slate-700/40 border-slate-600/50 text-slate-300 hover:bg-slate-700/60 shadow-slate-950/40";
    }
  };

  return (
    <div className="space-y-5">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <span>Operating Room Timeline Schedule</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Discrete time unit grid &bull; Click any surgery to inspect why it was scheduled here
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Room filter */}
          <select
            value={selectedRoomFilter}
            onChange={(e) => setSelectedRoomFilter(e.target.value)}
            className="text-xs bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Operating Rooms</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.room_name}
              </option>
            ))}
          </select>

          {/* Priority filter */}
          <select
            value={selectedPriorityFilter}
            onChange={(e) => setSelectedPriorityFilter(e.target.value)}
            className="text-xs bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="Emergency">Emergency</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search surgery or surgeon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-44"
            />
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-900/60 border border-slate-800/80 px-4 py-2.5 rounded-xl">
        <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider">Priority Legend:</span>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded bg-rose-500/40 border border-rose-500" />
          <span className="text-rose-300 text-[11px]">Emergency (5)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded bg-orange-500/40 border border-orange-500" />
          <span className="text-orange-300 text-[11px]">Critical (4)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded bg-blue-500/40 border border-blue-500" />
          <span className="text-blue-300 text-[11px]">High (3)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded bg-cyan-500/40 border border-cyan-500" />
          <span className="text-cyan-300 text-[11px]">Medium (2)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded bg-slate-700 border border-slate-500" />
          <span className="text-slate-400 text-[11px]">Low (1)</span>
        </div>
        <div className="flex items-center space-x-1.5 border-l border-slate-700 pl-3">
          <span className="w-3 h-3 rounded bg-amber-950/60 border border-amber-600/70" />
          <span className="text-amber-400 text-[11px]">Maintenance Closure</span>
        </div>
      </div>

      {/* Interactive Timeline Canvas */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Time Header Grid */}
          <div className="grid grid-cols-12 gap-0 border-b border-slate-800 pb-3 mb-4">
            <div className="col-span-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              Operating Room
            </div>
            <div className="col-span-10 grid grid-cols-10 gap-0 text-center">
              {hours.slice(0, 10).map((h) => (
                <div key={h} className="text-xs font-mono font-semibold text-slate-400 border-l border-slate-800/80 pl-1 text-left">
                  {String(h).padStart(2, "0")}:00
                </div>
              ))}
            </div>
          </div>

          {/* Operating Room Tracks */}
          <div className="space-y-6">
            {filteredRooms.map((room) => {
              // Surgeries scheduled in this room
              let roomSchedules = schedules.filter((s) => s.room_id === room.id);

              if (selectedPriorityFilter !== "ALL") {
                roomSchedules = roomSchedules.filter((s) => s.priority_level === selectedPriorityFilter);
              }

              if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                roomSchedules = roomSchedules.filter(
                  (s) =>
                    s.surgery_name?.toLowerCase().includes(q) ||
                    s.patient_name?.toLowerCase().includes(q) ||
                    s.surgeon_name?.toLowerCase().includes(q) ||
                    s.surgery_id?.toLowerCase().includes(q)
                );
              }

              const unavails = room.unavailabilities || [];

              return (
                <div key={room.id} className="grid grid-cols-12 gap-0 items-center border-b border-slate-800/50 pb-5">
                  {/* Room Label */}
                  <div className="col-span-2 pr-4">
                    <div className="font-bold text-xs text-slate-200 flex items-center space-x-1.5">
                      <Hospital className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">{room.room_name}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {room.room_type} &bull; {room.opening_time} - {room.closing_time}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {room.equipment?.slice(0, 2).map((eq, i) => (
                        <span key={i} className="text-[9px] px-1 py-0.2 rounded bg-slate-800 border border-slate-700/60 text-slate-300">
                          {eq}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Room Timeline Track */}
                  <div className="col-span-10 relative bg-slate-950/70 border border-slate-800/80 rounded-xl h-20 overflow-hidden shadow-inner">
                    {/* Hour grid vertical guide lines */}
                    <div className="absolute inset-0 grid grid-cols-10 pointer-events-none">
                      {Array.from({ length: 10 }).map((_, idx) => (
                        <div key={idx} className="border-r border-slate-800/50 h-full" />
                      ))}
                    </div>

                    {/* Temporary Closures / Maintenance Blocks */}
                    {unavails.map((u) => {
                      const uStart = timeStrToMinutes(u.unavailable_start);
                      const uEnd = timeStrToMinutes(u.unavailable_end);
                      const leftPct = ((uStart - TIMELINE_START_MINUTES) / TOTAL_TIMELINE_SPAN) * 100;
                      const widthPct = ((uEnd - uStart) / TOTAL_TIMELINE_SPAN) * 100;

                      return (
                        <div
                          key={u.id}
                          className="absolute top-1 bottom-1 rounded-lg bg-amber-950/40 border border-dashed border-amber-600/70 flex flex-col items-center justify-center p-1 overflow-hidden z-10"
                          style={{
                            left: `${Math.max(0, leftPct)}%`,
                            width: `${Math.min(100 - leftPct, widthPct)}%`
                          }}
                          title={`Closure: ${u.reason} (${u.unavailable_start} - ${u.unavailable_end})`}
                        >
                          <Wrench className="w-3 h-3 text-amber-400 mb-0.5" />
                          <span className="text-[9px] font-bold text-amber-300 text-center truncate w-full">
                            MAINTENANCE
                          </span>
                          <span className="text-[8px] text-amber-400 font-mono">
                            {u.unavailable_start}-{u.unavailable_end}
                          </span>
                        </div>
                      );
                    })}

                    {/* Scheduled Surgeries Blocks */}
                    {roomSchedules.map((s) => {
                      const startMins = timeStrToMinutes(s.start_time);
                      const endMins = timeStrToMinutes(s.end_time);
                      const leftPct = ((startMins - TIMELINE_START_MINUTES) / TOTAL_TIMELINE_SPAN) * 100;
                      const widthPct = ((endMins - startMins) / TOTAL_TIMELINE_SPAN) * 100;

                      const priorityStyle = getPriorityStyle(s.priority_level);

                      return (
                        <div
                          key={s.surgery_id}
                          onClick={() => onSelectSurgery(s)}
                          className={`absolute top-1.5 bottom-1.5 rounded-xl border p-2 flex flex-col justify-between cursor-pointer transition-all duration-200 transform hover:scale-[1.01] hover:z-20 shadow-md ${priorityStyle}`}
                          style={{
                            left: `${Math.max(0, leftPct)}%`,
                            width: `${Math.max(4, widthPct)}%`
                          }}
                          title={`Click for explanation: ${s.surgery_id} - ${s.surgery_name} (${s.start_time} - ${s.end_time})`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[11px] truncate tracking-tight">
                              {s.surgery_id}: {s.surgery_name}
                            </span>
                            <span className="text-[9px] font-mono px-1 rounded bg-black/40 border border-white/10 shrink-0 ml-1">
                              {s.priority_level}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] opacity-90">
                            <span className="font-mono text-[9px] font-bold">
                              {s.start_time} - {s.end_time} ({s.duration_minutes}m)
                            </span>
                            <span className="text-[9px] truncate max-w-[90px] hidden sm:inline">
                              {s.surgeon_name}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {/* If room has no schedules */}
                    {roomSchedules.length === 0 && unavails.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-600 text-xs italic">
                        Available continuous block (08:00 - 17:00)
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

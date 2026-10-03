import React, { useState } from "react";
import {
  Layers,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  X,
  Sparkles,
  ArrowUpDown
} from "lucide-react";
import { Surgery, PriorityLevel, UrgencyLevel, User } from "../types";

interface SurgeriesViewProps {
  surgeries: Surgery[];
  onAddSurgery: (s: Partial<Surgery>) => Promise<any>;
  onUpdateSurgery: (id: string, s: Partial<Surgery>) => Promise<any>;
  onDeleteSurgery: (id: string) => Promise<any>;
  onSelectSurgery: (s: any) => void;
  currentUser: User | null;
}

export const SurgeriesView: React.FC<SurgeriesViewProps> = ({
  surgeries,
  onAddSurgery,
  onUpdateSurgery,
  onDeleteSurgery,
  onSelectSurgery,
  currentUser
}) => {
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState<"priority" | "duration" | "deadline">("priority");
  const [sortAsc, setSortAsc] = useState(false);

  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Surgery>>({
    patient_name: "",
    surgery_name: "",
    surgery_type: "General",
    surgeon_name: "Dr. Emily Hayes",
    duration_minutes: 90,
    priority_level: "High",
    urgency_level: "Urgent",
    requested_start: "08:00",
    deadline: "16:00",
    required_room_type: "General",
    required_equipment: []
  });
  const [equipInput, setEquipInput] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Available room types
  const roomTypes = ["General", "Cardiac", "Orthopedic", "Hybrid"];

  // Filter & Search
  let filtered = surgeries.filter((s) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      s.patient_name.toLowerCase().includes(q) ||
      s.surgery_name.toLowerCase().includes(q) ||
      s.surgeon_name.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q);

    const matchesPriority = priorityFilter === "ALL" || s.priority_level === priorityFilter;
    const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;
    const matchesType = typeFilter === "ALL" || s.surgery_type === typeFilter;

    return matchesSearch && matchesPriority && matchesStatus && matchesType;
  });

  // Sort
  const priorityValue: Record<string, number> = {
    Emergency: 5,
    Critical: 4,
    High: 3,
    Medium: 2,
    Low: 1
  };

  filtered.sort((a, b) => {
    let diff = 0;
    if (sortBy === "priority") {
      diff = (priorityValue[b.priority_level] || 0) - (priorityValue[a.priority_level] || 0);
    } else if (sortBy === "duration") {
      diff = b.duration_minutes - a.duration_minutes;
    } else if (sortBy === "deadline") {
      diff = a.deadline.localeCompare(b.deadline);
    }
    return sortAsc ? -diff : diff;
  });

  const handleEquipmentToggle = (item: string) => {
    const current = formData.required_equipment || [];
    if (current.includes(item)) {
      setFormData({ ...formData, required_equipment: current.filter((x) => x !== item) });
    } else {
      setFormData({ ...formData, required_equipment: [...current, item] });
    }
  };

  const handleAddCustomEquip = () => {
    if (equipInput.trim()) {
      const current = formData.required_equipment || [];
      if (!current.includes(equipInput.trim())) {
        setFormData({ ...formData, required_equipment: [...current, equipInput.trim()] });
      }
      setEquipInput("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.patient_name || !formData.surgery_name) {
      setFormError("Patient name and Surgery name are required.");
      return;
    }
    if (!formData.duration_minutes || formData.duration_minutes <= 0) {
      setFormError("Duration must be greater than zero.");
      return;
    }
    if (formData.requested_start && formData.deadline && formData.requested_start >= formData.deadline) {
      setFormError("Deadline must be later than requested start time.");
      return;
    }

    try {
      await onAddSurgery(formData);
      setIsAddModalOpen(false);
      setFormData({
        patient_name: "",
        surgery_name: "",
        surgery_type: "General",
        surgeon_name: "Dr. Emily Hayes",
        duration_minutes: 90,
        priority_level: "High",
        urgency_level: "Urgent",
        requested_start: "08:00",
        deadline: "16:00",
        required_room_type: "General",
        required_equipment: []
      });
    } catch (err: any) {
      setFormError(err.message || "Failed to add surgery");
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>Surgery Management Pool</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Pending, scheduled, and unallocated surgical procedures
          </p>
        </div>

        {currentUser?.role !== "Viewer" && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md shadow-cyan-600/30 transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Surgery</span>
          </button>
        )}
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search patient, surgery, surgeon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-56"
            />
          </div>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="Emergency">Emergency (5)</option>
            <option value="Critical">Critical (4)</option>
            <option value="High">High (3)</option>
            <option value="Medium">Medium (2)</option>
            <option value="Low">Low (1)</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Unscheduled">Unscheduled</option>
          </select>
        </div>

        {/* Sorting controls */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-2 py-1 text-slate-300 focus:outline-none"
          >
            <option value="priority">Priority Score</option>
            <option value="duration">Duration</option>
            <option value="deadline">Deadline</option>
          </select>
          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            title="Toggle Asc/Desc"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Surgeries Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-[11px]">
                <th className="py-3 px-4 font-semibold">ID / Patient</th>
                <th className="py-3 px-4 font-semibold">Surgery Name</th>
                <th className="py-3 px-4 font-semibold">Duration</th>
                <th className="py-3 px-4 font-semibold">Priority & Urgency</th>
                <th className="py-3 px-4 font-semibold">Requested & Deadline</th>
                <th className="py-3 px-4 font-semibold">Required Room & Equip</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((s) => {
                return (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-200">{s.id}</div>
                      <div className="text-[11px] text-slate-400">
                        {s.patient_name} <span className="text-slate-500">({s.patient_id})</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{s.surgery_name}</div>
                      <div className="text-[11px] text-slate-400">
                        Surgeon: <span className="text-slate-300">{s.surgeon_name}</span> &bull; {s.surgery_type}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1 font-mono text-slate-200 font-bold">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{s.duration_minutes}m</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            s.priority_level === "Emergency"
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : s.priority_level === "Critical"
                              ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                              : s.priority_level === "High"
                              ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                              : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                          }`}
                        >
                          {s.priority_level}
                        </span>
                        <span className="text-[10px] text-slate-400">({s.urgency_level})</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-300 text-[11px]">
                        Req: <span className="font-mono text-slate-200">{s.requested_start}</span>
                      </div>
                      <div className="text-amber-300 text-[11px]">
                        Due: <span className="font-mono font-bold">{s.deadline}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-cyan-300 font-medium">{s.required_room_type}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                        {s.required_equipment?.length ? s.required_equipment.join(", ") : "None"}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          s.status === "Scheduled"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : s.status === "Unscheduled"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-slate-700/60 text-slate-300 border border-slate-600"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => onSelectSurgery(s)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-medium border border-slate-700 transition"
                        >
                          Explain
                        </button>
                        {currentUser?.role === "Admin" && (
                          <button
                            onClick={() => onDeleteSurgery(s.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                            title="Delete surgery"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Surgery Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Add New Surgery</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Patient Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.patient_name || ""}
                    onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                    placeholder="e.g. John Doe"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Surgery Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.surgery_name || ""}
                    onChange={(e) => setFormData({ ...formData, surgery_name: e.target.value })}
                    placeholder="e.g. Coronary Artery Bypass"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Surgery Type</label>
                  <select
                    value={formData.surgery_type || "General"}
                    onChange={(e) => setFormData({ ...formData, surgery_type: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="General">General Surgery</option>
                    <option value="Cardiac">Cardiac Surgery</option>
                    <option value="Orthopedic">Orthopedic Surgery</option>
                    <option value="Neurosurgery">Neurosurgery</option>
                    <option value="Vascular">Vascular Surgery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Surgeon Name</label>
                  <input
                    type="text"
                    value={formData.surgeon_name || ""}
                    onChange={(e) => setFormData({ ...formData, surgeon_name: e.target.value })}
                    placeholder="e.g. Dr. Emily Hayes"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Duration (minutes) *</label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    required
                    value={formData.duration_minutes || 60}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 60 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Priority Level *</label>
                  <select
                    value={formData.priority_level || "Medium"}
                    onChange={(e) => setFormData({ ...formData, priority_level: e.target.value as PriorityLevel })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-semibold"
                  >
                    <option value="Emergency">Emergency (5) - Critical Immediate</option>
                    <option value="Critical">Critical (4) - Life Threatening</option>
                    <option value="High">High (3) - High Priority</option>
                    <option value="Medium">Medium (2) - Standard</option>
                    <option value="Low">Low (1) - Elective</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Urgency Level</label>
                  <select
                    value={formData.urgency_level || "Normal"}
                    onChange={(e) => setFormData({ ...formData, urgency_level: e.target.value as UrgencyLevel })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Immediate">Immediate</option>
                    <option value="Very Urgent">Very Urgent</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Normal">Normal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Required Room Type</label>
                  <select
                    value={formData.required_room_type || "General"}
                    onChange={(e) => setFormData({ ...formData, required_room_type: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    {roomTypes.map((t) => (
                      <option key={t} value={t}>{t} OR Suite</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Requested Start Time</label>
                  <input
                    type="time"
                    value={formData.requested_start || "08:00"}
                    onChange={(e) => setFormData({ ...formData, requested_start: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Deadline *</label>
                  <input
                    type="time"
                    required
                    value={formData.deadline || "17:00"}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Equipment Checklist */}
              <div>
                <label className="block text-slate-400 mb-1.5 font-medium">Required Equipment</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {[
                    "Laparoscope",
                    "Heart-Lung Machine",
                    "C-Arm",
                    "Orthopedic Table",
                    "Electrocautery",
                    "Defibrillator",
                    "Angiography System",
                    "Microsurgical Microscope",
                    "Power Tools"
                  ].map((eq) => {
                    const isChecked = formData.required_equipment?.includes(eq);
                    return (
                      <button
                        type="button"
                        key={eq}
                        onClick={() => handleEquipmentToggle(eq)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] border transition ${
                          isChecked
                            ? "bg-cyan-500/20 border-cyan-400 text-cyan-200 font-semibold"
                            : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-300"
                        }`}
                      >
                        {eq} {isChecked ? "✓" : "+"}
                      </button>
                    );
                  })}
                </div>

                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Custom equipment..."
                    value={equipInput}
                    onChange={(e) => setEquipInput(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none text-xs flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomEquip}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/30"
                >
                  Save Surgery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

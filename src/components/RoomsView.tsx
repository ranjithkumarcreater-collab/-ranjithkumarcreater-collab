import React, { useState } from "react";
import {
  Hospital,
  Plus,
  Clock,
  Wrench,
  CheckCircle2,
  AlertCircle,
  X,
  Trash2,
  Edit,
  Tag
} from "lucide-react";
import { OperatingRoom, RoomUnavailability, User } from "../types";

interface RoomsViewProps {
  rooms: OperatingRoom[];
  onAddRoom: (r: Partial<OperatingRoom>) => Promise<any>;
  onUpdateRoom: (id: string, r: Partial<OperatingRoom>) => Promise<any>;
  onDeleteRoom: (id: string) => Promise<any>;
  onAddUnavailability: (roomId: string, u: Partial<RoomUnavailability>) => Promise<any>;
  currentUser: User | null;
}

export const RoomsView: React.FC<RoomsViewProps> = ({
  rooms,
  onAddRoom,
  onUpdateRoom,
  onDeleteRoom,
  onAddUnavailability,
  currentUser
}) => {
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [isUnavailModalOpen, setIsUnavailModalOpen] = useState(false);
  const [selectedRoomForUnavail, setSelectedRoomForUnavail] = useState<string>("");

  const [roomFormData, setRoomFormData] = useState<Partial<OperatingRoom>>({
    room_name: "",
    room_type: "General",
    opening_time: "08:00",
    closing_time: "17:00",
    equipment: [],
    status: "Active"
  });

  const [unavailFormData, setUnavailFormData] = useState<Partial<RoomUnavailability>>({
    unavailable_start: "12:00",
    unavailable_end: "13:00",
    reason: "Equipment Sterilization Routine"
  });

  const [equipInput, setEquipInput] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const handleAddRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!roomFormData.room_name) {
      setFormError("Room name is required.");
      return;
    }

    try {
      await onAddRoom(roomFormData);
      setIsAddRoomModalOpen(false);
      setRoomFormData({
        room_name: "",
        room_type: "General",
        opening_time: "08:00",
        closing_time: "17:00",
        equipment: [],
        status: "Active"
      });
    } catch (err: any) {
      setFormError(err.message || "Failed to create room");
    }
  };

  const handleUnavailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!selectedRoomForUnavail) {
      setFormError("Please select a target operating room.");
      return;
    }

    try {
      await onAddUnavailability(selectedRoomForUnavail, unavailFormData);
      setIsUnavailModalOpen(false);
      setUnavailFormData({
        unavailable_start: "12:00",
        unavailable_end: "13:00",
        reason: "Equipment Sterilization Routine"
      });
    } catch (err: any) {
      setFormError(err.message || "Failed to schedule closure");
    }
  };

  const toggleEquipment = (item: string) => {
    const current = roomFormData.equipment || [];
    if (current.includes(item)) {
      setRoomFormData({ ...roomFormData, equipment: current.filter((x) => x !== item) });
    } else {
      setRoomFormData({ ...roomFormData, equipment: [...current, item] });
    }
  };

  const handleAddCustomEquip = () => {
    if (equipInput.trim()) {
      const current = roomFormData.equipment || [];
      if (!current.includes(equipInput.trim())) {
        setRoomFormData({ ...roomFormData, equipment: [...current, equipInput.trim()] });
      }
      setEquipInput("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <Hospital className="w-5 h-5 text-teal-400" />
            <span>Operating Room Suites & Availability</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure working hours, specialty suite types, equipment registries, and temporary maintenance closures
          </p>
        </div>

        {currentUser?.role !== "Viewer" && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setSelectedRoomForUnavail(rooms[0]?.id || "");
                setIsUnavailModalOpen(true);
              }}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-semibold text-xs transition"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Schedule Maintenance</span>
            </button>
            <button
              onClick={() => setIsAddRoomModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow-md shadow-teal-600/30 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Operating Room</span>
            </button>
          </div>
        )}
      </div>

      {/* Operating Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {rooms.map((room) => {
          const unavails = room.unavailabilities || [];
          return (
            <div
              key={room.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500/20 to-cyan-500/20 border border-teal-500/40 text-teal-300 flex items-center justify-center font-bold">
                      <Hospital className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
                        <span>{room.room_name}</span>
                        <span className="font-mono text-xs text-slate-400">({room.id})</span>
                      </h3>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Suite Type: <strong className="text-cyan-300">{room.room_type}</strong>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      room.status === "Active"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-slate-700/60 text-slate-400 border border-slate-600"
                    }`}
                  >
                    {room.status}
                  </span>
                </div>

                {/* Operating hours */}
                <div className="mt-4 flex items-center space-x-2 text-xs text-slate-300 bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
                  <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>
                    Working Hours: <strong className="text-white">{room.opening_time} - {room.closing_time}</strong> (Hard Constraint 2)
                  </span>
                </div>

                {/* Equipment Tags */}
                <div className="mt-3">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                    <Tag className="w-3 h-3 text-cyan-400" />
                    <span>Sterilized Equipment Available</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {room.equipment && room.equipment.length > 0 ? (
                      room.equipment.map((eq, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-[11px]"
                        >
                          {eq}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 text-xs italic">Standard basic fixtures</span>
                    )}
                  </div>
                </div>

                {/* Unavailability & Closures */}
                {unavails.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-800">
                    <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                      <Wrench className="w-3 h-3 text-amber-400" />
                      <span>Scheduled Closures (Hard Constraint 7)</span>
                    </div>
                    <div className="space-y-1.5">
                      {unavails.map((u) => (
                        <div
                          key={u.id}
                          className="p-2 rounded-lg bg-amber-950/20 border border-amber-800/40 text-[11px] flex justify-between items-center text-amber-200"
                        >
                          <span className="font-mono font-bold">
                            {u.unavailable_start} - {u.unavailable_end}
                          </span>
                          <span className="text-amber-300/80 truncate max-w-[200px]">{u.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action footer */}
              {currentUser?.role === "Admin" && (
                <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                  <button
                    onClick={() => {
                      setSelectedRoomForUnavail(room.id);
                      setIsUnavailModalOpen(true);
                    }}
                    className="text-amber-400 hover:text-amber-300 font-medium"
                  >
                    + Add Closure
                  </button>
                  <button
                    onClick={() => onDeleteRoom(room.id)}
                    className="text-slate-500 hover:text-rose-400 transition"
                    title="Delete Room"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Room Modal */}
      {isAddRoomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Add Operating Room Suite</h3>
              <button onClick={() => setIsAddRoomModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRoomSubmit} className="mt-4 space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-slate-400 mb-1">Room Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. OR-5 Robotic Surgery"
                  value={roomFormData.room_name || ""}
                  onChange={(e) => setRoomFormData({ ...roomFormData, room_name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Suite Type</label>
                  <select
                    value={roomFormData.room_type || "General"}
                    onChange={(e) => setRoomFormData({ ...roomFormData, room_type: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
                  >
                    <option value="General">General</option>
                    <option value="Cardiac">Cardiac</option>
                    <option value="Orthopedic">Orthopedic</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Status</label>
                  <select
                    value={roomFormData.status || "Active"}
                    onChange={(e) => setRoomFormData({ ...roomFormData, status: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive / Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Opening Time</label>
                  <input
                    type="time"
                    value={roomFormData.opening_time || "08:00"}
                    onChange={(e) => setRoomFormData({ ...roomFormData, opening_time: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Closing Time</label>
                  <input
                    type="time"
                    value={roomFormData.closing_time || "17:00"}
                    onChange={(e) => setRoomFormData({ ...roomFormData, closing_time: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Equipment list */}
              <div>
                <label className="block text-slate-400 mb-1.5">Equipment Installed</label>
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
                    "Power Tools",
                    "Standard Monitor"
                  ].map((eq) => {
                    const isChecked = roomFormData.equipment?.includes(eq);
                    return (
                      <button
                        type="button"
                        key={eq}
                        onClick={() => toggleEquipment(eq)}
                        className={`px-2 py-1 rounded-lg text-[11px] border transition ${
                          isChecked
                            ? "bg-teal-500/20 border-teal-400 text-teal-200 font-semibold"
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
                  onClick={() => setIsAddRoomModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold"
                >
                  Save Operating Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Maintenance / Unavailability Modal */}
      {isUnavailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Wrench className="w-4 h-4 text-amber-400" />
                <span>Schedule Maintenance Window</span>
              </h3>
              <button onClick={() => setIsUnavailModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUnavailSubmit} className="mt-4 space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-slate-400 mb-1">Target Operating Room</label>
                <select
                  value={selectedRoomForUnavail}
                  onChange={(e) => setSelectedRoomForUnavail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-semibold"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.room_name} ({r.room_type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={unavailFormData.unavailable_start || "12:00"}
                    onChange={(e) => setUnavailFormData({ ...unavailFormData, unavailable_start: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={unavailFormData.unavailable_end || "13:00"}
                    onChange={(e) => setUnavailFormData({ ...unavailFormData, unavailable_end: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Reason / Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cardiopulmonary Pump Sterilization"
                  value={unavailFormData.reason || ""}
                  onChange={(e) => setUnavailFormData({ ...unavailFormData, reason: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsUnavailModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md shadow-amber-600/30"
                >
                  Confirm Closure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from "react";
import { api } from "./services/api";
import {
  User,
  UserRole,
  Surgery,
  OperatingRoom,
  ScheduledSurgery,
  DecisionLog,
  AlgorithmStep,
  AnalyticsData,
  SchedulingRun,
  ScheduleRunResult
} from "./types";
import { Navbar } from "./components/Navbar";
import { DashboardView } from "./components/DashboardView";
import { TimelineScheduleView } from "./components/TimelineScheduleView";
import { DecisionCenterView } from "./components/DecisionCenterView";
import { SurgeriesView } from "./components/SurgeriesView";
import { RoomsView } from "./components/RoomsView";
import { UnscheduledView } from "./components/UnscheduledView";
import { AnalyticsView } from "./components/AnalyticsView";
import { RunHistoryView } from "./components/RunHistoryView";
import { SettingsView } from "./components/SettingsView";
import { RunDemoModal } from "./components/RunDemoModal";
import { DecisionModal } from "./components/DecisionModal";
import { Loader2 } from "lucide-react";

const VALID_TABS = [
  "dashboard",
  "surgeries",
  "rooms",
  "schedule",
  "decision_center",
  "unscheduled",
  "analytics",
  "history",
  "decision_logs",
  "settings"
];

const getInitialTab = (): string => {
  if (typeof window === "undefined") return "dashboard";
  const path = window.location.pathname.replace(/^\/+|\/+$/g, "");
  if (VALID_TABS.includes(path)) {
    return path;
  }
  return "dashboard";
};

export function App() {
  // Directly open the application with active profile (Admin by default, switchable via header)
  const [currentUser, setCurrentUser] = useState<User>({
    id: "u1",
    name: "Dr. Alexander Wright",
    email: "admin@hospital.org",
    role: "Admin"
  });

  const [currentTab, setCurrentTab] = useState<string>(getInitialTab);

  // Sync route on mount and handle browser back/forward buttons
  useEffect(() => {
    const rawPath = window.location.pathname;
    if (rawPath === "" || rawPath === "/" || rawPath === "/login") {
      window.history.replaceState(null, "", "/dashboard");
      setCurrentTab("dashboard");
    }

    const handlePopState = () => {
      const tab = getInitialTab();
      setCurrentTab(tab);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    const targetPath = `/${tab}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, "", targetPath);
    }
  };

  // Core Data
  const [surgeries, setSurgeries] = useState<Surgery[]>([]);
  const [rooms, setRooms] = useState<OperatingRoom[]>([]);
  const [scheduled, setScheduled] = useState<ScheduledSurgery[]>([]);
  const [decisionLogs, setDecisionLogs] = useState<DecisionLog[]>([]);
  const [algorithmSteps, setAlgorithmSteps] = useState<AlgorithmStep[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [runs, setRuns] = useState<SchedulingRun[]>([]);
  const [explanations, setExplanations] = useState<Record<string, any>>({});

  // Modals & Inspection
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);
  const [selectedSurgeryForModal, setSelectedSurgeryForModal] = useState<any>(null);
  const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(true);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);

  // Settings
  const [weights, setWeights] = useState({
    medical_priority: 0.40,
    urgency: 0.25,
    deadline_urgency: 0.25,
    waiting_time: 0.10
  });
  const [intervalMinutes, setIntervalMinutes] = useState<number>(30);

  const showToast = (message: string, type: "success" | "info" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Initial Data Load
  const loadData = async () => {
    try {
      const [surgeriesData, roomsData, schedulesData, logsData, runsData, analyticsData] = await Promise.all([
        api.getSurgeries().catch(() => []),
        api.getRooms().catch(() => []),
        api.getSchedule().catch(() => []),
        api.getSchedulingLogs().catch(() => []),
        api.getSchedulingRuns().catch(() => []),
        api.getAnalytics().catch(() => null)
      ]);

      setSurgeries(surgeriesData);
      setRooms(roomsData);
      setScheduled(schedulesData);
      setDecisionLogs(logsData);
      setRuns(runsData);
      if (analyticsData) setAnalytics(analyticsData);
    } catch (err: any) {
      console.error("Failed to load initial hospital data:", err);
    } finally {
      setIsLoadingInitial(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Run Real Python Scheduler
  const executeScheduler = async () => {
    const result: ScheduleRunResult = await api.runScheduler({
      weights,
      interval_minutes: intervalMinutes,
      run_name: `Optimization Run #${Math.floor(Date.now() / 1000).toString().slice(-4)}`
    });

    setScheduled(result.scheduled);
    setDecisionLogs(result.decision_logs);
    setAlgorithmSteps(result.algorithm_steps);
    setAnalytics(result.analytics);
    if (result.explanations) setExplanations(result.explanations);

    // Refresh surgeries and runs
    const [updatedSurgeries, updatedRuns] = await Promise.all([
      api.getSurgeries(),
      api.getSchedulingRuns()
    ]);
    setSurgeries(updatedSurgeries);
    setRuns(updatedRuns);

    showToast(`Scheduler completed: ${result.scheduled.length} scheduled, ${result.unscheduled.length} unscheduled`);
    return result;
  };

  // Reset Schedule
  const handleReset = async () => {
    try {
      await api.resetScheduler();
      setScheduled([]);
      const updatedSurgeries = await api.getSurgeries();
      setSurgeries(updatedSurgeries);
      showToast("Operating room schedule reset to pending state.", "info");
    } catch (err: any) {
      showToast(err.message || "Failed to reset", "error");
    }
  };

  // Load Demo Data
  const handleLoadDemo = async () => {
    try {
      await api.loadDemoData();
      await loadData();
      showToast("Demo data reloaded: 16 surgeries and 4 OR suites.");
    } catch (err: any) {
      showToast(err.message || "Failed to load demo data", "error");
    }
  };

  // Add Surgery
  const handleAddSurgery = async (newSurg: Partial<Surgery>) => {
    const res = await api.createSurgery(newSurg);
    const updated = await api.getSurgeries();
    setSurgeries(updated);
    showToast(`Surgery ${newSurg.surgery_name} created successfully.`);
    return res;
  };

  // Update Surgery
  const handleUpdateSurgery = async (id: string, s: Partial<Surgery>) => {
    const res = await api.updateSurgery(id, s);
    const updated = await api.getSurgeries();
    setSurgeries(updated);
    showToast("Surgery updated.");
    return res;
  };

  // Delete Surgery
  const handleDeleteSurgery = async (id: string) => {
    await api.deleteSurgery(id);
    const updated = await api.getSurgeries();
    setSurgeries(updated);
    showToast("Surgery removed from database.");
  };

  // Add Room
  const handleAddRoom = async (newRoom: Partial<OperatingRoom>) => {
    const res = await api.createRoom(newRoom);
    const updated = await api.getRooms();
    setRooms(updated);
    showToast(`Operating Room ${newRoom.room_name} added.`);
    return res;
  };

  // Delete Room
  const handleDeleteRoom = async (id: string) => {
    await api.deleteRoom(id);
    const updated = await api.getRooms();
    setRooms(updated);
    showToast("Operating Room deleted.");
  };

  // Add Unavailability
  const handleAddUnavailability = async (roomId: string, data: any) => {
    const res = await api.addUnavailability(roomId, data);
    const updated = await api.getRooms();
    setRooms(updated);
    showToast("Maintenance closure scheduled.");
    return res;
  };

  // Save Settings
  const handleSaveWeights = (newWeights: any, newInterval: number) => {
    setWeights(newWeights);
    setIntervalMinutes(newInterval);
    showToast("Algorithm weights & grid updated.");
  };

  const handleRoleChange = (role: UserRole) => {
    let name = "Dr. Alexander Wright";
    let email = "admin@hospital.org";
    let id = "u1";

    if (role === "Scheduler") {
      name = "Nurse Sarah Jenkins";
      email = "scheduler@hospital.org";
      id = "u2";
    } else if (role === "Viewer") {
      name = "Clinical Observer";
      email = "viewer@hospital.org";
      id = "u3";
    }

    const updatedUser: User = { id, name, email, role };
    setCurrentUser(updatedUser);
    showToast(`Active role switched to ${role} (${name})`, "info");
  };

  const unscheduledCount = surgeries.filter((s) => s.status === "Unscheduled").length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl shadow-xl border text-xs font-semibold flex items-center space-x-2 transition-all ${
            notification.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/50 text-emerald-200"
              : notification.type === "error"
              ? "bg-rose-950/90 border-rose-500/50 text-rose-200"
              : "bg-slate-900 border-slate-700 text-slate-200"
          }`}
        >
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        currentUser={currentUser}
        onRoleChange={handleRoleChange}
        onRunSchedulerClick={() => setIsDemoModalOpen(true)}
        onResetClick={handleReset}
        onLoadDemoClick={handleLoadDemo}
        unscheduledCount={unscheduledCount}
        scheduledCount={scheduled.length}
      />

      {/* Page Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoadingInitial ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <span className="text-xs">Loading Smart OR Scheduler Engine...</span>
          </div>
        ) : (
          <>
            {currentTab === "dashboard" && (
              <DashboardView
                surgeries={surgeries}
                rooms={rooms}
                scheduled={scheduled}
                analytics={analytics}
                decisionLogs={decisionLogs}
                onRunDemo={() => setIsDemoModalOpen(true)}
                onNavigateTab={handleTabChange}
                onSelectSurgery={(s) => setSelectedSurgeryForModal(s)}
                currentUser={currentUser}
              />
            )}

            {currentTab === "schedule" && (
              <TimelineScheduleView
                rooms={rooms}
                schedules={scheduled}
                surgeries={surgeries}
                onSelectSurgery={(s) => setSelectedSurgeryForModal(s)}
              />
            )}

            {currentTab === "decision_center" && (
              <DecisionCenterView
                algorithmSteps={algorithmSteps}
                decisionLogs={decisionLogs}
                surgeries={surgeries}
                onSelectSurgery={(s) => setSelectedSurgeryForModal(s)}
                initialTab="steps"
              />
            )}

            {currentTab === "decision_logs" && (
              <DecisionCenterView
                algorithmSteps={algorithmSteps}
                decisionLogs={decisionLogs}
                surgeries={surgeries}
                onSelectSurgery={(s) => setSelectedSurgeryForModal(s)}
                initialTab="logs"
              />
            )}

            {currentTab === "surgeries" && (
              <SurgeriesView
                surgeries={surgeries}
                onAddSurgery={handleAddSurgery}
                onUpdateSurgery={handleUpdateSurgery}
                onDeleteSurgery={handleDeleteSurgery}
                onSelectSurgery={(s) => setSelectedSurgeryForModal(s)}
                currentUser={currentUser}
              />
            )}

            {currentTab === "rooms" && (
              <RoomsView
                rooms={rooms}
                onAddRoom={handleAddRoom}
                onUpdateRoom={async () => {}}
                onDeleteRoom={handleDeleteRoom}
                onAddUnavailability={handleAddUnavailability}
                currentUser={currentUser}
              />
            )}

            {currentTab === "unscheduled" && (
              <UnscheduledView
                unscheduled={surgeries}
                onSelectSurgery={(s) => setSelectedSurgeryForModal(s)}
                onNavigateTab={handleTabChange}
              />
            )}

            {currentTab === "analytics" && (
              <AnalyticsView
                analytics={analytics}
                scheduled={scheduled}
                surgeries={surgeries}
              />
            )}

            {currentTab === "history" && (
              <RunHistoryView
                runs={runs}
                onRerun={() => setIsDemoModalOpen(true)}
              />
            )}

            {currentTab === "settings" && (
              <SettingsView
                weights={weights}
                onSaveWeights={handleSaveWeights}
                intervalMinutes={intervalMinutes}
              />
            )}
          </>
        )}
      </main>

      {/* Visual Multi-Step Scheduling Run Modal */}
      <RunDemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onComplete={() => handleTabChange("schedule")}
        executeSchedulerPromise={executeScheduler}
      />

      {/* 5-Question Explainable Decision Modal */}
      {selectedSurgeryForModal && (
        <DecisionModal
          isOpen={!!selectedSurgeryForModal}
          onClose={() => setSelectedSurgeryForModal(null)}
          surgery={selectedSurgeryForModal}
          decisionLog={
            explanations[selectedSurgeryForModal.id || selectedSurgeryForModal.surgery_id] ||
            decisionLogs.find(
              (l) => l.surgery_id === (selectedSurgeryForModal.id || selectedSurgeryForModal.surgery_id)
            )
          }
        />
      )}
    </div>
  );
}
export default App;

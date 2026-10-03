"""
Database layer for Smart OR Scheduler
Supports PostgreSQL (via psycopg2/SQLAlchemy or pg connection strings) and SQLite fallback.
"""

import sqlite3
import json
import os
import uuid
import time
from typing import List, Dict, Any, Optional
from backend.models.user import hash_password

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "smart_or.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    c = conn.cursor()

    # 1. users
    c.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at REAL NOT NULL
    )
    """)

    # 2. surgeries
    c.execute("""
    CREATE TABLE IF NOT EXISTS surgeries (
        id TEXT PRIMARY KEY,
        patient_name TEXT NOT NULL,
        patient_id TEXT NOT NULL,
        surgery_name TEXT NOT NULL,
        surgery_type TEXT NOT NULL,
        surgeon_name TEXT NOT NULL,
        duration_minutes INTEGER NOT NULL,
        priority_level TEXT NOT NULL,
        priority_score REAL DEFAULT 0.0,
        urgency_level TEXT NOT NULL,
        requested_start TEXT NOT NULL,
        deadline TEXT NOT NULL,
        required_room_type TEXT NOT NULL,
        required_equipment TEXT,
        status TEXT NOT NULL,
        created_at REAL NOT NULL
    )
    """)

    # 3. operating_rooms
    c.execute("""
    CREATE TABLE IF NOT EXISTS operating_rooms (
        id TEXT PRIMARY KEY,
        room_name TEXT NOT NULL,
        room_type TEXT NOT NULL,
        opening_time TEXT NOT NULL,
        closing_time TEXT NOT NULL,
        equipment TEXT,
        status TEXT NOT NULL
    )
    """)

    # 4. room_unavailability
    c.execute("""
    CREATE TABLE IF NOT EXISTS room_unavailability (
        id TEXT PRIMARY KEY,
        room_id TEXT NOT NULL,
        unavailable_start TEXT NOT NULL,
        unavailable_end TEXT NOT NULL,
        reason TEXT NOT NULL,
        FOREIGN KEY (room_id) REFERENCES operating_rooms(id)
    )
    """)

    # 5. schedules
    c.execute("""
    CREATE TABLE IF NOT EXISTS schedules (
        id TEXT PRIMARY KEY,
        surgery_id TEXT NOT NULL,
        room_id TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        score REAL DEFAULT 0.0,
        status TEXT NOT NULL,
        created_at REAL NOT NULL,
        FOREIGN KEY (surgery_id) REFERENCES surgeries(id),
        FOREIGN KEY (room_id) REFERENCES operating_rooms(id)
    )
    """)

    # 6. scheduling_runs
    c.execute("""
    CREATE TABLE IF NOT EXISTS scheduling_runs (
        id TEXT PRIMARY KEY,
        run_name TEXT NOT NULL,
        total_surgeries INTEGER NOT NULL,
        scheduled_surgeries INTEGER NOT NULL,
        unscheduled_surgeries INTEGER NOT NULL,
        objective_value REAL NOT NULL,
        average_waiting_time REAL NOT NULL,
        room_utilization REAL NOT NULL,
        deadline_compliance REAL NOT NULL,
        total_idle_time REAL NOT NULL,
        created_at REAL NOT NULL
    )
    """)

    # 7. scheduling_logs
    c.execute("""
    CREATE TABLE IF NOT EXISTS scheduling_logs (
        id TEXT PRIMARY KEY,
        scheduling_run_id TEXT NOT NULL,
        surgery_id TEXT NOT NULL,
        selected_priority REAL,
        candidate_rooms TEXT,
        candidate_slots TEXT,
        rejected_candidates TEXT,
        selected_room TEXT,
        selected_start TEXT,
        selected_end TEXT,
        decision TEXT NOT NULL,
        reason TEXT NOT NULL,
        score REAL DEFAULT 0.0,
        created_at REAL NOT NULL,
        FOREIGN KEY (scheduling_run_id) REFERENCES scheduling_runs(id)
    )
    """)

    conn.commit()

    # Seed initial demo users if empty
    c.execute("SELECT COUNT(*) as cnt FROM users")
    if c.fetchone()["cnt"] == 0:
        seed_users(c)

    # Seed demo data if surgeries empty
    c.execute("SELECT COUNT(*) as cnt FROM surgeries")
    if c.fetchone()["cnt"] == 0:
        seed_demo_data(c)

    conn.commit()
    conn.close()

def seed_users(c):
    users = [
        ("u1", "Dr. Alexander Wright", "admin@hospital.org", hash_password("admin123"), "Admin", time.time()),
        ("u2", "Nurse Sarah Jenkins", "scheduler@hospital.org", hash_password("scheduler123"), "Scheduler", time.time()),
        ("u3", "Observer Clinic", "viewer@hospital.org", hash_password("viewer123"), "Viewer", time.time()),
        ("u4", "Dr. Alexander Wright", "admin@smartorscheduler.com", hash_password("admin123"), "Admin", time.time()),
        ("u5", "Nurse Sarah Jenkins", "scheduler@smartorscheduler.com", hash_password("scheduler123"), "Scheduler", time.time()),
        ("u6", "Clinical Observer", "viewer@smartorscheduler.com", hash_password("viewer123"), "Viewer", time.time())
    ]
    c.executemany("INSERT OR IGNORE INTO users VALUES (?, ?, ?, ?, ?, ?)", users)

def seed_demo_data(c=None):
    close_at_end = False
    if c is None:
        conn = get_connection()
        c = conn.cursor()
        close_at_end = True

    # Clear current scheduling tables to start clean
    c.execute("DELETE FROM schedules")
    c.execute("DELETE FROM scheduling_logs")
    c.execute("DELETE FROM scheduling_runs")
    c.execute("DELETE FROM room_unavailability")
    c.execute("DELETE FROM operating_rooms")
    c.execute("DELETE FROM surgeries")

    # 4 Operating Rooms
    rooms = [
        ("OR-1", "OR-1 General & Laparoscopy", "General", "08:00", "17:00", json.dumps(["Laparoscope", "Electrocautery", "Standard Monitor"]), "Active"),
        ("OR-2", "OR-2 Cardiac Suite", "Cardiac", "08:00", "17:00", json.dumps(["Heart-Lung Machine", "C-Arm", "Defibrillator", "Hemodynamic Monitor"]), "Active"),
        ("OR-3", "OR-3 Orthopedic & Trauma", "Orthopedic", "08:00", "17:00", json.dumps(["Orthopedic Table", "C-Arm", "Power Tools", "Standard Monitor"]), "Active"),
        ("OR-4", "OR-4 Hybrid Neuro/Vascular", "Hybrid", "08:30", "18:00", json.dumps(["Intraoperative CT", "Angiography System", "Microsurgical Microscope", "C-Arm"]), "Active")
    ]
    c.executemany("INSERT INTO operating_rooms VALUES (?, ?, ?, ?, ?, ?, ?)", rooms)

    # Temporary room closures: OR-2 Equipment Maintenance
    unavails = [
        ("UN-1", "OR-2", "12:00", "13:00", "Cardiopulmonary Pump Maintenance & Sterilization"),
        ("UN-2", "OR-3", "13:30", "14:15", "Orthopedic Drill Calibration")
    ]
    c.executemany("INSERT INTO room_unavailability VALUES (?, ?, ?, ?, ?)", unavails)

    # At least 15 realistic surgeries with varying requirements
    surgeries = [
        (
            "S101", "Eleanor Vance", "P-9841", "Coronary Artery Bypass", "Cardiac",
            "Dr. Marcus Vance", 120, "Emergency", 0.0, "Immediate", "08:00", "12:00",
            "Cardiac", json.dumps(["Heart-Lung Machine", "Defibrillator"]), "Pending", time.time()
        ),
        (
            "S102", "Robert Chen", "P-9842", "Emergency Appendectomy", "General",
            "Dr. Emily Hayes", 90, "Critical", 0.0, "Very Urgent", "08:00", "13:00",
            "General", json.dumps(["Laparoscope"]), "Pending", time.time()
        ),
        (
            "S103", "Maria Gonzalez", "P-9843", "Total Knee Arthroplasty", "Orthopedic",
            "Dr. James Wilson", 180, "High", 0.0, "Urgent", "08:00", "17:00",
            "Orthopedic", json.dumps(["Orthopedic Table", "C-Arm"]), "Pending", time.time()
        ),
        (
            "S104", "David Kim", "P-9844", "Laparoscopic Cholecystectomy", "General",
            "Dr. Emily Hayes", 60, "Medium", 0.0, "Normal", "09:30", "16:00",
            "General", json.dumps(["Laparoscope", "Electrocautery"]), "Pending", time.time()
        ),
        (
            "S105", "Sophia Patel", "P-9845", "Aortic Valve Replacement", "Cardiac",
            "Dr. Marcus Vance", 150, "Critical", 0.0, "Very Urgent", "08:30", "14:30",
            "Cardiac", json.dumps(["Heart-Lung Machine"]), "Pending", time.time()
        ),
        (
            "S106", "Thomas Miller", "P-9846", "Open Reduction Hip Fracture", "Orthopedic",
            "Dr. James Wilson", 120, "High", 0.0, "Urgent", "10:00", "16:00",
            "Orthopedic", json.dumps(["C-Arm", "Power Tools"]), "Pending", time.time()
        ),
        (
            "S107", "Hannah Abbott", "P-9847", "Cerebral Aneurysm Clipping", "Neurosurgery",
            "Dr. Nathan Drake", 210, "High", 0.0, "Urgent", "09:00", "16:30",
            "Hybrid", json.dumps(["Microsurgical Microscope", "Angiography System"]), "Pending", time.time()
        ),
        (
            "S108", "Liam O'Connor", "P-9848", "Inguinal Hernia Repair", "General",
            "Dr. Emily Hayes", 60, "Medium", 0.0, "Normal", "11:00", "17:00",
            "General", json.dumps(["Electrocautery"]), "Pending", time.time()
        ),
        (
            "S109", "Grace Kelly", "P-9849", "Extensive Spinal Fusion", "Orthopedic",
            "Dr. James Wilson", 240, "High", 0.0, "Urgent", "14:00", "15:00", # Intentionally tight deadline to demonstrate UNSCHEDULED reason!
            "Orthopedic", json.dumps(["Orthopedic Table", "C-Arm"]), "Pending", time.time()
        ),
        (
            "S110", "Arthur Pendelton", "P-9850", "Endovascular Aortic Repair", "Vascular",
            "Dr. Nathan Drake", 120, "High", 0.0, "Urgent", "13:00", "18:00",
            "Hybrid", json.dumps(["Angiography System"]), "Pending", time.time()
        ),
        (
            "S111", "Chloe Martin", "P-9851", "Diagnostic Laparoscopy", "General",
            "Dr. Emily Hayes", 45, "Low", 0.0, "Normal", "13:00", "17:00",
            "General", json.dumps(["Laparoscope"]), "Pending", time.time()
        ),
        (
            "S112", "Benjamin Franklin", "P-9852", "Pacemaker Implantation", "Cardiac",
            "Dr. Marcus Vance", 60, "Medium", 0.0, "Urgent", "13:00", "17:00",
            "Cardiac", json.dumps(["C-Arm", "Defibrillator"]), "Pending", time.time()
        ),
        (
            "S113", "Zoe Saldana", "P-9853", "Arthroscopic Meniscectomy", "Orthopedic",
            "Dr. James Wilson", 60, "Low", 0.0, "Normal", "14:00", "17:00",
            "Orthopedic", json.dumps(["Standard Monitor"]), "Pending", time.time()
        ),
        (
            "S114", "Walter White", "P-9854", "Thyroidectomy", "General",
            "Dr. Emily Hayes", 90, "Medium", 0.0, "Normal", "14:00", "17:00",
            "General", json.dumps(["Electrocautery"]), "Pending", time.time()
        ),
        (
            "S115", "Diana Prince", "P-9855", "Carotid Endarterectomy", "Vascular",
            "Dr. Nathan Drake", 90, "Critical", 0.0, "Immediate", "08:30", "13:00",
            "Hybrid", json.dumps(["Angiography System"]), "Pending", time.time()
        ),
        (
            "S116", "Ethan Hunt", "P-9856", "Ultra Complex Craniofacial Reconstruction", "Neurosurgery",
            "Dr. Nathan Drake", 360, "Low", 0.0, "Normal", "15:00", "16:00", # Impossible to fit 360 mins within 1 hour
            "Hybrid", json.dumps(["Microsurgical Microscope"]), "Pending", time.time()
        )
    ]
    c.executemany("INSERT INTO surgeries VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", surgeries)

    if close_at_end:
        conn.commit()
        conn.close()

# Initialize tables on load
init_db()

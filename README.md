# Smart OR Scheduler
### AI-Assisted Operating Room Scheduling & Optimization System

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![Flask](https://img.shields.io/badge/backend-Flask%20REST%20API-teal.svg)](https://flask.palletsprojects.com/)
[![PostgreSQL](https://img.shields.io/badge/database-PostgreSQL%20%2F%20SQLite-indigo.svg)](https://www.postgresql.org/)
[![React 19](https://img.shields.io/badge/frontend-React%20%2B%20TailwindCSS-cyan.svg)](https://react.dev/)

---

## 1. Project Overview
**Smart OR Scheduler** is an algorithm-focused hospital operating room scheduling and optimization prototype designed for clinical administrative efficiency. It solves the critical healthcare logistical problem:

> *"Assign incoming surgeries to operating rooms and continuous time slots while respecting surgery duration, medical priorities, strict deadlines, surgeon availability, room compatibility, specialized equipment, and facility closures."*

The core scheduling engine is implemented in **Python**, utilizing **Priority Queue (heapq)**, **Greedy Optimization**, and **duration-aware Job Sequencing** algorithms. All decisions are fully explainable, answering:
- **Why this surgery?**
- **Why this room?**
- **Why this time?**
- **Why were other rooms/slots rejected?**
- **Why was a surgery left unscheduled?**

---

## 2. Architecture & Tech Stack

```
   ┌────────────────────────────────────────────────────────┐
   │                  Modern React UI                       │
   │  (Timeline Grid, Decision Center, Diagnostics, KPIs)   │
   └───────────────────────────┬────────────────────────────┘
                               │ HTTP / REST API
   ┌───────────────────────────▼────────────────────────────┐
   │                  Flask REST API                        │
   │      (Auth, Surgeries, Rooms, Runs, Logs, Analytics)   │
   └───────────────────────────┬────────────────────────────┘
                               │
   ┌───────────────────────────▼────────────────────────────┐
   │             Python Scheduling Engine                   │
   │  ┌─────────────────┐ ┌────────────────┐ ┌───────────┐  │
   │  │ Priority Queue  │ │ Job Sequencing │ │  Greedy   │  │
   │  │ (Max Heap/heapq)│ │ (Contiguous)   │ │ Scoring   │  │
   │  └─────────────────┘ └────────────────┘ └───────────┘  │
   └───────────────────────────┬────────────────────────────┘
                               │
   ┌───────────────────────────▼────────────────────────────┐
   │               PostgreSQL Database                      │
   │ (Surgeries, Rooms, Unavailabilities, Runs, Logs, Users)│
   └────────────────────────────────────────────────────────┘
```

- **Core Algorithm Engine**: Python 3 (`heapq`, Job Sequencing interval logic, 8 hard constraints, composite scoring, objective function).
- **REST API Backend**: Flask (with blueprints for Auth, Surgeries, Rooms, Schedule, and Analytics).
- **Database**: PostgreSQL (connection string via `DATABASE_URL` with automatic local SQLite fallback).
- **Frontend Dashboard**: React 19, TypeScript, TailwindCSS v4, Lucide Icons.

---

## 3. Core Algorithms Explained

### A. Priority Queue (Python `heapq`)
Surgeries enter a max-priority queue ordered by their composite **Priority Score**:
$$\text{Priority Score} = (\text{Medical Priority} \times 40\%) + (\text{Urgency} \times 25\%) + (\text{Deadline Urgency} \times 25\%) + (\text{Waiting Factor} \times 10\%)$$
- **Medical Priority Levels**: Emergency (5), Critical (4), High (3), Medium (2), Low (1).
- **Urgency Levels**: Immediate (5), Very Urgent (4), Urgent (3), Normal (1).
- **Deadline Urgency**: Normalized 1-5 inversely proportional to remaining day slack.
- **Waiting Factor**: Normalized 1-4 based on prior queue wait or requested early slot.
- Configurable weights via the UI Settings panel.

### B. Job Sequencing Algorithm (Contiguous Duration)
Surgeries require uninterrupted blocks (e.g. 90 minutes cannot be split into 45m + 45m).
- The algorithm models each surgery as a continuous multi-unit job over a discrete grid (15-min or 30-min increments).
- Computes non-overlapping intervals within room working hours (e.g., 08:00 - 17:00), automatically masking out maintenance closures and already committed surgeries.

### C. Greedy Optimization Strategy
Following the extraction of the top-priority case from the queue:
1. Filter compatible rooms matching required specialty (e.g., Cardiac, Orthopedic, Hybrid) and equipment.
2. Generate all feasible candidate continuous time slots.
3. Compute **Candidate Assignment Score**:
$$\text{Score} = \text{Priority Benefit} + \text{Deadline Buffer} + \text{Match Bonus} - \text{Idle Gap Cost} - \text{Wait Delay Cost} - \text{Late Penalty}$$
4. Greedily commit the highest-scoring candidate (earliest feasible minimal-idle slot) and immediately update room availability.

### D. Hard Constraints Enforced
1. **Constraint 1**: No overlapping surgeries in one room.
2. **Constraint 2**: Surgery must fit completely within room opening and closing hours.
3. **Constraint 3**: Full surgery duration accommodated contiguously.
4. **Constraint 4**: Surgery must finish prior to deadline.
5. **Constraint 5**: Operating room type matches surgery requirement.
6. **Constraint 6**: Required sterilized equipment must be present.
7. **Constraint 7**: Temporary room closures / maintenance respected.
8. **Constraint 8**: Exclusive shared resources (e.g. specialized C-Arm) cannot conflict.

---

## 4. Database Schema (PostgreSQL)

```sql
-- 1. Users
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL, -- 'Admin', 'Scheduler', 'Viewer'
    created_at REAL NOT NULL
);

-- 2. Surgeries
CREATE TABLE surgeries (
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
    status TEXT NOT NULL, -- 'Pending', 'Scheduled', 'Unscheduled'
    created_at REAL NOT NULL
);

-- 3. Operating Rooms
CREATE TABLE operating_rooms (
    id TEXT PRIMARY KEY,
    room_name TEXT NOT NULL,
    room_type TEXT NOT NULL,
    opening_time TEXT NOT NULL,
    closing_time TEXT NOT NULL,
    equipment TEXT,
    status TEXT NOT NULL
);

-- 4. Room Unavailability
CREATE TABLE room_unavailability (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL REFERENCES operating_rooms(id),
    unavailable_start TEXT NOT NULL,
    unavailable_end TEXT NOT NULL,
    reason TEXT NOT NULL
);

-- 5. Schedules
CREATE TABLE schedules (
    id TEXT PRIMARY KEY,
    surgery_id TEXT NOT NULL REFERENCES surgeries(id),
    room_id TEXT NOT NULL REFERENCES operating_rooms(id),
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    score REAL DEFAULT 0.0,
    status TEXT NOT NULL,
    created_at REAL NOT NULL
);

-- 6. Scheduling Runs
CREATE TABLE scheduling_runs (
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
);

-- 7. Scheduling Decision Logs
CREATE TABLE scheduling_logs (
    id TEXT PRIMARY KEY,
    scheduling_run_id TEXT NOT NULL REFERENCES scheduling_runs(id),
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
    created_at REAL NOT NULL
);
```

---

## 5. REST API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate with email & password |
| `GET` | `/api/surgeries` | List all surgeries in the pool |
| `POST` | `/api/surgeries` | Create a new surgery with validations |
| `PUT` | `/api/surgeries/<id>` | Update an existing surgery |
| `DELETE` | `/api/surgeries/<id>` | Delete surgery |
| `GET` | `/api/rooms` | List operating rooms & closures |
| `POST` | `/api/rooms` | Register a new operating room suite |
| `POST` | `/api/rooms/<id>/unavailability` | Schedule maintenance closure window |
| `POST` | `/api/schedule/run` | Execute Python Priority Queue + Greedy Engine |
| `POST` | `/api/schedule/reset` | Reset schedule to pending state |
| `GET` | `/api/schedule` | Retrieve confirmed room timelines |
| `GET` | `/api/scheduling-logs` | Retrieve decision logs & candidate rejections |
| `GET` | `/api/scheduling-runs` | Retrieve historical optimization runs |
| `GET` | `/api/analytics` | Retrieve KPI metrics and objective function |
| `POST` | `/api/demo-data` | Reload benchmark dataset (16 cases, 4 ORs) |
| `GET` | `/api/health` | Service health status |

---

## 6. Installation & Local Execution

### Requirements
- Python 3.10+
- Node.js 18+ & npm

### Running the App (AI Studio / Full-Stack Express)
```bash
# Install node dependencies
npm install

# Run the dev server (hosts API bridge & React SPA on port 3000)
npm run dev
```

### Running Flask Backend Standalone
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install requirements
pip install -r backend/requirements.txt

# Run Flask on port 5000
python3 backend/app.py
```

### Running the Python Unit Tests
```bash
python3 -m unittest discover backend/tests
```
Runs 12 unit tests covering Priority Queue, Job Sequencing, 8 Hard Constraints, and Greedy Scheduling.

---

## 7. Cloud Deployment (Docker & Managed PostgreSQL)

### Environment Variables
```env
PORT=3000
DATABASE_URL=postgresql://user:password@cloud-sql-host:5432/smart_or_db
SECRET_KEY=your-production-secret-key-32chars
NODE_ENV=production
```

---

## 8. Project Demonstration Steps
1. **Access Login**:
   - Click **Admin Demo** (`admin@hospital.org`) or **Scheduler Demo** to enter.
2. **Dashboard**:
   - Review 8 real-time KPI cards, priority distributions, and room capacity.
3. **Run One-Click Optimization**:
   - Click **RUN ONE-CLICK OPTIMIZATION DEMO** or **Run Scheduler**.
   - Watch the animated 9-step progress bar (Loading &rarr; Priorities &rarr; Priority Queue &rarr; Room compatibility &rarr; Job Sequencing &rarr; Constraints &rarr; Greedy selection &rarr; Storing logs &rarr; Objective function).
4. **Timeline Schedule**:
   - Inspect the horizontal time grid (08:00 - 18:00) with color-coded surgeries and maintenance closure windows.
   - Click any surgery block to open the **5-Question Explainable Answer Card**.
5. **Algorithm Decision Center**:
   - View the heap extraction order (#1 S101, #2 S105...).
   - Step through room candidate evaluations and slot candidate rankings.
6. **Unscheduled Cases**:
   - Inspect surgeries that could not fit within deadlines (e.g. S109 or S116) and view their suggested next slots.
7. **Analytics**:
   - Review the mathematical decomposition of the Objective Function.

import express, { Request, Response } from "express";
import { createServer as createViteServer } from "vite";
import { execFile } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);
const isProd = process.env.NODE_ENV === "production";

app.use(express.json());

// Helper function to call python API handler
function runPythonApi(action: string, args: string[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.resolve(__dirname, "backend/api_handler.py");
    execFile("python3", [scriptPath, action, ...args], { maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) {
        try {
          const parsed = JSON.parse(stdout.trim());
          return reject(parsed);
        } catch {
          return reject(new Error(stderr || err.message));
        }
      }
      try {
        const parsed = JSON.parse(stdout.trim());
        resolve(parsed);
      } catch (parseErr) {
        console.error("Failed to parse Python output:", stdout, stderr);
        reject(new Error("Invalid response format from Python engine"));
      }
    });
  });
}

// REST API Endpoints

// 1. Health
app.get("/api/health", async (req: Request, res: Response) => {
  try {
    const data = await runPythonApi("health");
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Auth Login
app.post("/api/auth/login", async (req: Request, res: Response) => {
  try {
    const data = await runPythonApi("login", [JSON.stringify(req.body)]);
    res.json(data);
  } catch (err: any) {
    res.status(401).json({ success: false, message: err.message || err.error || "Invalid login details", error: err.error || err.message || "Invalid login details" });
  }
});

// 3. Demo Data
app.post("/api/demo-data", async (req: Request, res: Response) => {
  try {
    const data = await runPythonApi("seed_demo");
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Surgeries
app.get("/api/surgeries", async (req: Request, res: Response) => {
  try {
    const data = await runPythonApi("get_surgeries");
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/surgeries/:id", async (req: Request, res: Response) => {
  try {
    const data = await runPythonApi("get_surgery", [req.params.id]);
    res.json(data);
  } catch (err: any) {
    res.status(404).json({ error: err.error || "Surgery not found" });
  }
});

app.post("/api/surgeries", async (req: Request, res: Response) => {
  try {
    const data = await runPythonApi("create_surgery", [JSON.stringify(req.body)]);
    res.status(201).json(data);
  } catch (err: any) {
    res.status(400).json({ error: err.error || "Invalid surgery input" });
  }
});

app.put("/api/surgeries/:id", async (req: Request, res: Response) => {
  try {
    const data = await runPythonApi("update_surgery", [req.params.id, JSON.stringify(req.body)]);
    res.json(data);
  } catch (err: any) {
    res.status(400).json({ error: err.error || "Failed to update surgery" });
  }
});

app.delete("/api/surgeries/:id", async (req: Request, res: Response) => {
  try {
    const data = await runPythonApi("delete_surgery", [req.params.id]);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Operating Rooms
app.get("/api/rooms", async (req: Request, res: Response) => {
  try {
    const data = await runPythonApi("get_rooms");
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/rooms", async (req: Request, res: Response) => {
  try {
    const data = await runPythonApi("create_room", [JSON.stringify(req.body)]);
    res.status(201).json(data);
  } catch (err: any) {
    res.status(400).json({ error: err.error || "Invalid room input" });
  }
});

app.put("/api/rooms/:id", async (req: Request, res: Response) => {
  try {
    const data = await runPythonApi("update_room", [req.params.id, JSON.stringify(req.body)]);
    res.json(data);
  } catch (err: any) {
    res.status(400).json({ error: err.error || "Failed to update room" });
  }
});

app.delete("/api/rooms/:id", async (req: Request, res: Response) => {
  try {
    const data = await runPythonApi("delete_room", [req.params.id]);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/rooms/:id/unavailability", async (req: Request, res: Response) => {
  try {
    const data = await runPythonApi("add_unavailability", [req.params.id, JSON.stringify(req.body)]);
    res.status(201).json(data);
  } catch (err: any) {
    res.status(400).json({ error: err.error || "Failed to add unavailability" });
  }
});

// 6. Schedule Engine Execution (Python Priority Queue + Job Sequencing + Greedy)
app.post("/api/schedule/run", async (req: Request, res: Response) => {
  try {
    const data = await runPythonApi("run_scheduler", [JSON.stringify(req.body)]);
    res.json(data);
  } catch (err: any) {
    console.error("Scheduler execution error:", err);
    res.status(500).json({ error: err.message || "Algorithm execution failed" });
  }
});

app.post("/api/schedule/reset", async (req: Request, res: Response) => {
  try {
    const data = await runPythonApi("reset_scheduler");
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/schedule", async (req: Request, res: Response) => {
  try {
    const data = await runPythonApi("get_schedules");
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/scheduling-logs", async (req: Request, res: Response) => {
  try {
    const data = await runPythonApi("get_logs");
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/scheduling-runs", async (req: Request, res: Response) => {
  try {
    const data = await runPythonApi("get_runs");
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Analytics
app.get("/api/analytics", async (req: Request, res: Response) => {
  try {
    const data = await runPythonApi("get_analytics");
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Mount Vite or serve static
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Smart OR Scheduler running at http://0.0.0.0:${PORT}`);
  });
}

startServer();

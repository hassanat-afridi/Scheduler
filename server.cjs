// server.cjs
const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// routes
app.get("/", (_req, res) => res.send("Employee Scheduler API is running..."));
app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.get("/api/employees", (_req, res) =>
  res.json([
    { id: "e1", name: "Aisha Khan", role: "Cashier" },
    { id: "e2", name: "Diego Lopez", role: "Barista" },
    { id: "e3", name: "Mina Patel", role: "Manager" },
  ])
);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ API running on http://localhost:${PORT}`);
});

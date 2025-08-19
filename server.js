// server.js
const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors({ 
  origin: ["http://localhost:5173", "http://localhost:5174"], 
  credentials: true 
}));

// In-memory data storage (replace with database later)
let employees = [
  { id: "e1", name: "Aisha Khan", role: "Cashier", email: "aisha@example.com" },
  { id: "e2", name: "Diego Lopez", role: "Barista", email: "diego@example.com" },
  { id: "e3", name: "Mina Patel", role: "Manager", email: "mina@example.com" },
  { id: "e4", name: "James Wilson", role: "Cashier", email: "james@example.com" },
  { id: "e5", name: "Sarah Chen", role: "Barista", email: "sarah@example.com" }
];

let schedules = [
  {
    id: "s1",
    employeeId: "e1",
    date: "2024-01-15",
    startTime: "09:00",
    endTime: "17:00",
    role: "Cashier",
    status: "confirmed"
  },
  {
    id: "s2",
    employeeId: "e2",
    date: "2024-01-15",
    startTime: "08:00",
    endTime: "16:00",
    role: "Barista",
    status: "confirmed"
  }
];

let shifts = [
  { id: "shift1", name: "Morning", startTime: "06:00", endTime: "14:00" },
  { id: "shift2", name: "Afternoon", startTime: "14:00", endTime: "22:00" },
  { id: "shift3", name: "Night", startTime: "22:00", endTime: "06:00" }
];

// Utility functions
const generateId = () => Math.random().toString(36).substr(2, 9);
const validateTime = (time) => /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
const validateDate = (date) => /^\d{4}-\d{2}-\d{2}$/.test(date);

// Enhanced time comparison for overnight shifts
const isTimeOverlap = (start1, end1, start2, end2) => {
  // Convert times to minutes for easier comparison
  const toMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  const s1 = toMinutes(start1);
  const e1 = toMinutes(end1);
  const s2 = toMinutes(start2);
  const e2 = toMinutes(end2);
  
  // Handle overnight shifts (end time < start time)
  if (e1 < s1) {
    // First shift goes overnight
    if (e2 < s2) {
      // Second shift also goes overnight
      return true; // Both overnight shifts overlap
    } else {
      // Second shift is same-day
      return s2 < e1 || s1 < e2;
    }
  } else if (e2 < s2) {
    // Only second shift goes overnight
    return s1 < e2 || s2 < e1;
  } else {
    // Both shifts are same-day
    return s1 < e2 && s2 < e1;
  }
};

// Routes
app.get("/", (req, res) => res.send("Employee Scheduler API is running..."));
app.get("/api/health", (req, res) => res.json({ ok: true }));

// Employee routes
app.get("/api/employees", (req, res) => {
  res.json(employees);
});

app.post("/api/employees", (req, res) => {
  const { name, role, email } = req.body;
  
  if (!name || !role || !email) {
    return res.status(400).json({ error: "Name, role, and email are required" });
  }
  
  const newEmployee = {
    id: generateId(),
    name,
    role,
    email
  };
  
  employees.push(newEmployee);
  res.status(201).json(newEmployee);
});

app.put("/api/employees/:id", (req, res) => {
  const { id } = req.params;
  const { name, role, email } = req.body;
  
  const employeeIndex = employees.findIndex(e => e.id === id);
  if (employeeIndex === -1) {
    return res.status(404).json({ error: "Employee not found" });
  }
  
  if (!name || !role || !email) {
    return res.status(400).json({ error: "Name, role, and email are required" });
  }
  
  employees[employeeIndex] = {
    ...employees[employeeIndex],
    name,
    role,
    email
  };
  
  res.json(employees[employeeIndex]);
});

app.delete("/api/employees/:id", (req, res) => {
  const { id } = req.params;
  const employeeIndex = employees.findIndex(e => e.id === id);
  
  if (employeeIndex === -1) {
    return res.status(404).json({ error: "Employee not found" });
  }
  
  employees.splice(employeeIndex, 1);
  res.status(204).send();
});

// Schedule routes
app.get("/api/schedules", (req, res) => {
  const { date, employeeId } = req.query;
  let filteredSchedules = [...schedules];
  
  if (date) {
    filteredSchedules = filteredSchedules.filter(s => s.date === date);
  }
  
  if (employeeId) {
    filteredSchedules = filteredSchedules.filter(s => s.employeeId === employeeId);
  }
  
  // Add employee details to schedules
  const schedulesWithDetails = filteredSchedules.map(schedule => {
    const employee = employees.find(e => e.id === schedule.employeeId);
    return {
      ...schedule,
      employeeName: employee ? employee.name : 'Unknown',
      employeeEmail: employee ? employee.email : 'Unknown'
    };
  });
  
  res.json(schedulesWithDetails);
});

app.post("/api/schedules", (req, res) => {
  const { employeeId, date, startTime, endTime, role } = req.body;
  
  // Validation
  if (!employeeId || !date || !startTime || !endTime || !role) {
    return res.status(400).json({ error: "All fields are required" });
  }
  
  if (!validateDate(date)) {
    return res.status(400).json({ error: "Invalid date format (YYYY-MM-DD)" });
  }
  
  if (!validateTime(startTime) || !validateTime(endTime)) {
    return res.status(400).json({ error: "Invalid time format (HH:MM)" });
  }
  
  // Check if employee exists
  const employee = employees.find(e => e.id === employeeId);
  if (!employee) {
    return res.status(404).json({ error: "Employee not found" });
  }
  
  // Check for schedule conflicts using enhanced logic
  const conflictingSchedule = schedules.find(schedule => {
    if (schedule.employeeId !== employeeId || schedule.date !== date) {
      return false;
    }
    
    return isTimeOverlap(
      schedule.startTime, 
      schedule.endTime, 
      startTime, 
      endTime
    );
  });
  
  if (conflictingSchedule) {
    return res.status(409).json({ error: "Schedule conflict detected" });
  }
  
  const newSchedule = {
    id: generateId(),
    employeeId,
    date,
    startTime,
    endTime,
    role,
    status: "pending"
  };
  
  schedules.push(newSchedule);
  res.status(201).json(newSchedule);
});

app.put("/api/schedules/:id", (req, res) => {
  const { id } = req.params;
  const { startTime, endTime, status } = req.body;
  
  const scheduleIndex = schedules.findIndex(s => s.id === id);
  if (scheduleIndex === -1) {
    return res.status(404).json({ error: "Schedule not found" });
  }
  
  if (startTime && !validateTime(startTime)) {
    return res.status(400).json({ error: "Invalid start time format" });
  }
  
  if (endTime && !validateTime(endTime)) {
    return res.status(400).json({ error: "Invalid end time format" });
  }
  
  schedules[scheduleIndex] = {
    ...schedules[scheduleIndex],
    ...(startTime && { startTime }),
    ...(endTime && { endTime }),
    ...(status && { status })
  };
  
  res.json(schedules[scheduleIndex]);
});

app.delete("/api/schedules/:id", (req, res) => {
  const { id } = req.params;
  const scheduleIndex = schedules.findIndex(s => s.id === id);
  
  if (scheduleIndex === -1) {
    return res.status(404).json({ error: "Schedule not found" });
  }
  
  schedules.splice(scheduleIndex, 1);
  res.status(204).send();
});

// Shift routes
app.get("/api/shifts", (req, res) => {
  res.json(shifts);
});

// Dashboard stats
app.get("/api/dashboard", (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const todaySchedules = schedules.filter(s => s.date === today);
  
  const stats = {
    totalEmployees: employees.length,
    totalSchedules: schedules.length,
    todaySchedules: todaySchedules.length,
    pendingSchedules: schedules.filter(s => s.status === 'pending').length,
    confirmedSchedules: schedules.filter(s => s.status === 'confirmed').length,
    roles: employees.reduce((acc, emp) => {
      acc[emp.role] = (acc[emp.role] || 0) + 1;
      return acc;
    }, {})
  };
  
  res.json(stats);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Employee Scheduler API running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/api/dashboard`);
  console.log(`👥 Employees: http://localhost:${PORT}/api/employees`);
  console.log(`📅 Schedules: http://localhost:${PORT}/api/schedules`);
});

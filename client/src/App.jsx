import React, { useState, useEffect } from 'react';
import { Calendar, Users, BarChart3, Plus, Menu, X } from 'lucide-react';
import './App.css';

// Components
import Dashboard from './components/Dashboard';
import Employees from './components/Employees';
import Schedules from './components/Schedules';
import CreateSchedule from './components/CreateSchedule';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Test if server is reachable first
        const healthResponse = await fetch('http://localhost:4000/api/health');
        if (!healthResponse.ok) {
          throw new Error('Server is not reachable');
        }
        
        // Load data concurrently - don't fail if individual endpoints fail
        await Promise.allSettled([
          fetchDashboardData(),
          fetchEmployees(),
          fetchSchedules()
        ]);
        
      } catch (error) {
        console.error('Error initializing app:', error);
        setError('Cannot connect to server. Please make sure the backend is running on port 4000.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/dashboard');
      if (!response.ok) throw new Error('Dashboard fetch failed');
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Don't set global error for dashboard - just log it
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/employees');
      if (!response.ok) throw new Error('Employees fetch failed');
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      // Don't set global error for employees - just log it
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/schedules');
      if (!response.ok) throw new Error('Schedules fetch failed');
      const data = await response.json();
      setSchedules(data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      // Don't set global error for schedules - just log it
    }
  };

  const handleScheduleCreated = () => {
    fetchSchedules();
    fetchDashboardData();
    setActiveTab('schedules');
  };

  const handleEmployeeAdded = () => {
    fetchEmployees();
    fetchDashboardData();
    setActiveTab('employees');
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px',
          fontSize: '18px',
          color: '#666'
        }}>
          Loading application...
        </div>
      );
    }

    if (error) {
      return (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px',
          fontSize: '18px',
          color: '#dc2626'
        }}>
          <div style={{ marginBottom: '1rem' }}>⚠️ Error: {error}</div>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard data={dashboardData} />;
      case 'employees':
        return <Employees employees={employees} onEmployeeAdded={handleEmployeeAdded} />;
      case 'schedules':
        return <Schedules schedules={schedules} onScheduleUpdated={fetchSchedules} />;
      case 'create-schedule':
        return <CreateSchedule employees={employees} onScheduleCreated={handleScheduleCreated} />;
      default:
        return <Dashboard data={dashboardData} />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'schedules', label: 'Schedules', icon: Calendar },
    { id: 'create-schedule', label: 'Create Schedule', icon: Plus },
  ];

  return (
    <div className="app">
      {/* Mobile menu button */}
      <button
        className="mobile-menu-button"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h1>📅 Scheduler</h1>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <header className="content-header">
          <h2>{navItems.find(item => item.id === activeTab)?.label}</h2>
          {error && (
            <div style={{
              background: '#fef2f2',
              color: '#dc2626',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontSize: '0.875rem',
              marginTop: '0.5rem',
              border: '1px solid #fecaca'
            }}>
              ⚠️ {error}
            </div>
          )}
        </header>
        
        <div className="content">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;

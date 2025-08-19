import React, { useState, useEffect } from 'react';
import { Users, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const Dashboard = ({ data }) => {
  const [connectionStatus, setConnectionStatus] = useState('testing');

  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/health');
        if (response.ok) {
          setConnectionStatus('connected');
        } else {
          setConnectionStatus('error');
        }
      } catch (error) {
        setConnectionStatus('error');
      }
    };

    testConnection();
  }, []);

  if (!data) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
        <div style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
          Connection Status: {connectionStatus === 'connected' ? '✅ Connected' : 
                            connectionStatus === 'error' ? '❌ Cannot connect to server' : 
                            '🔄 Testing connection...'}
        </div>
      </div>
    );
  }

  // Simple fallback if data is missing
  if (!data.totalEmployees && !data.totalSchedules) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        color: '#666'
      }}>
        <h3>Dashboard</h3>
        <p>No data available yet. Add some employees and schedules to get started!</p>
        <div style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
          Connection Status: {connectionStatus === 'connected' ? '✅ Connected' : 
                            connectionStatus === 'error' ? '❌ Cannot connect to server' : 
                            '🔄 Testing connection...'}
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Employees',
      value: data.totalEmployees || 0,
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Total Schedules',
      value: data.totalSchedules || 0,
      icon: Calendar,
      color: 'green'
    },
    {
      title: "Today's Schedules",
      value: data.todaySchedules || 0,
      icon: Clock,
      color: 'purple'
    },
    {
      title: 'Confirmed Schedules',
      value: data.confirmedSchedules || 0,
      icon: CheckCircle,
      color: 'emerald'
    },
    {
      title: 'Pending Schedules',
      value: data.pendingSchedules || 0,
      icon: AlertCircle,
      color: 'amber'
    }
  ];

  return (
    <div className="dashboard">
      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`stat-card stat-${stat.color}`}>
              <div className="stat-icon">
                <Icon size={24} />
              </div>
              <div className="stat-content">
                <h3 className="stat-value">{stat.value}</h3>
                <p className="stat-title">{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Role Distribution */}
      {data.roles && Object.keys(data.roles).length > 0 && (
        <div className="dashboard-section">
          <h3>Employee Roles</h3>
          <div className="role-distribution">
            {Object.entries(data.roles).map(([role, count]) => (
              <div key={role} className="role-item">
                <span className="role-name">{role}</span>
                <span className="role-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="dashboard-section">
        <h3>Quick Actions</h3>
        <div className="quick-actions">
          <button className="action-button primary">
            <Calendar size={20} />
            Create New Schedule
          </button>
          <button className="action-button secondary">
            <Users size={20} />
            Add Employee
          </button>
          <button className="action-button secondary">
            <Clock size={20} />
            View Today's Schedule
          </button>
        </div>
      </div>

      {/* System Status */}
      <div className="dashboard-section">
        <h3>System Status</h3>
        <div className="status-indicators">
          <div className="status-item online">
            <div className="status-dot"></div>
            <span>API Server</span>
          </div>
          <div className="status-item online">
            <div className="status-dot"></div>
            <span>Database</span>
          </div>
          <div className="status-item online">
            <div className="status-dot"></div>
            <span>Frontend</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
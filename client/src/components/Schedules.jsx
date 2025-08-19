import React, { useState } from 'react';
import { Calendar, Clock, User, Edit, Trash2, Filter, Search } from 'lucide-react';
import { format, parseISO, isToday, isTomorrow, isYesterday } from 'date-fns';

const Schedules = ({ schedules, onScheduleUpdated }) => {
  const [filterDate, setFilterDate] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSchedule, setEditingSchedule] = useState(null);

  // Get unique employees for filter
  const employees = [...new Set(schedules.map(s => s.employeeName))];
  const statuses = ['pending', 'confirmed', 'cancelled'];

  // Helper function to format time display
  const formatTimeDisplay = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Filter schedules
  const filteredSchedules = schedules.filter(schedule => {
    const matchesDate = !filterDate || schedule.date === filterDate;
    const matchesEmployee = !filterEmployee || schedule.employeeName === filterEmployee;
    const matchesStatus = !filterStatus || schedule.status === filterStatus;
    const matchesSearch = !searchTerm || 
      schedule.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.role.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesDate && matchesEmployee && matchesStatus && matchesSearch;
  });

  // Group schedules by date
  const schedulesByDate = filteredSchedules.reduce((acc, schedule) => {
    const date = schedule.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(schedule);
    return acc;
  }, {});

  const getDateLabel = (dateStr) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'EEEE, MMMM d');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'status-confirmed';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  const handleStatusChange = async (scheduleId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:4000/api/schedules/${scheduleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        onScheduleUpdated();
      } else {
        alert('Failed to update schedule status');
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
      alert('Failed to update schedule status');
    }
  };

  const handleDelete = async (scheduleId) => {
    if (!confirm('Are you sure you want to delete this schedule?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/schedules/${scheduleId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onScheduleUpdated();
      } else {
        alert('Failed to delete schedule');
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert('Failed to delete schedule');
    }
  };

  const clearFilters = () => {
    setFilterDate('');
    setFilterEmployee('');
    setFilterStatus('');
    setSearchTerm('');
  };

  return (
    <div className="schedules">
      {/* Header */}
      <div className="section-header">
        <h3>Schedule Management</h3>
        <div className="header-actions">
          <button className="btn-secondary" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="date-filter">Date</label>
            <input
              type="date"
              id="date-filter"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="employee-filter">Employee</label>
            <select
              id="employee-filter"
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
            >
              <option value="">All Employees</option>
              {employees.map(emp => (
                <option key={emp} value={emp}>{emp}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="status-filter">Status</label>
            <select
              id="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="search-filter">Search</label>
            <div className="search-input">
              <Search size={16} />
              <input
                type="text"
                id="search-filter"
                placeholder="Search employees or roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Schedules List */}
      <div className="schedules-list">
        {Object.keys(schedulesByDate).length === 0 ? (
          <div className="empty-state">
            <Calendar size={48} />
            <h3>No schedules found</h3>
            <p>Try adjusting your filters or create a new schedule</p>
          </div>
        ) : (
          Object.entries(schedulesByDate).map(([date, dateSchedules]) => (
            <div key={date} className="date-group">
              <div className="date-header">
                <Calendar size={20} />
                <h4>{getDateLabel(date)}</h4>
                <span className="date-count">{dateSchedules.length} schedule{dateSchedules.length !== 1 ? 's' : ''}</span>
              </div>
              
              <div className="schedules-grid">
                {dateSchedules.map((schedule) => (
                  <div key={schedule.id} className="schedule-card">
                    <div className="schedule-header">
                      <div className="schedule-time">
                        <Clock size={16} />
                        <span>{formatTimeDisplay(schedule.startTime)} - {formatTimeDisplay(schedule.endTime)}</span>
                      </div>
                      <div className={`schedule-status ${getStatusColor(schedule.status)}`}>
                        {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                      </div>
                    </div>
                    
                    <div className="schedule-content">
                      <div className="schedule-employee">
                        <User size={16} />
                        <span>{schedule.employeeName}</span>
                      </div>
                      <div className="schedule-role">
                        <span>{schedule.role}</span>
                      </div>
                    </div>
                    
                    <div className="schedule-actions">
                      <select
                        value={schedule.status}
                        onChange={(e) => handleStatusChange(schedule.id, e.target.value)}
                        className="status-select"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      
                      <button
                        className="btn-icon"
                        onClick={() => setEditingSchedule(schedule)}
                        title="Edit schedule"
                      >
                        <Edit size={16} />
                      </button>
                      
                      <button
                        className="btn-icon danger"
                        onClick={() => handleDelete(schedule.id)}
                        title="Delete schedule"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      {filteredSchedules.length > 0 && (
        <div className="schedule-summary">
          <p>
            Showing {filteredSchedules.length} of {schedules.length} schedules
            {filterDate && ` for ${getDateLabel(filterDate)}`}
            {filterEmployee && ` for ${filterEmployee}`}
            {filterStatus && ` with status ${filterStatus}`}
          </p>
        </div>
      )}
    </div>
  );
};

export default Schedules; 
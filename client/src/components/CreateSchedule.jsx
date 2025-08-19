import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Save, X, AlertCircle } from 'lucide-react';

const CreateSchedule = ({ employees, onScheduleCreated }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    date: '',
    startTime: '',
    endTime: '',
    role: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflicts, setConflicts] = useState([]);

  // Set default date to today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, date: today }));
  }, []);

  // Update role when employee is selected
  useEffect(() => {
    if (formData.employeeId) {
      const employee = employees.find(emp => emp.id === formData.employeeId);
      if (employee) {
        setFormData(prev => ({ ...prev, role: employee.role }));
      }
    }
  }, [formData.employeeId, employees]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.employeeId) {
      newErrors.employeeId = 'Employee is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }

    // Allow overnight shifts (end time can be before start time)
    // This is now valid for night shifts like 6 PM to 6 AM

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkConflicts = async () => {
    if (!formData.employeeId || !formData.date || !formData.startTime || !formData.endTime) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/schedules?employeeId=${formData.employeeId}&date=${formData.date}`);
      const existingSchedules = await response.json();
      
      // Enhanced conflict detection for overnight shifts
      const conflicts = existingSchedules.filter(schedule => {
        const existingStart = schedule.startTime;
        const existingEnd = schedule.endTime;
        const newStart = formData.startTime;
        const newEnd = formData.endTime;

        // Convert times to minutes for easier comparison
        const toMinutes = (time) => {
          const [hours, minutes] = time.split(':').map(Number);
          return hours * 60 + minutes;
        };

        const s1 = toMinutes(existingStart);
        const e1 = toMinutes(existingEnd);
        const s2 = toMinutes(newStart);
        const e2 = toMinutes(newEnd);

        // Handle overnight shifts (end time < start time)
        if (e1 < s1) {
          // Existing shift goes overnight
          if (e2 < s2) {
            // New shift also goes overnight
            return true; // Both overnight shifts overlap
          } else {
            // New shift is same-day
            return s2 < e1 || s1 < e2;
          }
        } else if (e2 < s2) {
          // Only new shift goes overnight
          return s1 < e2 || s2 < e1;
        } else {
          // Both shifts are same-day
          return s1 < e2 && s2 < e1;
        }
      });

      setConflicts(conflicts);
    } catch (error) {
      console.error('Error checking conflicts:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (conflicts.length > 0) {
      alert('Please resolve schedule conflicts before creating this schedule');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:4000/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newSchedule = await response.json();
        alert('Schedule created successfully!');
        setFormData({
          employeeId: '',
          date: new Date().toISOString().split('T')[0],
          startTime: '',
          endTime: '',
          role: ''
        });
        setConflicts([]);
        onScheduleCreated();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating schedule:', error);
      alert('Failed to create schedule');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific errors
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Check conflicts when relevant fields change
    if (['employeeId', 'date', 'startTime', 'endTime'].includes(field)) {
      setTimeout(checkConflicts, 500);
    }
  };

  const getTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(time);
      }
    }
    return options;
  };

  const timeOptions = getTimeOptions();

  // Helper function to format time display
  const formatTimeDisplay = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Check if this is an overnight shift
  const isOvernightShift = () => {
    if (!formData.startTime || !formData.endTime) return false;
    const [startHour] = formData.startTime.split(':').map(Number);
    const [endHour] = formData.endTime.split(':').map(Number);
    return endHour < startHour;
  };

  return (
    <div className="create-schedule">
      <div className="form-card">
        <div className="form-header">
          <h3>Create New Schedule</h3>
          <p>Fill in the details below to create a new employee schedule</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="employee">Employee *</label>
              <select
                id="employee"
                value={formData.employeeId}
                onChange={(e) => handleInputChange('employeeId', e.target.value)}
                className={errors.employeeId ? 'error' : ''}
              >
                <option value="">Select an employee</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} - {employee.role}
                  </option>
                ))}
              </select>
              {errors.employeeId && <span className="error-message">{errors.employeeId}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="date">Date *</label>
              <input
                type="date"
                id="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className={errors.date ? 'error' : ''}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.date && <span className="error-message">{errors.date}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="startTime">Start Time *</label>
              <select
                id="startTime"
                value={formData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                className={errors.startTime ? 'error' : ''}
              >
                <option value="">Select start time</option>
                {timeOptions.map(time => (
                  <option key={time} value={time}>
                    {formatTimeDisplay(time)}
                  </option>
                ))}
              </select>
              {errors.startTime && <span className="error-message">{errors.startTime}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="endTime">End Time *</label>
              <select
                id="endTime"
                value={formData.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
                className={errors.endTime ? 'error' : ''}
              >
                <option value="">Select end time</option>
                {timeOptions.map(time => (
                  <option key={time} value={time}>
                    {formatTimeDisplay(time)}
                  </option>
                ))}
              </select>
              {errors.endTime && <span className="error-message">{errors.endTime}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="role">Role *</label>
              <input
                type="text"
                id="role"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className={errors.role ? 'error' : ''}
                placeholder="Role for this shift"
              />
              {errors.role && <span className="error-message">{errors.role}</span>}
            </div>
          </div>

          {/* Overnight Shift Notice */}
          {isOvernightShift() && (
            <div className="overnight-notice">
              <AlertCircle size={16} />
              <span>This is an overnight shift that goes past midnight</span>
            </div>
          )}

          {/* Conflict Warning */}
          {conflicts.length > 0 && (
            <div className="conflict-warning">
              <AlertCircle size={16} />
              <div>
                <strong>Schedule Conflict Detected!</strong>
                <p>This employee already has a schedule during this time:</p>
                <ul>
                  {conflicts.map(conflict => (
                    <li key={conflict.id}>
                      {formatTimeDisplay(conflict.startTime)} - {formatTimeDisplay(conflict.endTime)} ({conflict.role})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting || conflicts.length > 0}
            >
              {isSubmitting ? 'Creating...' : 'Create Schedule'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => onScheduleCreated()}>
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Schedule Preview */}
      {formData.employeeId && formData.date && formData.startTime && formData.endTime && (
        <div className="schedule-preview">
          <h4>Schedule Preview</h4>
          <div className="preview-card">
            <div className="preview-row">
              <strong>Employee:</strong>
              <span>{employees.find(emp => emp.id === formData.employeeId)?.name}</span>
            </div>
            <div className="preview-row">
              <strong>Date:</strong>
              <span>{new Date(formData.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div className="preview-row">
              <strong>Time:</strong>
              <span>
                {formatTimeDisplay(formData.startTime)} - {formatTimeDisplay(formData.endTime)}
                {isOvernightShift() && <span className="overnight-badge">Overnight</span>}
              </span>
            </div>
            <div className="preview-row">
              <strong>Role:</strong>
              <span>{formData.role}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateSchedule; 
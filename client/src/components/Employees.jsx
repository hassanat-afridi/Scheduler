import React, { useState } from 'react';
import { Plus, Edit, Trash2, User, Mail, Briefcase } from 'lucide-react';

const Employees = ({ employees, onEmployeeAdded }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: ''
  });

  const roles = ['Manager', 'Cashier', 'Barista', 'Kitchen Staff', 'Server', 'Host'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:4000/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({ name: '', role: '', email: '' });
        setShowAddForm(false);
        onEmployeeAdded();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      alert('Failed to add employee');
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      role: employee.role,
      email: employee.email
    });
    setShowAddForm(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`http://localhost:4000/api/employees/${editingEmployee.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({ name: '', role: '', email: '' });
        setShowAddForm(false);
        setEditingEmployee(null);
        onEmployeeAdded();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      alert('Failed to update employee');
    }
  };

  const handleDelete = async (employeeId) => {
    if (!confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/employees/${employeeId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onEmployeeAdded();
      } else {
        alert('Failed to delete employee');
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Failed to delete employee');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', role: '', email: '' });
    setShowAddForm(false);
    setEditingEmployee(null);
  };

  return (
    <div className="employees">
      {/* Header */}
      <div className="section-header">
        <h3>Employee Management</h3>
        <button
          className="btn-primary"
          onClick={() => setShowAddForm(true)}
        >
          <Plus size={20} />
          Add Employee
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="form-overlay">
          <div className="form-card">
            <h3>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h3>
            <form onSubmit={editingEmployee ? handleUpdate : handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Enter employee name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">Role *</label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                >
                  <option value="">Select a role</option>
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="Enter employee email"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingEmployee ? 'Update Employee' : 'Add Employee'}
                </button>
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employees List */}
      <div className="employees-grid">
        {employees.map((employee) => (
          <div key={employee.id} className="employee-card">
            <div className="employee-avatar">
              <User size={24} />
            </div>
            <div className="employee-info">
              <h4 className="employee-name">{employee.name}</h4>
              <div className="employee-details">
                <span className="employee-role">
                  <Briefcase size={16} />
                  {employee.role}
                </span>
                <span className="employee-email">
                  <Mail size={16} />
                  {employee.email}
                </span>
              </div>
            </div>
            <div className="employee-actions">
              <button
                className="btn-icon"
                onClick={() => handleEdit(employee)}
                title="Edit employee"
              >
                <Edit size={16} />
              </button>
              <button
                className="btn-icon danger"
                onClick={() => handleDelete(employee.id)}
                title="Delete employee"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {employees.length === 0 && (
        <div className="empty-state">
          <User size={48} />
          <h3>No employees yet</h3>
          <p>Add your first employee to get started with scheduling</p>
          <button className="btn-primary" onClick={() => setShowAddForm(true)}>
            <Plus size={20} />
            Add Employee
          </button>
        </div>
      )}
    </div>
  );
};

export default Employees; 
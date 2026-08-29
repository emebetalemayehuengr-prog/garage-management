import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGarage } from '../../context/GarageContext';
import { Plus, Edit2, Trash2, UserPlus, Shield, X } from 'lucide-react';
import { validateForm, validateRequired, validateLength } from '../../utils/validation';
import { usePersistedForm } from '../../hooks/usePersistedForm';

const USER_FORM_KEY = 'user_form_data';

const UserManagement = () => {
  const { currentUser, hasRole } = useAuth();
  const { users: apiUsers = [], addUser: apiAddUser, updateUser: apiUpdateUser, deleteUser: apiDeleteUser, isLoading } = useGarage();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData, resetForm] = usePersistedForm(USER_FORM_KEY, {
    name: '',
    username: '',
    password: '',
    role: 'mechanic'
  });
  const [errors, setErrors] = useState({});

  const isSuperAdmin = currentUser?.role === 'admin';
  const isOwner = currentUser?.role === 'owner';
  const canManageUsers = hasRole('admin') || hasRole('owner');
  const canCreateOwner = isSuperAdmin;
  const isDefaultOwner = (user) => user.id === 1;

  let visibleUsers = apiUsers;
  if (isOwner && !isSuperAdmin) {
    visibleUsers = apiUsers.filter(u => u.role === 'mechanic');
  }

  if (!canManageUsers) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-800">User Management</h2>
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 text-center">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">You don't have permission to manage users.</p>
        </div>
      </div>
    );
  }

  const validateUserForm = (data) => {
    const rules = {
      name: [validateRequired],
      username: [validateRequired, (v) => validateLength(v, 3, 20, 'Username')],
      password: [validateRequired, (v) => validateLength(v, 6, 50, 'Password')],
      role: [validateRequired]
    };
    return validateForm(data, rules);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateUserForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    await apiAddUser({
      ...formData,
      status: 'available'
    });
    
    resetForm();
    setShowAddForm(false);
  };

  const handleEdit = (user) => {
    setEditingUser(user.id);
    setFormData({
      name: user.name,
      username: user.username,
      password: user.password,
      role: user.role
    });
    setShowAddForm(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateUserForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    await apiUpdateUser(editingUser, formData);
    setEditingUser(null);
    resetForm();
  };

  const handleDelete = async (userId) => {
    if (isDefaultOwner({ id: userId })) {
      alert('The default owner account cannot be deleted.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this user?')) {
      await apiDeleteUser(userId);
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingUser(null);
    resetForm();
    setErrors({});
  };

  useEffect(() => {
    if (!showAddForm && editingUser === null) {
      resetForm();
      setErrors({});
    }
  }, [showAddForm, editingUser, resetForm]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">User Management</h2>
          <p className="text-gray-500 mt-1">Manage owner, admin, and mechanic accounts</p>
        </div>
        <button
          onClick={() => { setShowAddForm(!showAddForm); setEditingUser(null); }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <UserPlus className="w-5 h-5" />
          <span>{editingUser ? 'Editing User' : 'Add User'}</span>
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {editingUser ? 'Edit User' : 'Add New User'}
            </h3>
            <button onClick={handleCancel} className="p-1 hover:bg-gray-100 rounded-lg transition">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <form onSubmit={editingUser ? handleEditSubmit : handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${errors.username ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}`}
              />
              {errors.username && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.username}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input
                type="text"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}`}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="mechanic">Mechanic</option>
                <option value="admin">Admin</option>
                {canCreateOwner && <option value="owner">Owner</option>}
              </select>
            </div>
            <div className="md:col-span-2 flex space-x-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                {editingUser ? 'Update User' : 'Add User'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">All Accounts</h3>
          <p className="text-sm text-gray-500 mt-1">These credentials are used for application login</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Password</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visibleUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded">{user.password}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === 'owner' ? 'bg-purple-100 text-purple-700' : user.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isDefaultOwner(user) ? (
                      <span className="text-xs text-gray-400">Default Owner</span>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {visibleUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No user accounts yet. Add one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
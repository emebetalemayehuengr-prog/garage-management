import React, { useState, useEffect } from 'react';
import { useGarage } from '../../context/GarageContext';
import { UserPlus, Search, Phone, MapPin, Edit, Trash2, X } from 'lucide-react';
import { usePersistedForm } from '../../hooks/usePersistedForm';
import { FormInput } from '../../components/forms';
import { validateEmail, validatePhone, validateRequired } from '../../utils/validation';

const CUSTOMERS_FORM_KEY = 'customers_form_data';

const Customers = () => {
  const { customers = [], addCustomer, updateCustomer, deleteCustomer } = useGarage();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [errors, setErrors] = useState({});
  const [formData, setFormData, resetForm] = usePersistedForm(CUSTOMERS_FORM_KEY, {
    name: '',
    phone: '',
    email: '',
    address: '',
    username: '',
    password: ''
  });

  useEffect(() => {
    if (!showAddForm && editingId === null) {
      resetForm();
      setErrors({});
    }
  }, [showAddForm, editingId, resetForm]);

  const validate = () => {
    const errs = {};
    errs.name = validateRequired(formData.name, 'Name');
    errs.phone = validateRequired(formData.phone, 'Phone');
    if (formData.phone && !validatePhone(formData.phone)) errs.phone = 'Invalid phone number';
    if (formData.email && !validateEmail(formData.email)) errs.email = 'Invalid email address';
    if (!editingId) {
      if (!formData.username) errs.username = 'Username is required';
      if (!formData.password) errs.password = 'Password is required';
      if (formData.password && formData.password.length < 6) errs.password = 'Password must be at least 6 characters';
    }
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

    if (editingId) {
      updateCustomer(editingId, formData);
      setEditingId(null);
    } else {
      addCustomer(formData);
    }
    resetForm();
    setShowAddForm(false);
  };

  const handleEdit = (customer) => {
    setEditingId(customer.id);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || ''
    });
    setShowAddForm(true);
    setErrors({});
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingId(null);
    resetForm();
    setErrors({});
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      deleteCustomer(id);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Customers</h2>
          <p className="text-gray-500 mt-1">Manage your customer database</p>
        </div>
        <button
          onClick={() => { setShowAddForm(!showAddForm); setEditingId(null); }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <UserPlus className="w-5 h-5" />
          <span>{editingId ? 'Editing Customer' : 'Add Customer'}</span>
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {editingId ? 'Edit Customer' : 'Register New Customer'}
            </h3>
            <button onClick={handleCancel} className="p-1 hover:bg-gray-100 rounded-lg transition">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
              required
              placeholder="Enter full name"
            />
            <FormInput
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              error={errors.phone}
              required
              placeholder="+251 9XX XXX XXX"
              icon={Phone}
            />
            <FormInput
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              placeholder="customer@example.com"
            />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                  rows={2}
                  placeholder="Enter address"
                />
              </div>
            </div>
            <div className="md:col-span-2 flex space-x-4">
              <button type="submit" className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
                {editingId ? 'Update Customer' : 'Register Customer'}
              </button>
              <button type="button" onClick={handleCancel} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm ? 'No customers found' : 'No customers registered yet'}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredCustomers.map((customer) => (
              <div key={customer.id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <UserPlus className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{customer.name}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs text-gray-500 mt-1">
                        <span className="flex items-center">
                          <Phone className="w-3 h-3 mr-1" />
                          {customer.phone}
                        </span>
                        {customer.email && (
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {customer.email}
                          </span>
                        )}
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {customer.address}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button onClick={() => handleEdit(customer)} className="p-2 hover:bg-blue-100 rounded-lg transition">
                      <Edit className="w-4 h-4 text-blue-600" />
                    </button>
                    <button onClick={() => handleDelete(customer.id)} className="p-2 hover:bg-red-100 rounded-lg transition">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Customers;

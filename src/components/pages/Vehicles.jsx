import React, { useState, useEffect } from 'react';
import { useGarage } from '../../context/GarageContext';
import { Car, Plus, Search, Edit, Trash2, X } from 'lucide-react';
import { usePersistedForm } from '../../hooks/usePersistedForm';
import { FormInput, FormSelect } from '../../components/forms';
import { MANUFACTURERS, COMMON_COLORS, YEARS } from '../../data/options';
import { useAuthStore } from '../../stores/authStore';

const VEHICLES_FORM_KEY = 'vehicles_form_data';

const Vehicles = () => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const canManageVehicles = currentUser?.role === 'owner' || currentUser?.role === 'admin';
  const { vehicles = [], customers = [], addVehicle, updateVehicle, deleteVehicle } = useGarage();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [formData, setFormData, resetForm] = usePersistedForm(VEHICLES_FORM_KEY, {
    customerId: '',
    plateNumber: '',
    manufacturer: '',
    model: '',
    year: '',
    mileage: '',
    color: '',
  });

  useEffect(() => {
    if (!showAddForm && editingId === null) {
      resetForm();
    }
  }, [showAddForm, editingId, resetForm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    try {
      if (editingId) {
        await updateVehicle(editingId, formData);
        setEditingId(null);
      } else {
        await addVehicle(formData);
      }
      resetForm();
      setShowAddForm(false);
    } catch (error) {
      setSubmitError(error.message || 'Unable to save vehicle');
    }
  };

  const handleEdit = (vehicle) => {
    setEditingId(vehicle.id);
    setFormData({
      customerId: String(vehicle.customerId),
      plateNumber: vehicle.plateNumber,
      manufacturer: vehicle.manufacturer,
      model: vehicle.model,
      year: String(vehicle.year),
      mileage: String(vehicle.mileage || ''),
      color: vehicle.color || '',
    });
    setShowAddForm(true);
    setSubmitError('');
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingId(null);
    resetForm();
    setSubmitError('');
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this vehicle?')) {
      deleteVehicle(id);
    }
  };

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Vehicles</h2>
          <p className="text-gray-500 mt-1">Manage vehicle registrations</p>
        </div>
        {canManageVehicles && (
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingId(null);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            <span>{editingId ? 'Editing Vehicle' : 'Add Vehicle'}</span>
          </button>
        )}
      </div>

      {canManageVehicles && showAddForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {editingId ? 'Edit Vehicle' : 'Register New Vehicle'}
            </h3>
            <button onClick={handleCancel} className="p-1 hover:bg-gray-100 rounded-lg transition">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          {submitError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {submitError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Customer</label>
              <select
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              >
                <option value="">Select Customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>
            <FormInput
              label="Plate Number"
              value={formData.plateNumber}
              onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
              required
              minLength={5}
              placeholder="e.g., AA 1234 BB"
            />
            <FormSelect
              label="Manufacturer"
              value={formData.manufacturer}
              onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              options={MANUFACTURERS}
              placeholder="Select manufacturer"
              required
            />
            <FormInput
              label="Model"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              required
              minLength={2}
              placeholder="e.g., Corolla, Vitz"
            />
            <FormSelect
              label="Year"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              options={YEARS}
              placeholder="Select year"
              required
            />
            <FormInput
              label="Mileage (km)"
              type="number"
              min="0"
              value={formData.mileage}
              onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
              placeholder="0"
            />
            <FormSelect
              label="Color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              options={COMMON_COLORS}
              placeholder="Select color"
            />
            <div className="md:col-span-2 flex space-x-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                {editingId ? 'Update Vehicle' : 'Register Vehicle'}
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search vehicles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {filteredVehicles.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm ? 'No vehicles found' : 'No vehicles registered yet'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plate
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mileage
                  </th>
                  {canManageVehicles && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredVehicles.map((vehicle) => {
                  const customer = customers.find((c) => c.id === vehicle.customerId);
                  return (
                    <tr key={vehicle.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-semibold text-gray-800 text-sm">
                          {vehicle.plateNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <Car className="w-5 h-5 text-gray-400 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {vehicle.manufacturer} {vehicle.model}
                            </p>
                            <p className="text-xs text-gray-500">
                              {vehicle.year} • {vehicle.color}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {customer?.name || 'Unknown'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {vehicle.mileage} km
                      </td>
                      {canManageVehicles && (
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleEdit(vehicle)}
                              className="p-2 hover:bg-blue-100 rounded-lg transition"
                            >
                              <Edit className="w-4 h-4 text-blue-600" />
                            </button>
                            <button
                              onClick={() => handleDelete(vehicle.id)}
                              className="p-2 hover:bg-red-100 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Vehicles;

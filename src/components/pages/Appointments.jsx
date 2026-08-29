import React, { useState, useEffect } from 'react';
import { useGarage } from '../../context/GarageContext';
import { Calendar, Plus, Clock, User, Car, X } from 'lucide-react';
import { usePersistedForm } from '../../hooks/usePersistedForm';
import { FormInput, FormSelect } from '../../components/forms';
import { SERVICE_TYPES } from '../../data/options';

const APPOINTMENTS_FORM_KEY = 'appointments_form_data';

const Appointments = () => {
  const { customers = [], vehicles = [], appointments = [], addAppointment } = useGarage();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData, resetForm] = usePersistedForm(APPOINTMENTS_FORM_KEY, {
    customerId: '',
    vehicleId: '',
    date: '',
    time: '',
    serviceType: ''
  });

  useEffect(() => {
    if (!showAddForm) {
      resetForm();
    }
  }, [showAddForm, resetForm]);

  const handleSubmit = (e) => {
    e.preventDefault();
    addAppointment({
      ...formData,
      customerId: Number(formData.customerId),
      vehicleId: Number(formData.vehicleId)
    });
    resetForm();
    setShowAddForm(false);
  };

  const filteredAppointments = appointments.filter(apt =>
    apt.serviceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.date?.includes(searchTerm)
  );

  const customerVehicles = formData.customerId
    ? vehicles.filter(v => String(v.customerId) === formData.customerId)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Appointments</h2>
          <p className="text-gray-500 mt-1">Manage service schedules</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Book Appointment</span>
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Book New Appointment</h3>
            <button onClick={() => setShowAddForm(false)} className="p-1 hover:bg-gray-100 rounded-lg transition">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Customer</label>
              <select
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value, vehicleId: '' })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              >
                <option value="">Select Customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>{customer.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle</label>
              <select
                value={formData.vehicleId}
                onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
                disabled={!formData.customerId}
              >
                <option value="">Select Vehicle</option>
                {customerVehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.plateNumber} - {vehicle.manufacturer} {vehicle.model}
                  </option>
                ))}
              </select>
            </div>
            <FormInput
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
            <FormInput
              label="Time"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              required
            />
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Service Type</label>
              <select
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              >
                <option value="">Select Service Type</option>
                {SERVICE_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 flex space-x-4">
              <button type="submit" className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
                Book Appointment
              </button>
              <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        {filteredAppointments.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No appointments scheduled yet</p>
              <p className="text-sm text-gray-400 mt-1">Click "Book Appointment" to schedule a service</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAppointments.map((apt, idx) => {
                  const customer = customers.find(c => String(c.id) === String(apt.customerId));
                  const vehicle = vehicles.find(v => String(v.id) === String(apt.vehicleId));
                  return (
                    <tr key={apt.id || idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">{customer?.name || 'Unknown'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {vehicle ? `${vehicle.plateNumber} - ${vehicle.manufacturer} ${vehicle.model}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{apt.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{apt.time}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{apt.serviceType}</td>
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

export default Appointments;
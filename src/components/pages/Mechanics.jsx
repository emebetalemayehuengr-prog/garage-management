import React, { useState } from 'react';
import { useGarage } from '../../context/GarageContext';
import { Plus, Wrench } from 'lucide-react';

const Mechanics = () => {
  const { mechanics, setMechanics } = useGarage();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    status: 'available'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newMechanic = { ...formData, id: Date.now() };
    setMechanics([...mechanics, newMechanic]);
    setFormData({ name: '', specialization: '', status: 'available' });
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Mechanics</h2>
          <p className="text-gray-500 mt-1">Manage your mechanic team</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Add Mechanic</span>
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Mechanic</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
              <input
                type="text"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="available">Available</option>
                <option value="busy">Busy</option>
              </select>
            </div>
            <div className="md:col-span-3 flex space-x-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Add Mechanic
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mechanics.map((mechanic) => (
          <div key={mechanic.id} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  mechanic.status === 'available' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <span className="text-xl">👨‍🔧</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">{mechanic.name}</h3>
                  <p className="text-xs text-gray-500">{mechanic.specialization}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                mechanic.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {mechanic.status}
              </span>
            </div>
            <div className="text-xs text-gray-600">
              <p><strong>ID:</strong> {mechanic.id}</p>
              <p><strong>Specialization:</strong> {mechanic.specialization}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Mechanics;

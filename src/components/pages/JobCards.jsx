import React, { useState } from 'react';
import { useGarage } from '../../context/GarageContext';
import { ClipboardList, Plus, Search, Wrench, CheckCircle, Printer } from 'lucide-react';
import { printJobCard } from '../../utils/print';

const JobCards = () => {
  const { jobCards, vehicles, customers, mechanics, createJobCard, updateJobCard, assignMechanic, JOB_CARD_STATUS } = useGarage();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    vehicleId: '',
    problemDescription: '',
    priority: 'normal'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createJobCard(formData);
    setFormData({ vehicleId: '', problemDescription: '', priority: 'normal' });
    setShowAddForm(false);
  };

  const handleAssignMechanic = (jobCardId, mechanicId) => {
    assignMechanic(jobCardId, mechanicId);
  };

  const handleStatusUpdate = (jobCardId, newStatus) => {
    updateJobCard(jobCardId, { status: newStatus });
  };

  const filteredJobCards = jobCards.filter(jc =>
    jc.problemDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
    jc.id.toString().includes(searchTerm)
  );

  const getStatusColor = (status) => {
    switch (status) {
      case JOB_CARD_STATUS.CREATED: return 'bg-blue-100 text-blue-700';
      case JOB_CARD_STATUS.INSPECTED: return 'bg-purple-100 text-purple-700';
      case JOB_CARD_STATUS.ASSIGNED: return 'bg-yellow-100 text-yellow-700';
      case JOB_CARD_STATUS.DIAGNOSED: return 'bg-orange-100 text-orange-700';
      case JOB_CARD_STATUS.REPAIRING: return 'bg-indigo-100 text-indigo-700';
      case JOB_CARD_STATUS.QUALITY_CHECK: return 'bg-pink-100 text-pink-700';
      case JOB_CARD_STATUS.INVOICED: return 'bg-teal-100 text-teal-700';
      case JOB_CARD_STATUS.PAID: return 'bg-green-100 text-green-700';
      case JOB_CARD_STATUS.DELIVERED: return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Job Cards</h2>
          <p className="text-gray-500 mt-1">Track service requests and repairs</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Create Job Card</span>
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Job Card</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle</label>
              <select
                value={formData.vehicleId}
                onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              >
                <option value="">Select Vehicle</option>
                {vehicles.map((vehicle) => {
                  const customer = customers.find(c => c.id === vehicle.customerId);
                  return (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.plateNumber} - {vehicle.manufacturer} {vehicle.model} ({customer?.name})
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Problem Description</label>
              <textarea
                value={formData.problemDescription}
                onChange={(e) => setFormData({ ...formData, problemDescription: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                rows="3"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Create Job Card
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search job cards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {filteredJobCards.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm ? 'No job cards found' : 'No job cards created yet'}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredJobCards.map((jobCard) => {
              const vehicle = vehicles.find(v => v.id === jobCard.vehicleId);
              const customer = vehicle ? customers.find(c => c.id === vehicle.customerId) : null;
              const mechanic = jobCard.mechanicId ? mechanics.find(m => m.id === jobCard.mechanicId) : null;

              return (
                <div key={jobCard.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <ClipboardList className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-800">Job #{jobCard.id}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(jobCard.status)}`}>
                          {jobCard.status}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          jobCard.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                          jobCard.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {jobCard.priority}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{jobCard.problemDescription}</p>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        {vehicle && (
                          <span>🚗 {vehicle.plateNumber} - {vehicle.manufacturer} {vehicle.model}</span>
                        )}
                        {customer && <span>👤 {customer.name}</span>}
                        {mechanic && <span>🔧 {mechanic.name}</span>}
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                      {!jobCard.mechanicId && (
                        <select
                          onChange={(e) => handleAssignMechanic(jobCard.id, parseInt(e.target.value))}
                          className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        >
                          <option value="">Assign Mechanic</option>
                          {mechanics.filter(m => m.status === 'available').map((mech) => (
                            <option key={mech.id} value={mech.id}>{mech.name} ({mech.specialization})</option>
                          ))}
                        </select>
                      )}
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleStatusUpdate(jobCard.id, JOB_CARD_STATUS.INSPECTED)}
                          className="p-2 hover:bg-purple-100 rounded-lg transition"
                          title="Mark as Inspected"
                        >
                          <CheckCircle className="w-5 h-5 text-purple-600" />
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(jobCard.id, JOB_CARD_STATUS.REPAIRING)}
                          className="p-2 hover:bg-indigo-100 rounded-lg transition"
                          title="Start Repair"
                        >
                          <Wrench className="w-5 h-5 text-indigo-600" />
                        </button>
                        <button
                          onClick={() => {
                            const vehicle = vehicles.find(v => v.id === jobCard.vehicleId);
                            const customer = vehicle ? customers.find(c => c.id === vehicle.customerId) : null;
                            printJobCard(jobCard, customer, vehicle);
                          }}
                          className="p-2 hover:bg-blue-100 rounded-lg transition"
                          title="Print Job Card"
                        >
                          <Printer className="w-5 h-5 text-blue-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobCards;

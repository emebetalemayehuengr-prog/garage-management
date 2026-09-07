import React, { useState, useEffect } from 'react';
import { useGarage } from '../../context/GarageContext';
import { useAuth } from '../../context/AuthContext';
import { ClipboardList, Plus, Search, Wrench, CheckCircle, Printer, Bell, X } from 'lucide-react';
import { printJobCard } from '../../utils/print';
import { requestNotificationPermission, notifyRepairComplete } from '../../utils/notifications';
import { usePersistedForm } from '../../hooks/usePersistedForm';

const JOBCARD_FORM_KEY = 'jobcard_form_data';

const JobCards = () => {
  const {
    jobCards = [],
    vehicles = [],
    customers = [],
    mechanics = [],
    createJobCard,
    updateJobCard,
    assignMechanic,
    JOB_CARD_STATUS,
  } = useGarage();
  const { currentUser } = useAuth();
  const isOwner = currentUser?.role === 'owner';
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData, resetForm] = usePersistedForm(JOBCARD_FORM_KEY, {
    vehicleId: '',
    problemDescription: '',
    priority: 'normal',
    ownerId: currentUser?.id || '',
  });
  const [notifications, setNotifications] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    if (!showAddForm) {
      resetForm();
    }
  }, [showAddForm, resetForm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isOwner) return;
    setIsSubmitting(true);
    setSubmitError('');
    try {
      await createJobCard({ ...formData, ownerId: currentUser.id });
      resetForm();
      setShowAddForm(false);
    } catch (error) {
      setSubmitError(error.message || 'Failed to create job card');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRepairComplete = async (jobCard) => {
    await updateJobCard(jobCard.id, { status: JOB_CARD_STATUS.QUALITY_CHECK });

    const vehicle = vehicles.find((v) => v.id === jobCard.vehicleId);
    const customer = vehicle ? customers.find((c) => c.id === vehicle.customerId) : null;

    const notification = notifyRepairComplete(jobCard, customer, vehicle);
    setNotifications((prev) => [
      ...prev,
      { ...notification, id: Date.now(), jobCardId: jobCard.id },
    ]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.jobCardId !== jobCard.id));
    }, 5000);
  };

  const handleAssignMechanic = (jobCardId, mechanicId) => {
    if (!isOwner) return;
    assignMechanic(jobCardId, mechanicId);
  };

  const handleStatusUpdate = (jobCardId, newStatus) => {
    updateJobCard(jobCardId, { status: newStatus });
  };

  const filteredJobCards = jobCards.filter((jc) => {
    const matchesSearch =
      jc.problemDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jc.id.toString().includes(searchTerm);

    if (currentUser?.role === 'mechanic') {
      return matchesSearch && jc.mechanicId === (currentUser.mechanicId || currentUser.id);
    }

    return matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case JOB_CARD_STATUS.CREATED:
        return 'bg-blue-100 text-blue-700';
      case JOB_CARD_STATUS.INSPECTED:
        return 'bg-purple-100 text-purple-700';
      case JOB_CARD_STATUS.ASSIGNED:
        return 'bg-yellow-100 text-yellow-700';
      case JOB_CARD_STATUS.DIAGNOSED:
        return 'bg-orange-100 text-orange-700';
      case JOB_CARD_STATUS.REPAIRING:
        return 'bg-indigo-100 text-indigo-700';
      case JOB_CARD_STATUS.QUALITY_CHECK:
        return 'bg-pink-100 text-pink-700';
      case JOB_CARD_STATUS.INVOICED:
        return 'bg-teal-100 text-teal-700';
      case JOB_CARD_STATUS.PAID:
        return 'bg-green-100 text-green-700';
      case JOB_CARD_STATUS.DELIVERED:
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg w-[calc(100vw-2rem)] max-w-sm"
            >
              <div className="flex items-start space-x-3">
                <Bell className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">{notification.title}</p>
                  <p className="text-sm text-green-700 mt-1">{notification.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Job Cards</h2>
          <p className="text-gray-500 mt-1">Track service requests and repairs</p>
        </div>
        {isOwner && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-2 px-3 py-2 md:px-4 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Create Job Card</span>
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Create New Job Card</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-1 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  const customer = customers.find((c) => c.id === vehicle.customerId);
                  return (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.plateNumber} - {vehicle.manufacturer} {vehicle.model} (
                      {customer?.name})
                    </option>
                  );
                })}
              </select>
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
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Problem Description
              </label>
              <textarea
                value={formData.problemDescription}
                onChange={(e) => setFormData({ ...formData, problemDescription: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                rows="3"
                required
              />
            </div>
            <div className="md:col-span-2 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              {submitError && (
                <p className="text-red-600 text-sm col-span-full">{submitError}</p>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting && (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                <span>{isSubmitting ? 'Creating...' : 'Create Job Card'}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
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
              const vehicle = vehicles.find((v) => v.id === jobCard.vehicleId);
              const customer = vehicle ? customers.find((c) => c.id === vehicle.customerId) : null;
              const mechanic = jobCard.mechanicId
                ? mechanics.find((m) => m.id === jobCard.mechanicId)
                : null;

              return (
                <div key={jobCard.id} className="p-4 md:p-6 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <ClipboardList className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-800">Job #{jobCard.id}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(jobCard.status)}`}
                        >
                          {jobCard.status}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            jobCard.priority === 'urgent'
                              ? 'bg-red-100 text-red-700'
                              : jobCard.priority === 'high'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {jobCard.priority}
                        </span>
                      </div>

                      <p className="text-gray-600 mb-3">{jobCard.problemDescription}</p>

                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        {vehicle && (
                          <span>
                            🚗 {vehicle.plateNumber} - {vehicle.manufacturer} {vehicle.model}
                          </span>
                        )}
                        {customer && <span>👤 {customer.name}</span>}
                        {mechanic && <span>🔧 {mechanic.name}</span>}
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                      {!jobCard.mechanicId && isOwner && (
                        <select
                          onChange={(e) =>
                            handleAssignMechanic(jobCard.id, parseInt(e.target.value))
                          }
                          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none min-w-[120px]"
                        >
                          <option value="">Assign Mechanic</option>
                          {mechanics
                            .filter((m) => m.status === 'available')
                            .map((mech) => (
                              <option key={mech.id} value={mech.id}>
                                {mech.name} ({mech.specialization})
                              </option>
                            ))}
                        </select>
                      )}

                      <div className="flex space-x-2">
                        {currentUser?.role !== 'mechanic' && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(jobCard.id, JOB_CARD_STATUS.INSPECTED)
                            }
                            className="p-3 hover:bg-purple-100 rounded-lg transition min-w-[44px] min-h-[44px] flex items-center justify-center"
                            title="Mark as Inspected"
                          >
                            <CheckCircle className="w-5 h-5 text-purple-600" />
                          </button>
                        )}
                        {(currentUser?.role === 'mechanic'
                          ? jobCard.mechanicId === (currentUser.mechanicId || currentUser.id)
                          : true) && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(jobCard.id, JOB_CARD_STATUS.REPAIRING)
                            }
                            className="p-3 hover:bg-indigo-100 rounded-lg transition min-w-[44px] min-h-[44px] flex items-center justify-center"
                            title="Start Repair"
                          >
                            <Wrench className="w-5 h-5 text-indigo-600" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            const vehicle = vehicles.find((v) => v.id === jobCard.vehicleId);
                            const customer = vehicle
                              ? customers.find((c) => c.id === vehicle.customerId)
                              : null;
                            printJobCard(jobCard, customer, vehicle);
                          }}
                          className="p-3 hover:bg-blue-100 rounded-lg transition min-w-[44px] min-h-[44px] flex items-center justify-center"
                          title="Print Job Card"
                        >
                          <Printer className="w-5 h-5 text-blue-600" />
                        </button>
                        {currentUser?.role === 'mechanic' &&
                          jobCard.mechanicId === (currentUser.mechanicId || currentUser.id) &&
                          jobCard.status !== 'delivered' && (
                            <button
                              onClick={() => handleRepairComplete(jobCard)}
                              className="p-3 hover:bg-green-100 rounded-lg transition min-w-[44px] min-h-[44px] flex items-center justify-center"
                              title="Mark Repair Complete"
                            >
                              <Bell className="w-5 h-5 text-green-600" />
                            </button>
                          )}
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

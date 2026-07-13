import React, { useState } from 'react';
import { useGarage } from '../../context/GarageContext';
import { DollarSign, Plus, Search, Receipt } from 'lucide-react';

const Billing = () => {
  const { invoices, jobCards, vehicles, customers, createInvoice, updateInvoicePayment, PAYMENT_STATUS } = useGarage();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    jobCardId: '',
    serviceCharge: 0,
    partsCost: 0
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const totalAmount = formData.serviceCharge + formData.partsCost;
    createInvoice({
      ...formData,
      totalAmount,
      paidAmount: 0
    });
    setFormData({ jobCardId: '', serviceCharge: 0, partsCost: 0 });
    setShowAddForm(false);
  };

  const handlePayment = (invoiceId, amount) => {
    updateInvoicePayment(invoiceId, amount);
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.id.toString().includes(searchTerm)
  );

  const getStatusColor = (status) => {
    switch (status) {
      case PAYMENT_STATUS.PENDING: return 'bg-yellow-100 text-yellow-700';
      case PAYMENT_STATUS.PARTIAL: return 'bg-orange-100 text-orange-700';
      case PAYMENT_STATUS.PAID: return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Billing</h2>
          <p className="text-gray-500 mt-1">Manage invoices and payments</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Create Invoice</span>
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Invoice</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Card</label>
              <select
                value={formData.jobCardId}
                onChange={(e) => setFormData({ ...formData, jobCardId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              >
                <option value="">Select Job Card</option>
                {jobCards.filter(jc => jc.status !== 'invoiced' && jc.status !== 'paid').map((jc) => {
                  const vehicle = vehicles.find(v => v.id === jc.vehicleId);
                  const customer = vehicle ? customers.find(c => c.id === vehicle.customerId) : null;
                  return (
                    <option key={jc.id} value={jc.id}>
                      Job #{jc.id} - {vehicle?.plateNumber} ({customer?.name})
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Charge ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.serviceCharge}
                  onChange={(e) => setFormData({ ...formData, serviceCharge: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parts Cost ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.partsCost}
                  onChange={(e) => setFormData({ ...formData, partsCost: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Create Invoice
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
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {filteredInvoices.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm ? 'No invoices found' : 'No invoices created yet'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Card</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInvoices.map((invoice) => {
                  const jobCard = jobCards.find(jc => jc.id === invoice.jobCardId);
                  const remaining = invoice.totalAmount - (invoice.paidAmount || 0);
                  return (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Receipt className="w-5 h-5 text-gray-400 mr-2" />
                          <span className="font-medium text-gray-800">INV-{invoice.id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        Job #{invoice.jobCardId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                        ${invoice.totalAmount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        ${(invoice.paidAmount || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {invoice.status !== PAYMENT_STATUS.PAID && (
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min="1"
                              max={remaining}
                              placeholder="Amount"
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                            <button
                              onClick={() => {
                                const input = document.querySelector(`input[placeholder="Amount"]`);
                                if (input) handlePayment(invoice.id, parseFloat(input.value));
                              }}
                              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition"
                            >
                              Pay
                            </button>
                          </div>
                        )}
                      </td>
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

export default Billing;

import React from 'react';
import { useGarage } from '../../context/GarageContext';
import { BarChart3, TrendingUp, DollarSign, Users, Car, Package } from 'lucide-react';
import { formatETB } from '../../utils/format';

const Reports = () => {
  const { invoices, customers, vehicles, jobCards, spareParts } = useGarage();

  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
  const pendingPayments = invoices.reduce((sum, inv) => sum + (inv.totalAmount - (inv.paidAmount || 0)), 0);
  const activeJobs = jobCards.filter(jc => jc.status !== 'delivered').length;
  const lowStockItems = spareParts.filter(p => p.stock < 10).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Reports</h2>
        <p className="text-gray-500 mt-1">Business analytics and insights</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold mt-2">formatETB(totalRevenue)</p>
            </div>
            <DollarSign className="w-10 h-10 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Customers</p>
              <p className="text-3xl font-bold mt-2">{customers.length}</p>
            </div>
            <Users className="w-10 h-10 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Active Jobs</p>
              <p className="text-3xl font-bold mt-2">{activeJobs}</p>
            </div>
            <Car className="w-10 h-10 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Pending Payments</p>
              <p className="text-3xl font-bold mt-2">formatETB(pendingPayments)</p>
            </div>
            <TrendingUp className="w-10 h-10 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Car className="w-5 h-5 mr-2 text-blue-600" />
            Vehicle Statistics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Total Vehicles</span>
              <span className="font-semibold text-gray-800">{vehicles.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Total Customers</span>
              <span className="font-semibold text-gray-800">{customers.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Avg Vehicles per Customer</span>
              <span className="font-semibold text-gray-800">
                {customers.length > 0 ? (vehicles.length / customers.length).toFixed(1) : 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2 text-orange-600" />
            Inventory Status
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Total Parts</span>
              <span className="font-semibold text-gray-800">{spareParts.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="text-red-600">Low Stock Items</span>
              <span className="font-semibold text-red-700">{lowStockItems}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Total Inventory Value</span>
              <span className="font-semibold text-gray-800">
                formatETB(spareParts.reduce((sum, p) => sum + (p.stock * p.price), 0))
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
            Job Card Summary
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Total Job Cards</span>
              <span className="font-semibold text-gray-800">{jobCards.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-blue-600">Active Jobs</span>
              <span className="font-semibold text-blue-700">{activeJobs}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-green-600">Completed Jobs</span>
              <span className="font-semibold text-green-700">
                {jobCards.filter(jc => jc.status === 'delivered').length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-green-600" />
            Financial Summary
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-green-600">Total Revenue</span>
              <span className="font-semibold text-green-700">formatETB(totalRevenue)</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
              <span className="text-orange-600">Pending Payments</span>
              <span className="font-semibold text-orange-700">formatETB(pendingPayments)</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Total Invoices</span>
              <span className="font-semibold text-gray-800">{invoices.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;

import React from 'react';
import { useGarage } from '../../context/GarageContext';
import { 
  Users, 
  Car, 
  ClipboardList, 
  Wrench, 
  Package, 
  DollarSign, 
  TrendingUp,
  Clock
} from 'lucide-react';

const DashboardHome = () => {
  const { 
    customers, 
    vehicles, 
    jobCards, 
    mechanics, 
    spareParts, 
    invoices 
  } = useGarage();

  const stats = [
    {
      title: 'Total Customers',
      value: customers.length,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Total Vehicles',
      value: vehicles.length,
      icon: Car,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: 'Active Job Cards',
      value: jobCards.filter(jc => jc.status !== 'delivered').length,
      icon: ClipboardList,
      color: 'bg-purple-500',
      change: '+5%'
    },
    {
      title: 'Available Mechanics',
      value: mechanics.filter(m => m.status === 'available').length,
      icon: Wrench,
      color: 'bg-orange-500',
      change: '0%'
    },
    {
      title: 'Low Stock Items',
      value: spareParts.filter(p => p.stock < 10).length,
      icon: Package,
      color: 'bg-red-500',
      change: '-3%'
    },
    {
      title: 'Total Revenue',
      value: `ETB ${invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-teal-500',
      change: '+15%'
    },
  ];

  const recentJobCards = jobCards.slice(-5).reverse();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Dashboard Overview</h2>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className={`font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </span>
                <span className="text-gray-500 ml-2">from last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Job Cards</h3>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          {recentJobCards.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No job cards yet</p>
          ) : (
            <div className="space-y-4">
              {recentJobCards.map((jobCard) => (
                <div key={jobCard.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">Job #{jobCard.id}</p>
                    <p className="text-sm text-gray-500">{jobCard.problemDescription}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    jobCard.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    jobCard.status === 'paid' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {jobCard.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Quick Actions</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition text-left">
              <Users className="w-6 h-6 text-blue-600 mb-2" />
              <p className="font-medium text-gray-800">Add Customer</p>
            </button>
            <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition text-left">
              <Car className="w-6 h-6 text-green-600 mb-2" />
              <p className="font-medium text-gray-800">Add Vehicle</p>
            </button>
            <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition text-left">
              <ClipboardList className="w-6 h-6 text-purple-600 mb-2" />
              <p className="font-medium text-gray-800">Create Job Card</p>
            </button>
            <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition text-left">
              <Package className="w-6 h-6 text-orange-600 mb-2" />
              <p className="font-medium text-gray-800">Manage Inventory</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;

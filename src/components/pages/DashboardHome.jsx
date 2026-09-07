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
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';
import { formatETB } from '../../utils/format';
import { useAuthStore } from '../../stores/authStore';

const DashboardHome = ({ onNavigate }) => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const { 
    customers = [], 
    vehicles = [], 
    jobCards = [], 
    mechanics = [], 
    spareParts = [], 
    invoices = [] 
  } = useGarage();

  const activeJobs = jobCards.filter(jc => jc.status !== 'delivered').length;
  const lowStockItems = spareParts.filter(p => p.stock < 10).length;
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
  const pendingPayments = invoices.reduce((sum, inv) => sum + (inv.totalAmount - (inv.paidAmount || 0)), 0);

  const stats = [
    {
      title: 'Total Customers',
      value: customers.length,
      icon: Users,
      gradient: 'from-blue-500 to-blue-600',
      lightBg: 'bg-blue-50',
      textColor: 'text-blue-600',
      change: '+12%',
      trend: 'up',
      roles: ['owner', 'admin', 'mechanic', 'finance']
    },
    {
      title: 'Total Vehicles',
      value: vehicles.length,
      icon: Car,
      gradient: 'from-emerald-500 to-teal-600',
      lightBg: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      change: '+8%',
      trend: 'up',
      roles: ['owner', 'admin', 'mechanic', 'finance']
    },
    {
      title: 'Active Job Cards',
      value: activeJobs,
      icon: ClipboardList,
      gradient: 'from-violet-500 to-purple-600',
      lightBg: 'bg-violet-50',
      textColor: 'text-violet-600',
      change: '+5%',
      trend: 'up',
      roles: ['owner', 'admin', 'mechanic', 'finance']
    },
    {
      title: 'Available Mechanics',
      value: mechanics.filter(m => m.status === 'available').length,
      icon: Wrench,
      gradient: 'from-orange-500 to-amber-600',
      lightBg: 'bg-orange-50',
      textColor: 'text-orange-600',
      change: '0%',
      trend: 'neutral',
      roles: ['owner', 'admin', 'mechanic', 'finance']
    },
    {
      title: 'Low Stock Items',
      value: lowStockItems,
      icon: Package,
      gradient: 'from-rose-500 to-pink-600',
      lightBg: 'bg-rose-50',
      textColor: 'text-rose-600',
      change: '-3%',
      trend: 'down',
      roles: ['owner', 'admin', 'finance']
    },
    {
      title: 'Total Revenue',
      value: formatETB(totalRevenue),
      icon: DollarSign,
      gradient: 'from-cyan-500 to-blue-600',
      lightBg: 'bg-cyan-50',
      textColor: 'text-cyan-600',
      change: '+15%',
      trend: 'up',
      roles: ['owner', 'admin', 'finance']
    },
  ];

  const visibleStats = stats.filter(stat => stat.roles.includes(currentUser?.role));

  const recentJobCards = jobCards.slice(-5).reverse();

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'paid':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'invoiced':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'repairing':
        return 'bg-violet-100 text-violet-700 border-violet-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/5"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-64 w-64 rounded-full bg-white/5"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-2">
            <Activity className="w-8 h-8 text-blue-400" />
            <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
          </div>
          <p className="text-slate-300 text-lg">
            Welcome back, <span className="font-semibold text-white capitalize">{currentUser?.name}</span>! Here's what's happening today.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 transition-all duration-300 hover:shadow-lg hover:ring-gray-900/10 hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-500 tracking-wide uppercase">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2 tracking-tight">{stat.value}</p>
                </div>
                <div className={`${stat.lightBg} rounded-xl p-3.5 ring-1 ring-gray-900/5 transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                {stat.trend === 'up' && <ArrowUpRight className="w-4 h-4 text-emerald-500 mr-1.5" />}
                {stat.trend === 'down' && <ArrowDownRight className="w-4 h-4 text-rose-500 mr-1.5" />}
                {stat.trend === 'neutral' && <div className="w-4 h-4 mr-1.5" />}
                <span className={`font-semibold ${stat.trend === 'up' ? 'text-emerald-600' : stat.trend === 'down' ? 'text-rose-600' : 'text-gray-500'}`}>
                  {stat.change}
                </span>
                <span className="text-gray-400 ml-2 text-xs">from last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Job Cards */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
          <div className="flex items-center justify-between p-6 pb-4">
            <h3 className="text-lg font-semibold text-gray-900 tracking-tight">Recent Job Cards</h3>
            <div className="p-2 rounded-lg bg-gray-50 ring-1 ring-gray-900/5">
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="px-6 pb-6">
            {recentJobCards.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 mb-3">
                  <ClipboardList className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">No job cards yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentJobCards.map((jobCard) => (
                  <div
                    key={jobCard.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50/80 ring-1 ring-gray-900/5 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">Job #{jobCard.id}</p>
                      <p className="text-sm text-gray-500 truncate mt-0.5">{jobCard.problemDescription}</p>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(jobCard.status)}`}>
                      {jobCard.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
          <div className="flex items-center justify-between p-6 pb-4">
            <h3 className="text-lg font-semibold text-gray-900 tracking-tight">Quick Actions</h3>
            <div className="p-2 rounded-lg bg-gray-50 ring-1 ring-gray-900/5">
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="px-6 pb-6">
            <div className="grid grid-cols-2 gap-3">
              {currentUser?.role !== 'mechanic' && (
                <button
                  onClick={() => onNavigate('customers')}
                  className="group flex flex-col items-start p-4 rounded-xl bg-blue-50/50 ring-1 ring-blue-900/10 hover:bg-blue-50 hover:ring-blue-900/20 transition-all duration-200"
                >
                  <div className="p-2 rounded-lg bg-blue-100/80 group-hover:bg-blue-100 transition-colors">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="font-semibold text-gray-900 mt-3 text-sm">Add Customer</p>
                </button>
              )}
              <button
                onClick={() => onNavigate('vehicles')}
                className="group flex flex-col items-start p-4 rounded-xl bg-emerald-50/50 ring-1 ring-emerald-900/10 hover:bg-emerald-50 hover:ring-emerald-900/20 transition-all duration-200"
              >
                <div className="p-2 rounded-lg bg-emerald-100/80 group-hover:bg-emerald-100 transition-colors">
                  <Car className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="font-semibold text-gray-900 mt-3 text-sm">
                  {currentUser?.role === 'mechanic' ? 'View Vehicles' : 'Add Vehicle'}
                </p>
              </button>
              <button
                onClick={() => onNavigate('jobcards')}
                className="group flex flex-col items-start p-4 rounded-xl bg-violet-50/50 ring-1 ring-violet-900/10 hover:bg-violet-50 hover:ring-violet-900/20 transition-all duration-200"
              >
                <div className="p-2 rounded-lg bg-violet-100/80 group-hover:bg-violet-100 transition-colors">
                  <ClipboardList className="w-5 h-5 text-violet-600" />
                </div>
                <p className="font-semibold text-gray-900 mt-3 text-sm">Create Job Card</p>
              </button>
              {currentUser?.role === 'mechanic' ? (
                <button
                  onClick={() => onNavigate('appointments')}
                  className="group flex flex-col items-start p-4 rounded-xl bg-orange-50/50 ring-1 ring-orange-900/10 hover:bg-orange-50 hover:ring-orange-900/20 transition-all duration-200"
                >
                  <div className="p-2 rounded-lg bg-orange-100/80 group-hover:bg-orange-100 transition-colors">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <p className="font-semibold text-gray-900 mt-3 text-sm">View Appointments</p>
                </button>
              ) : (
                <button
                  onClick={() => onNavigate('inventory')}
                  className="group flex flex-col items-start p-4 rounded-xl bg-orange-50/50 ring-1 ring-orange-900/10 hover:bg-orange-50 hover:ring-orange-900/20 transition-all duration-200"
                >
                  <div className="p-2 rounded-lg bg-orange-100/80 group-hover:bg-orange-100 transition-colors">
                    <Package className="w-5 h-5 text-orange-600" />
                  </div>
                  <p className="font-semibold text-gray-900 mt-3 text-sm">Manage Inventory</p>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;

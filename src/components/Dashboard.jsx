import React, { useState, Suspense, lazy, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Car,
  ClipboardList,
  Wrench,
  Package,
  DollarSign,
  Calendar,
  BarChart3,
  Settings,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useGarage } from '../context/GarageContext';
import LoadingSpinner from './LoadingSpinner.jsx';

const DashboardHome = lazy(() => import('./pages/DashboardHome'));
const Customers = lazy(() => import('./pages/Customers'));
const Vehicles = lazy(() => import('./pages/Vehicles'));
const JobCards = lazy(() => import('./pages/JobCards'));
const Mechanics = lazy(() => import('./pages/Mechanics'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Billing = lazy(() => import('./pages/Billing'));
const Appointments = lazy(() => import('./pages/Appointments'));
const Reports = lazy(() => import('./pages/Reports'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const CompanyProfile = lazy(() => import('./pages/CompanyProfile'));

const allNavigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['owner', 'admin', 'mechanic'],
  },
  { id: 'customers', label: 'Customers', icon: Users, roles: ['owner', 'admin'] },
  { id: 'vehicles', label: 'Vehicles', icon: Car, roles: ['owner', 'admin', 'mechanic'] },
  {
    id: 'jobcards',
    label: 'Job Cards',
    icon: ClipboardList,
    roles: ['owner', 'admin', 'mechanic'],
  },
  { id: 'mechanics', label: 'Mechanics', icon: Wrench, roles: ['owner', 'admin'] },
  { id: 'inventory', label: 'Inventory', icon: Package, roles: ['owner', 'admin', 'mechanic'] },
  { id: 'billing', label: 'Billing', icon: DollarSign, roles: ['owner', 'admin'] },
  {
    id: 'appointments',
    label: 'Appointments',
    icon: Calendar,
    roles: ['owner', 'admin', 'mechanic'],
  },
  { id: 'reports', label: 'Reports', icon: BarChart3, roles: ['owner', 'admin'] },
  { id: 'users', label: 'User Management', icon: Settings, roles: ['owner', 'admin'] },
  { id: 'company-profile', label: 'Company Profile', icon: Settings, roles: ['owner'] },
];

const Dashboard = ({ currentUser, onLogout }) => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const { loadData, isLoading, error } = useGarage();

  useEffect(() => {
    loadData(currentUser?.role);
  }, [loadData, currentUser?.role]);

  const userRole = currentUser?.role || 'mechanic';
  const navigationItems = allNavigationItems.filter((item) => item.roles.includes(userRole));

  const navigateTo = (pageId) => {
    const isAllowed = allNavigationItems.some(
      (item) => item.id === pageId && item.roles.includes(userRole)
    );
    setCurrentPage(isAllowed ? pageId : 'dashboard');
  };

  const renderPage = () => {
    const effectivePage = navigationItems.some((item) => item.id === currentPage)
      ? currentPage
      : 'dashboard';
    let pageContent;
    switch (effectivePage) {
      case 'customers':
        pageContent = <Customers />;
        break;
      case 'vehicles':
        pageContent = <Vehicles />;
        break;
      case 'jobcards':
        pageContent = <JobCards />;
        break;
      case 'mechanics':
        pageContent = <Mechanics />;
        break;
      case 'inventory':
        pageContent = <Inventory />;
        break;
      case 'billing':
        pageContent = <Billing />;
        break;
      case 'appointments':
        pageContent = <Appointments />;
        break;
      case 'reports':
        pageContent =
          userRole === 'mechanic' ? <DashboardHome onNavigate={navigateTo} /> : <Reports />;
        break;
      case 'users':
        pageContent = <UserManagement />;
        break;
      case 'company-profile':
        pageContent = <CompanyProfile />;
        break;
      default:
        pageContent = <DashboardHome onNavigate={navigateTo} />;
    }

    return (
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        }
      >
        {pageContent}
      </Suspense>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-md w-full">
          <div className="text-center">
            <div className="bg-red-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Failed to load data</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadData}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center space-x-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar
        isOpen={sidebarOpen}
        navigationItems={navigationItems}
        currentPage={currentPage}
        onPageChange={(id) => {
          navigateTo(id);
          if (window.innerWidth < 1024) setSidebarOpen(false);
        }}
        onClose={() => setSidebarOpen(false)}
      />

      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        <Header
          currentUser={currentUser}
          onLogout={onLogout}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />

        <main className="p-3 sm:p-6">{renderPage()}</main>
      </div>
    </div>
  );
};

export default Dashboard;

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
  LogOut,
  Menu,
  X
} from 'lucide-react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useGarage } from '../context/GarageContext';
import LoadingSpinner from './LoadingSpinner';

// Lazy load pages for code splitting
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

const allNavigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['owner', 'admin', 'mechanic'] },
  { id: 'customers', label: 'Customers', icon: Users, roles: ['owner', 'admin'] },
  { id: 'vehicles', label: 'Vehicles', icon: Car, roles: ['owner', 'admin', 'mechanic'] },
  { id: 'jobcards', label: 'Job Cards', icon: ClipboardList, roles: ['owner', 'admin', 'mechanic'] },
  { id: 'mechanics', label: 'Mechanics', icon: Wrench, roles: ['owner', 'admin'] },
  { id: 'inventory', label: 'Inventory', icon: Package, roles: ['owner', 'admin', 'mechanic'] },
  { id: 'billing', label: 'Billing', icon: DollarSign, roles: ['owner', 'admin'] },
  { id: 'appointments', label: 'Appointments', icon: Calendar, roles: ['owner', 'admin', 'mechanic'] },
  { id: 'reports', label: 'Reports', icon: BarChart3, roles: ['owner', 'admin'] },
  { id: 'users', label: 'User Management', icon: Settings, roles: ['owner', 'admin'] },
];

const Dashboard = ({ currentUser, onLogout }) => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { loadData, isLoading } = useGarage();

  useEffect(() => {
    loadData();
  }, [loadData]);

  const userRole = currentUser?.role || 'mechanic';
  const navigationItems = allNavigationItems.filter(item =>
    item.roles.includes(userRole)
  );

  const renderPage = () => {
    const pageComponent = () => {
      switch (currentPage) {
        case 'dashboard':
          return <DashboardHome onNavigate={setCurrentPage} />;
        case 'customers':
          return <Customers />;
        case 'vehicles':
          return <Vehicles />;
        case 'jobcards':
          return <JobCards />;
        case 'mechanics':
          return <Mechanics />;
        case 'inventory':
          return <Inventory />;
        case 'billing':
          return <Billing />;
        case 'appointments':
          return <Appointments />;
        case 'reports':
          return <Reports />;
        case 'users':
          return <UserManagement />;
        default:
          return <DashboardHome />;
      }
    };

    return (
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }>
        {pageComponent()}
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

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar
        isOpen={sidebarOpen}
        navigationItems={navigationItems}
        currentPage={currentPage}
        onPageChange={(id) => {
          setCurrentPage(id);
          if (window.innerWidth < 1024) setSidebarOpen(false);
        }}
        onClose={() => setSidebarOpen(false)}
      />

      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <Header
          currentUser={currentUser}
          onLogout={onLogout}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />

        <main className="p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

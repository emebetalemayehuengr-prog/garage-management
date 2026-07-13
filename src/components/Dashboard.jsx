import React, { useState } from 'react';
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
import DashboardHome from './pages/DashboardHome';
import Customers from './pages/Customers';
import Vehicles from './pages/Vehicles';
import JobCards from './pages/JobCards';
import Mechanics from './pages/Mechanics';
import Inventory from './pages/Inventory';
import Billing from './pages/Billing';
import Appointments from './pages/Appointments';
import Reports from './pages/Reports';
import UserManagement from './pages/UserManagement';

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

  const userRole = currentUser?.role || 'mechanic';
  const navigationItems = allNavigationItems.filter(item =>
    item.roles.includes(userRole)
  );

  const renderPage = () => {
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

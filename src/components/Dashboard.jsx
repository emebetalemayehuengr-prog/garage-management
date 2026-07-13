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

const Dashboard = ({ currentUser, onLogout }) => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'vehicles', label: 'Vehicles', icon: Car },
    { id: 'jobcards', label: 'Job Cards', icon: ClipboardList },
    { id: 'mechanics', label: 'Mechanics', icon: Wrench },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'billing', label: 'Billing', icon: DollarSign },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

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
        onPageChange={setCurrentPage}
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

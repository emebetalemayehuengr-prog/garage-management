import React from 'react';
import { Menu, User, LogOut } from 'lucide-react';

const Header = ({ currentUser, onLogout, onMenuToggle, sidebarOpen }) => {
  const roleColors = {
    owner: 'bg-purple-100 text-purple-700',
    admin: 'bg-blue-100 text-blue-700',
    mechanic: 'bg-green-100 text-green-700'
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuToggle}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            Garage Management System
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 bg-gray-100 px-4 py-2 rounded-lg">
            <User className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-sm font-medium text-gray-800">{currentUser?.name}</p>
              <p className={`text-xs capitalize px-2 py-0.5 rounded-full inline-block mt-0.5 ${roleColors[currentUser?.role] || 'bg-gray-100 text-gray-700'}`}>
                {currentUser?.role}
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

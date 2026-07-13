import React from 'react';
import { Car, X } from 'lucide-react';

const Sidebar = ({ isOpen, navigationItems, currentPage, onPageChange, onClose }) => {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => onClose()}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-gradient-to-b from-blue-900 to-blue-800 text-white z-50 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <Car className="w-8 h-8" />
              <span className="text-xl font-bold">GarageMS</span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden hover:bg-blue-700 p-2 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onPageChange(item.id);
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition duration-200 ${
                    isActive
                      ? 'bg-blue-600 shadow-lg'
                      : 'hover:bg-blue-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-blue-700">
          <div className="text-sm text-blue-200">
            <p className="font-medium">Garage Management</p>
            <p className="text-xs mt-1">v1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

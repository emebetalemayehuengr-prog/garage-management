import React from 'react';
import { useGarage } from '../../context/GarageContext';

const Mechanics = () => {
  const { mechanics } = useGarage();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Mechanics</h2>
        <p className="text-gray-500 mt-1">Manage your mechanic team</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mechanics.map((mechanic) => (
          <div key={mechanic.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  mechanic.status === 'available' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <span className="text-2xl">👨‍🔧</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{mechanic.name}</h3>
                  <p className="text-sm text-gray-500">{mechanic.specialization}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                mechanic.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {mechanic.status}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              <p><strong>ID:</strong> {mechanic.id}</p>
              <p><strong>Specialization:</strong> {mechanic.specialization}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Mechanics;

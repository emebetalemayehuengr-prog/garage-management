import React, { useState, useEffect, useRef } from 'react';
import { useGarage } from '../../context/GarageContext';
import { Plus, Wrench, Camera, Upload, X, Edit2 } from 'lucide-react';
import { usePersistedForm } from '../../hooks/usePersistedForm';
import { SPECIALIZATIONS } from '../../data/options';

const MECHANICS_FORM_KEY = 'mechanics_form_data';

const Mechanics = () => {
  const { mechanics, updateMechanic, addMechanic } = useGarage();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMechanic, setEditingMechanic] = useState(null);
  const [formData, setFormData, resetForm] = usePersistedForm(MECHANICS_FORM_KEY, {
    name: '',
    specialization: '',
    status: 'available',
    photo: null
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    specialization: '',
    status: 'available',
    photo: null
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);

  useEffect(() => {
    if (!showAddForm && editingMechanic === null) {
      resetForm();
      setPreviewUrl(null);
    }
  }, [showAddForm, editingMechanic, resetForm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addMechanic({
      ...formData,
      status: 'available'
    });
    resetForm();
    setPreviewUrl(null);
    setShowAddForm(false);
  };

  const handleEdit = (mechanic) => {
    setEditingMechanic(mechanic.id);
    setEditFormData({
      name: mechanic.name,
      specialization: mechanic.specialization,
      status: mechanic.status,
      photo: mechanic.photo || null
    });
    setEditPreviewUrl(mechanic.photo || null);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    updateMechanic(editingMechanic, editFormData);
    setEditingMechanic(null);
    setEditFormData({ name: '', specialization: '', status: 'available', photo: null });
    setEditPreviewUrl(null);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result });
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditFormData({ ...editFormData, photo: reader.result });
        setEditPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setFormData({ ...formData, photo: null });
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeEditPhoto = () => {
    setEditFormData({ ...editFormData, photo: null });
    setEditPreviewUrl(null);
    if (editFileInputRef.current) {
      editFileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Mechanics</h2>
          <p className="text-gray-500 mt-1">Manage your mechanic team</p>
        </div>
        <button
          onClick={() => { setShowAddForm(!showAddForm); setEditingMechanic(null); }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span>{editingMechanic ? 'Editing Mechanic' : 'Add Mechanic'}</span>
        </button>
      </div>

      {showAddForm && !editingMechanic && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Add New Mechanic</h3>
            <button onClick={() => { setShowAddForm(false); setPreviewUrl(null); }} className="p-1 hover:bg-gray-100 rounded-lg transition">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Specialization</label>
              <select
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              >
                <option value="">Select Specialization</option>
                {SPECIALIZATIONS.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="available">Available</option>
                <option value="busy">Busy</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Photo</label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Photo</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                {previewUrl && (
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {previewUrl && (
                <div className="mt-2">
                  <img src={previewUrl} alt="Preview" className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                </div>
              )}
            </div>
            <div className="md:col-span-2 flex space-x-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Add Mechanic
              </button>
              <button
                type="button"
                onClick={() => { setShowAddForm(false); setPreviewUrl(null); }}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {editingMechanic && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Edit Mechanic</h3>
            <button onClick={() => { setEditingMechanic(null); setEditPreviewUrl(null); }} className="p-1 hover:bg-gray-100 rounded-lg transition">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <form onSubmit={handleEditSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Specialization</label>
              <select
                value={editFormData.specialization}
                onChange={(e) => setEditFormData({ ...editFormData, specialization: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              >
                <option value="">Select Specialization</option>
                {SPECIALIZATIONS.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select
                value={editFormData.status}
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="available">Available</option>
                <option value="busy">Busy</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Photo</label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => editFileInputRef.current?.click()}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Photo</span>
                </button>
                <input
                  ref={editFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleEditPhotoChange}
                  className="hidden"
                />
                {editPreviewUrl && (
                  <button
                    type="button"
                    onClick={removeEditPhoto}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {editPreviewUrl && (
                <div className="mt-2">
                  <img src={editPreviewUrl} alt="Preview" className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                </div>
              )}
            </div>
            <div className="md:col-span-2 flex space-x-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
              >
                Update Mechanic
              </button>
              <button
                type="button"
                onClick={() => { setEditingMechanic(null); setEditPreviewUrl(null); }}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mechanics.map((mechanic) => (
          <div key={mechanic.id} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                {mechanic.photo ? (
                  <img src={mechanic.photo} alt={mechanic.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    mechanic.status === 'available' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <span className="text-xl">👨‍🔧</span>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">{mechanic.name}</h3>
                  <p className="text-xs text-gray-500">{mechanic.specialization}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                mechanic.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {mechanic.status}
              </span>
            </div>
            <div className="text-xs text-gray-600 mb-3">
              <p><strong>ID:</strong> {mechanic.id}</p>
              <p><strong>Specialization:</strong> {mechanic.specialization}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(mechanic)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 transition"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Mechanics;
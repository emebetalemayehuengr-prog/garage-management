import React, { useState, useEffect } from 'react';
import { useGarage } from '../../context/GarageContext';
import { Package, Plus, Search, AlertTriangle, X } from 'lucide-react';
import { usePersistedForm } from '../../hooks/usePersistedForm';
import { FormInput, FormSelect } from '../../components/forms';
import { MANUFACTURERS, YEARS } from '../../data/options';
import Pagination from '../../components/Pagination';
import { useAuthStore } from '../../stores/authStore';

const ITEMS_PER_PAGE = 26;
const INVENTORY_ADD_KEY = 'inventory_add_form';
const INVENTORY_EDIT_KEY = 'inventory_edit_form';

const Inventory = () => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const canManageInventory = currentUser?.role === 'owner' || currentUser?.role === 'admin';
  const { spareParts = [], addSparePart, updateSparePartStock, updateSparePart, deleteSparePart } = useGarage();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMake, setSelectedMake] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData, resetAddForm] = usePersistedForm(INVENTORY_ADD_KEY, {
    name: '',
    category: 'Mechanical',
    make: 'Generic',
    model: 'Generic Model',
    year: '2024',
    stock: 0,
    price: 0
  });
  const [editFormData, setEditFormData, resetEditForm] = usePersistedForm(INVENTORY_EDIT_KEY, {
    name: '',
    category: 'Mechanical',
    make: 'Generic',
    model: 'Generic Model',
    year: '2024',
    stock: 0,
    price: 0
  });

  useEffect(() => {
    if (!showAddForm && editingPart === null) {
      resetAddForm();
      resetEditForm();
    }
  }, [showAddForm, editingPart, resetAddForm, resetEditForm]);

  const handleSubmit = (e) => {
    e.preventDefault();
    addSparePart(formData);
    resetAddForm();
    setShowAddForm(false);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleMakeChange = (e) => {
    setSelectedMake(e.target.value);
    setCurrentPage(1);
  };

  const handleStockUpdate = (partId, quantity) => {
    if (quantity > 0) {
      updateSparePartStock(partId, quantity);
    }
  };

  const handleEdit = (part) => {
    setEditingPart(part.id);
    setEditFormData({
      name: part.name,
      category: part.category || 'Mechanical',
      make: part.make || 'Generic',
      model: part.model || 'Generic Model',
      year: part.year || '2024',
      stock: part.stock,
      price: part.price
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    updateSparePart(editingPart, editFormData);
    setEditingPart(null);
    resetEditForm();
  };

  const handleDelete = (partId) => {
    if (confirm('Are you sure you want to delete this part?')) {
      deleteSparePart(partId);
    }
  };

  const filteredParts = spareParts.filter(part => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term ||
      (part.name || '').toLowerCase().includes(term) ||
      (part.category || '').toLowerCase().includes(term) ||
      (part.make || '').toLowerCase().includes(term) ||
      (part.model || '').toLowerCase().includes(term) ||
      (part.year || '').toLowerCase().includes(term);
    const matchesMake = !selectedMake || (part.make || '').toLowerCase() === selectedMake.toLowerCase();
    return matchesSearch && matchesMake;
  });

  const totalPages = Math.ceil(filteredParts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedParts = filteredParts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Inventory</h2>
          <p className="text-gray-500 mt-1">Manage spare parts stock</p>
        </div>
        {canManageInventory && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            <span>Add Part</span>
          </button>
        )}
      </div>

      {canManageInventory && showAddForm && !editingPart && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Add New Spare Part</h3>
            <button onClick={() => setShowAddForm(false)} className="p-1 hover:bg-gray-100 rounded-lg transition">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Part Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <FormSelect
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={['Mechanical', 'Electric', 'General']}
            />
            <FormSelect
              label="Make"
              value={formData.make}
              onChange={(e) => setFormData({ ...formData, make: e.target.value })}
              options={MANUFACTURERS}
            />
            <FormInput
              label="Model"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              required
            />
            <FormSelect
              label="Year"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              options={YEARS}
            />
            <FormInput
              label="Stock Quantity"
              type="number"
              min="0"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
              required
            />
            <FormInput
              label="Price (ETB)"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              required
            />
            <div className="md:col-span-2 flex space-x-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Add Part
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {canManageInventory && editingPart && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Edit Spare Part</h3>
            <button onClick={() => setEditingPart(null)} className="p-1 hover:bg-gray-100 rounded-lg transition">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <form onSubmit={handleEditSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Part Name"
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              required
            />
            <FormSelect
              label="Category"
              value={editFormData.category}
              onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
              options={['Mechanical', 'Electric', 'General']}
            />
            <FormSelect
              label="Make"
              value={editFormData.make}
              onChange={(e) => setEditFormData({ ...editFormData, make: e.target.value })}
              options={MANUFACTURERS}
            />
            <FormInput
              label="Model"
              value={editFormData.model}
              onChange={(e) => setEditFormData({ ...editFormData, model: e.target.value })}
              required
            />
            <FormSelect
              label="Year"
              value={editFormData.year}
              onChange={(e) => setEditFormData({ ...editFormData, year: e.target.value })}
              options={YEARS}
            />
            <FormInput
              label="Stock Quantity"
              type="number"
              min="0"
              value={editFormData.stock}
              onChange={(e) => setEditFormData({ ...editFormData, stock: parseInt(e.target.value) || 0 })}
              required
            />
            <FormInput
              label="Price (ETB)"
              type="number"
              step="0.01"
              min="0"
              value={editFormData.price}
              onChange={(e) => setEditFormData({ ...editFormData, price: parseFloat(e.target.value) || 0 })}
              required
            />
            <div className="md:col-span-2 flex space-x-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
              >
                Update Part
              </button>
              <button
                type="button"
                onClick={() => setEditingPart(null)}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search parts..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedMake}
                onChange={handleMakeChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">All Makes</option>
                {[...new Set(spareParts.map(p => p.make).filter(Boolean))].map(make => (
                  <option key={make} value={make}>{make}</option>
                ))}
              </select>
              {selectedMake && (
                <button
                  onClick={() => setSelectedMake('')}
                  className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {filteredParts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm ? 'No parts found' : 'No spare parts in inventory'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Make</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  {canManageInventory && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedParts.map((part) => (
                  <tr key={part.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="font-medium text-gray-800 text-sm">{part.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {part.category}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {part.make}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {part.model}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {part.year}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {part.stock}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      ETB {part.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        {part.stock < 10 && (
                          <span className="flex items-center text-red-600 text-xs">
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            Low Stock
                          </span>
                        )}
                        {part.price < 500 && (
                          <span className="flex items-center text-orange-600 text-xs">
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            Low Cost
                          </span>
                        )}
                        {part.stock >= 10 && part.price >= 500 && (
                          <span className="text-green-600 text-xs">In Stock</span>
                        )}
                      </div>
                    </td>
                    {canManageInventory && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleEdit(part)}
                            className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(part.id)}
                            className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={filteredParts.length}
          />
        )}
      </div>
    </div>
  );
};

export default Inventory;

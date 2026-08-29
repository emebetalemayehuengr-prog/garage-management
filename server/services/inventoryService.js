import db from '../database/db.js';

export class InventoryService {
  async getAllSpareParts(userId = null) {
    let spareParts = db.getAll('spare_parts');
    
    if (userId) {
      spareParts = spareParts.filter(sp => sp.ownerId === userId);
    }
    
    return spareParts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async getSparePartById(id) {
    const sparePart = db.getById('spare_parts', id);
    if (!sparePart) {
      throw new Error('Spare part not found');
    }
    return sparePart;
  }

  async createSparePart(sparePartData) {
    const newSparePart = await db.create('spare_parts', sparePartData);
    return newSparePart;
  }

  async updateSparePart(id, updates) {
    const updatedSparePart = db.update('spare_parts', id, updates);
    if (!updatedSparePart) {
      throw new Error('Spare part not found');
    }
    return updatedSparePart;
  }

  async deleteSparePart(id) {
    const sparePart = db.getById('spare_parts', id);
    if (!sparePart) {
      throw new Error('Spare part not found');
    }
    
    db.remove('spare_parts', id);
    return { message: 'Spare part deleted successfully' };
  }

  async updateStock(id, quantity) {
    const sparePart = db.getById('spare_parts', id);
    if (!sparePart) {
      throw new Error('Spare part not found');
    }
    
    const newStock = Math.max(0, sparePart.stock - quantity);
    const updatedSparePart = db.update('spare_parts', id, { stock: newStock });
    
    return updatedSparePart;
  }

  async getLowStockItems(threshold = 5) {
    const spareParts = db.getAll('spare_parts');
    return spareParts.filter(sp => sp.stock <= threshold);
  }

  async getSparePartsByOwner(ownerId) {
    const spareParts = db.getAll('spare_parts');
    return spareParts.filter(sp => sp.ownerId === ownerId);
  }

  async searchSpareParts(query) {
    const spareParts = db.getAll('spare_parts');
    const lowerQuery = query.toLowerCase();
    
    return spareParts.filter(sp => 
      sp.name.toLowerCase().includes(lowerQuery) ||
      sp.category.toLowerCase().includes(lowerQuery) ||
      sp.make.toLowerCase().includes(lowerQuery) ||
      sp.model.toLowerCase().includes(lowerQuery)
    );
  }
}

export default new InventoryService();

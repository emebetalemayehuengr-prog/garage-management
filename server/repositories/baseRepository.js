import db from '../database/db.js';

export class BaseRepository {
  constructor(tableName) {
    this.tableName = tableName;
  }

  async getAll() {
    return db.getAll(this.tableName);
  }

  async getById(id) {
    return db.getById(this.tableName, id);
  }

  async create(data) {
    return db.create(this.tableName, data);
  }

  async update(id, updates) {
    return db.update(this.tableName, id, updates);
  }

  async delete(id) {
    return db.remove(this.tableName, id);
  }

  async find(predicate) {
    const items = await this.getAll();
    return items.find(predicate);
  }

  async filter(predicate) {
    const items = await this.getAll();
    return items.filter(predicate);
  }

  async exists(id) {
    const item = await this.getById(id);
    return !!item;
  }

  async count() {
    const items = await this.getAll();
    return items.length;
  }
}

export default BaseRepository;
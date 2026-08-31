import db from '../database/db.js';

export class CompanyProfileService {
  async getByOwnerId(ownerId) {
    return db.getAll('company_profiles').find((profile) => profile.ownerId === ownerId) || null;
  }

  async save(ownerId, profileData) {
    const existing = await this.getByOwnerId(ownerId);
    const values = {
      ...profileData,
      ownerId,
      updatedAt: new Date().toISOString(),
    };
    if (existing) return db.update('company_profiles', existing.id, values);
    return db.create('company_profiles', { ...values, createdAt: new Date().toISOString() });
  }
}

export default new CompanyProfileService();

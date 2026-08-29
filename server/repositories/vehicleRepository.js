import { BaseRepository } from './baseRepository.js';

export class VehicleRepository extends BaseRepository {
  constructor() {
    super('vehicles');
  }

  async findByPlateNumber(plateNumber) {
    return this.find(vehicle => vehicle.plateNumber === plateNumber);
  }

  async findByCustomerId(customerId) {
    return this.filter(vehicle => vehicle.customerId === customerId);
  }

  async findByOwnerId(ownerId) {
    return this.filter(vehicle => vehicle.ownerId === ownerId);
  }

  async findByManufacturer(manufacturer) {
    return this.filter(vehicle => vehicle.manufacturer === manufacturer);
  }

  async searchByPlateOrModel(query) {
    const vehicles = await this.getAll();
    const lowerQuery = query.toLowerCase();
    return vehicles.filter(vehicle => 
      vehicle.plateNumber.toLowerCase().includes(lowerQuery) ||
      vehicle.model.toLowerCase().includes(lowerQuery)
    );
  }
}

export default new VehicleRepository();

import { BaseRepository } from './baseRepository.js';

export class AppointmentRepository extends BaseRepository {
  constructor() {
    super('appointments');
  }

  async findByCustomerId(customerId) {
    return this.filter(appt => appt.customerId === customerId);
  }

  async findByVehicleId(vehicleId) {
    return this.filter(appt => appt.vehicleId === vehicleId);
  }

  async findByDate(date) {
    return this.filter(appt => appt.date === date);
  }

  async findByOwnerId(ownerId) {
    return this.filter(appt => appt.ownerId === ownerId);
  }

  async getUpcomingAppointments() {
    const appointments = await this.getAll();
    const now = new Date();
    return appointments.filter(appt => {
      const appointmentDate = new Date(`${appt.date}T${appt.time}`);
      return appointmentDate >= now && appt.status !== 'cancelled';
    }).sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
  }
}

export default new AppointmentRepository();

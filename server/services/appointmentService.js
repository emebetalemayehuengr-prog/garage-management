import db from '../database/db.js';

export class AppointmentService {
  async getAllAppointments(userId = null) {
    let appointments = db.getAll('appointments');
    
    if (userId) {
      appointments = appointments.filter(appt => appt.ownerId === userId);
    }
    
    return appointments.sort((a, b) => {
      const dateCompare = new Date(b.date) - new Date(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.time.localeCompare(a.time);
    });
  }

  async getAppointmentById(id) {
    const appointment = db.getById('appointments', id);
    if (!appointment) {
      throw new Error('Appointment not found');
    }
    return appointment;
  }

  async createAppointment(appointmentData) {
    // Validate customer exists
    const customer = db.getById('customers', appointmentData.customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }
    
    // Validate vehicle exists
    const vehicle = db.getById('vehicles', appointmentData.vehicleId);
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }
    
    // Check for time conflicts
    const existingAppointments = db.getAll('appointments').filter(
      appt => appt.date === appointmentData.date && appt.time === appointmentData.time && appt.status !== 'cancelled'
    );
    
    if (existingAppointments.length > 0) {
      throw new Error('Time slot already booked');
    }
    
    const newAppointment = await db.create('appointments', appointmentData);
    return newAppointment;
  }

  async updateAppointment(id, updates) {
    const updatedAppointment = db.update('appointments', id, updates);
    if (!updatedAppointment) {
      throw new Error('Appointment not found');
    }
    return updatedAppointment;
  }

  async deleteAppointment(id) {
    const appointment = db.getById('appointments', id);
    if (!appointment) {
      throw new Error('Appointment not found');
    }
    
    db.remove('appointments', id);
    return { message: 'Appointment deleted successfully' };
  }

  async getAppointmentsByCustomer(customerId) {
    const appointments = db.getAll('appointments');
    return appointments.filter(appt => appt.customerId === customerId);
  }

  async getAppointmentsByDate(date) {
    const appointments = db.getAll('appointments');
    return appointments.filter(appt => appt.date === date);
  }

  async getAppointmentsByOwner(ownerId) {
    const appointments = db.getAll('appointments');
    return appointments.filter(appt => appt.ownerId === ownerId);
  }

  async getUpcomingAppointments() {
    const appointments = db.getAll('appointments');
    const now = new Date();
    return appointments.filter(appt => {
      const appointmentDate = new Date(`${appt.date}T${appt.time}`);
      return appointmentDate >= now && appt.status !== 'cancelled';
    }).sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
  }

  async updateAppointmentStatus(id, status) {
    const updatedAppointment = db.update('appointments', id, { status });
    if (!updatedAppointment) {
      throw new Error('Appointment not found');
    }
    return updatedAppointment;
  }
}

export default new AppointmentService();

# Garage Management System

A comprehensive web-based garage management system built with React, Vite, and TailwindCSS. This application helps manage customers, vehicles, job cards, mechanics, inventory, billing, appointments, and reports.

## Features

### Core Workflow
1. **Customer Registration** - Register new customers with name, phone, and address
2. **Vehicle Registration** - Add vehicles with plate number, model, manufacturer, year, and mileage
3. **Job Card Creation** - Create service requests with problem descriptions and priority levels
4. **Vehicle Inspection** - Track inspection status
5. **Mechanic Assignment** - Assign available mechanics to job cards
6. **Diagnosis Tracking** - Track problem diagnosis progress
7. **Repair/Service Tracking** - Monitor repair progress
8. **Spare Parts Management** - Update inventory when parts are used
9. **Quality Check** - Track quality check and testing status
10. **Invoice Generation** - Create invoices with service charges and parts cost
11. **Payment Processing** - Record partial or full payments
12. **Vehicle Delivery** - Track vehicle delivery status
13. **Service Records** - Save complete service history

### Additional Features
- **User Management** - Role-based access (Admin, Manager, Mechanic, Cashier)
- **Appointment Management** - Book and manage service appointments
- **Inventory Management** - Track spare parts stock with low stock alerts
- **Reports & Analytics** - View revenue, customer statistics, job summaries, and financial reports

## Tech Stack

- **Frontend**: React 18
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **State Management**: React Context API

## Installation

1. Navigate to the project directory:
```bash
cd garage-management
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`)

## Usage

### Login
- For demo purposes, any username and password combination will work
- The system simulates user roles (Admin, Manager, Mechanic, Cashier)

### Dashboard Navigation
- **Dashboard** - Overview with statistics and recent activity
- **Customers** - Manage customer database
- **Vehicles** - Register and manage vehicles
- **Job Cards** - Create and track service requests
- **Mechanics** - View mechanic team and availability
- **Inventory** - Manage spare parts stock
- **Billing** - Create invoices and process payments
- **Appointments** - Book service appointments
- **Reports** - View business analytics and reports

## Project Structure

```
garage-management/
├── src/
│   ├── components/
│   │   ├── pages/
│   │   │   ├── DashboardHome.jsx
│   │   │   ├── Customers.jsx
│   │   │   ├── Vehicles.jsx
│   │   │   ├── JobCards.jsx
│   │   │   ├── Mechanics.jsx
│   │   │   ├── Inventory.jsx
│   │   │   ├── Billing.jsx
│   │   │   ├── Appointments.jsx
│   │   │   └── Reports.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Header.jsx
│   │   └── Login.jsx
│   ├── context/
│   │   └── GarageContext.jsx
│   ├── data/
│   │   └── models.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Build for Production

To create an optimized production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Preview Production Build

To preview the production build locally:

```bash
npm run preview
```

## Data Storage

Currently, the application uses in-memory state management (React Context). Data is not persisted between sessions. For production use, consider integrating:
- Local storage for basic persistence
- A backend API with database (PostgreSQL, MongoDB, etc.)
- Authentication system (JWT, OAuth)

## Future Enhancements

- SMS notifications for appointments
- Online booking system
- Maintenance reminders
- PDF invoice generation
- Advanced reporting with charts
- Multi-location support
- Mobile app version

## License

This project is created for demonstration purposes.

import React from 'react';
import {
  Car,
  CalendarCheck,
  Wrench,
  Receipt,
  Users,
  Package,
  BarChart3,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const features = [
  {
    icon: CalendarCheck,
    title: 'Appointments',
    description: 'Schedule and manage service bookings with an easy calendar view.',
  },
  {
    icon: Wrench,
    title: 'Job Cards',
    description: 'Track every repair from intake to completion with detailed job cards.',
  },
  {
    icon: Users,
    title: 'Customers & Vehicles',
    description: 'Full customer records linked to vehicle history and service logs.',
  },
  {
    icon: Receipt,
    title: 'Billing & Invoices',
    description: 'Generate invoices, track payments, and manage outstanding dues.',
  },
  {
    icon: Package,
    title: 'Inventory',
    description: 'Monitor parts stock levels and low-inventory alerts.',
  },
  {
    icon: BarChart3,
    title: 'Reports',
    description: 'Business insights on revenue, jobs, and staff performance.',
  },
];

const checklist = [
  'No installation required',
  'Works on any device',
  'Secure role-based access',
  'Free updates included',
];

const Landing = ({ onSignIn }) => {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">GarageManager</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onSignIn}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition"
            >
              Sign in
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 pt-16 pb-20">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              Garage management software
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1] text-gray-900">
              Run your garage on one simple dashboard
            </h1>
            <p className="mt-5 text-lg text-gray-600 leading-relaxed">
              Appointments, job cards, billing, inventory, and staff — manage
              the whole operation without spreadsheets.
            </p>
            <ul className="mt-6 space-y-2.5">
              {checklist.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-gray-700">
                  <CheckCircle2 className="w-4.5 h-4.5 text-green-600 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={onSignIn}
              className="mt-8 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3.5 rounded-xl transition shadow-sm"
            >
              Get started
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Dashboard preview card */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl rotate-2" />
            <div className="relative bg-white border border-gray-200 rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="ml-2 text-xs text-gray-400">dashboard</span>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-5">
                {['Today\'s Jobs', 'Revenue', 'Pending'].map((label, i) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">{label}</div>
                    <div className="text-lg font-bold text-gray-900">
                      {[12, '$4.2k', 8][i]}
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-2.5">
                {[
                  ['Brake repair — Toyota Camry', 'In progress'],
                  ['Oil change — Honda Civic', 'Scheduled'],
                  ['Engine diagnostic — Ford F-150', 'Waiting'],
                ].map(([job, status]) => (
                  <div
                    key={job}
                    className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border border-gray-100"
                  >
                    <span className="text-sm text-gray-700">{job}</span>
                    <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 px-6 py-20 border-y border-gray-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">
            Everything your shop needs
          </h2>
          <p className="text-gray-600 text-center max-w-xl mx-auto mb-12">
            From the front desk to the service bay, manage the whole operation
            without spreadsheets.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md hover:border-blue-200 transition"
              >
                <div className="bg-blue-50 text-blue-600 p-3 rounded-xl w-fit mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1.5">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto bg-blue-600 rounded-3xl p-10 md:p-14 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to streamline your garage?
          </h2>
          <p className="text-blue-100 mb-8 max-w-lg mx-auto">
            Sign in to access your dashboard and start managing jobs,
            customers, and billing today.
          </p>
          <button
            onClick={onSignIn}
            className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition"
          >
            Sign in to dashboard
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4" />
            <span>© {new Date().getFullYear()} GarageManager. All rights reserved.</span>
          </div>
          <span>Built for auto repair shops</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

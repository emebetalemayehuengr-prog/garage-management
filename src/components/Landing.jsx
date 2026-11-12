import React from 'react';
import { ArrowRight, CheckCircle2, Calendar, ClipboardList, DollarSign, Package, Users, BarChart3, Car, Shield, Wrench } from 'lucide-react';

const features = [
  {
    icon: Calendar,
    title: 'Appointments',
    description: 'Schedule and manage service bookings with an easy calendar view.',
  },
  {
    icon: ClipboardList,
    title: 'Job Cards',
    description: 'Track every repair from intake to completion with detailed job cards.',
  },
  {
    icon: Car,
    title: 'Customers & Vehicles',
    description: 'Full customer records linked to vehicle history and service logs.',
  },
  {
    icon: DollarSign,
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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">GarageManager</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onSignIn}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition min-h-[44px]"
            >
              Sign in
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 pt-12 sm:pt-24 pb-16 sm:pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-2">
                <Shield className="w-3 h-3" />
                Trusted by auto repair shops
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1] text-slate-900">
                Run your <span className="text-blue-600">garage</span> on one dashboard
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed">
                Appointments, job cards, billing, inventory, and staff — manage
                the whole operation without spreadsheets.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
                <button
                  onClick={onSignIn}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl transition shadow-lg shadow-blue-200 min-h-[48px]"
                >
                  Get started free
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-slate-50 transition min-h-[48px]"
                >
                  See demo
                </button>
              </div>

              <ul className="mt-8 flex flex-col gap-3 text-sm text-slate-600">
                {checklist.map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Hero visual - dashboard preview card */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl blur-2xl"></div>
              <div className="relative bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-3 flex items-center justify-between border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <span className="text-xs font-mono text-slate-400">garage.local/dashboard</span>
                </div>
                <div className="p-6">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Your Dashboard</div>
                    <div className="text-sm text-slate-400 italic">No data yet — start by adding your first job</div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <ClipboardList className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">Add your first job card</div>
                          <div className="text-xs text-slate-500">Track repairs from intake to completion</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Wrench className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">Add your first spare part</div>
                          <div className="text-xs text-slate-500">Monitor inventory and stock levels</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 px-4 py-16 sm:px-6 sm:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">Everything your shop needs</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              From the front desk to the service bay, manage the whole operation without spreadsheets.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 hover:shadow-lg hover:border-blue-200 transition group"
              >
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="max-w-2xl mx-auto bg-blue-600 rounded-2xl p-6 sm:p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-500/10"></div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 relative z-10">Ready to streamline your garage?</h2>
          <p className="text-blue-100 mb-6 relative z-10 max-w-md mx-auto sm:max-w-lg">
            Sign in to access your dashboard and start managing jobs, customers, and billing today.
          </p>
          <button
            onClick={onSignIn}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-blue-700 font-semibold px-8 py-4 rounded-xl hover:bg-blue-50 transition shadow-lg min-h-[48px] relative z-10"
          >
            Sign in to dashboard
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-4 py-6 sm:px-6 sm:py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} GarageManager. All rights reserved.</span>
          </div>
          <span className="font-medium">Built for auto repair shops</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

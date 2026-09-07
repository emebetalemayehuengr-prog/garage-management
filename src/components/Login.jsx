import React, { useState } from 'react';
import { Car, User, Lock, AlertCircle, Eye, EyeOff, Sparkles, CreditCard, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
    } catch {
      // Error is handled by the store
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:block text-white space-y-8 pl-8">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-400/20 rounded-2xl blur-xl"></div>
              <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl shadow-2xl">
                <Car className="w-10 h-10 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">GarageMS</h1>
              <p className="text-slate-400 text-sm mt-0.5">Management System</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-4xl font-bold leading-tight">
              Streamline Your<br />
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Garage Operations</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Manage customers, vehicles, job cards, inventory, and billing all in one place. Built for efficiency.
            </p>

            <div className="flex items-center space-x-6 pt-4">
              <div className="flex items-center space-x-2 text-sm text-slate-300">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Smart Dashboard</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-300">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Real-time Reports</span>
              </div>
            </div>

            {/* Subscription Card */}
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 rounded-xl bg-blue-500/20">
                  <CreditCard className="w-5 h-5 text-blue-300" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Subscription</p>
                  <p className="text-xs text-slate-400">Simple, transparent pricing</p>
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-white">1,700</span>
                <span className="text-lg text-slate-300">ETB</span>
                <span className="text-sm text-slate-400">/ month</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">Everything included. No hidden fees.</p>
            </div>

            {/* Contact */}
            <div className="mt-4 flex items-center space-x-2 text-sm text-slate-300">
              <Phone className="w-4 h-4 text-blue-400" />
              <span>Contact: 0969801746</span>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
            {/* Mobile Logo */}
            <div className="lg:hidden flex flex-col items-center mb-6">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-xl mb-3 shadow-lg">
                <Car className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Garage Management</h1>
              <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
            </div>

            {/* Mobile Subscription Badge */}
            <div className="lg:hidden mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-semibold text-gray-700">Subscription</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-gray-900">1,700 ETB</span>
                  <span className="text-xs text-gray-500 block">per month</span>
                </div>
              </div>
            </div>

            {/* Mobile Contact */}
            <div className="lg:hidden mb-6 flex items-center justify-center space-x-2 text-sm text-gray-600">
              <Phone className="w-4 h-4 text-blue-600" />
              <span>Contact: 0969801746</span>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:block mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
              <p className="text-gray-500 mt-1">Sign in to your account to continue</p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3 animate-shake">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <span className="text-sm text-red-700 font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors group-focus-within:text-blue-600" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50/50 hover:bg-white hover:border-gray-300"
                    placeholder="Enter your username"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors group-focus-within:text-blue-600" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50/50 hover:bg-white hover:border-gray-300"
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-blue-600 focus:text-blue-600 focus:outline-none rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Signing in...</span>
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs text-center text-gray-500">
                Secure authentication powered by GarageMS
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

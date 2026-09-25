import React, { useState } from 'react';
import {
  AlertCircle,
  Car,
  CreditCard,
  Eye,
  EyeOff,
  Home,
  Lock,
  Monitor,
  Phone,
  Sparkles,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await login(username, password);
    } catch {
      // The authentication store presents the error below.
    }
  };

  return (
    <div className="tv-signin min-h-screen bg-[#03080d] text-white">
      <aside className="tv-rail" aria-label="Garage Management">
        <div className="tv-rail-brand" aria-hidden="true">
          <Monitor />
        </div>
        <div className="tv-rail-links" aria-hidden="true">
          <div className="tv-rail-item tv-rail-item-active">
            <Home />
            <span>Home</span>
          </div>
          <div className="tv-rail-item">
            <Sparkles />
            <span>Features</span>
          </div>
          <div className="tv-rail-item">
            <CreditCard />
            <span>Pricing</span>
          </div>
        </div>
        <div className="tv-rail-item tv-rail-contact" aria-hidden="true">
          <Phone />
          <span>Contact</span>
        </div>
      </aside>

      <main className="tv-signin-stage">
        <section className="tv-hero" aria-labelledby="login-hero-title">
          <div className="tv-hero-logo">
            <span className="tv-logo-icon">
              <Car />
            </span>
            <div>
              <strong>GarageMS</strong>
              <small>MANAGEMENT SYSTEM</small>
            </div>
          </div>
          <div className="tv-hero-image" aria-hidden="true" />
          <p className="tv-eyebrow">SMART GARAGE OPERATIONS</p>
          <h1 id="login-hero-title">
            YOUR GARAGE,
            <br />
            YOUR WAY.
          </h1>
          <p className="tv-hero-copy">
            Customers, vehicles, job cards and billing—managed together, from anywhere.
          </p>
        </section>

        <section className="tv-login-panel" aria-labelledby="signin-title">
          <div className="tv-login-heading">
            <h2 id="signin-title">Sign In</h2>
            <p>Enter your details to continue.</p>
          </div>

          {error && (
            <div className="tv-login-error" role="alert">
              <AlertCircle />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="tv-login-form">
            <label htmlFor="username">Username</label>
            <div className="tv-input-wrap">
              <User aria-hidden="true" />
              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter your username"
                autoComplete="username"
                required
              />
            </div>

            <label htmlFor="password">Password</label>
            <div className="tv-input-wrap">
              <Lock aria-hidden="true" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="tv-password-toggle"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            <button type="submit" className="tv-submit" disabled={isLoading}>
              {isLoading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="tv-panel-footer">
            <span>GarageMS secure access</span>
            <span>Support: 0969801746</span>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Login;

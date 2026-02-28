import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const themeBg = 'bg-gradient-to-br from-[#020209] via-[#07071a] to-[#1a2a3a]';
const cardBg = 'bg-[#07071a] border border-[#1a2a3a] shadow-2xl';
const accent = 'text-[#a78bfa]';
const buttonPrimary = 'bg-gradient-to-r from-[#4dffb4] to-[#60a5fa] text-black font-bold';
const buttonSecondary = 'bg-gradient-to-r from-[#b482ff] to-[#f472b6] text-white font-bold';
const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? 'http://localhost:4000/api/login' : 'http://localhost:4000/api/signup';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error');
      setUser(data.user || null);
      // Redirect to dashboard on success
      navigate('/', { state: { user: data.user } });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen ${themeBg}`}>
      <form
        onSubmit={handleSubmit}
        className={`w-full max-w-md mx-auto p-8 rounded-2xl ${cardBg}`}
        style={{ boxShadow: '0 8px 32px #1a2a3a' }}
      >
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-[#1a2a3a] mb-2 border-2 border-[#4dffb4]">
            <span style={{ fontSize: '2.5rem' }}>👤</span>
          </div>
          <h2 className={`text-3xl font-extrabold mb-1 ${accent} font-mono text-center`} style={{ letterSpacing: '2px' }}>
            {isLogin ? 'Login' : 'Sign Up'}
          </h2>
          <div className="text-xs text-[#4a5568] tracking-widest font-mono-display">SOCIAL AUTOPILOT</div>
        </div>
        {!isLogin && (
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            className="mb-4 w-full p-3 rounded-lg bg-[#020209] border border-[#4dffb4] text-[#e2e8f0] focus:outline-none focus:border-[#a78bfa]"
            required
          />
        )}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="mb-4 w-full p-3 rounded-lg bg-[#020209] border border-[#4dffb4] text-[#e2e8f0] focus:outline-none focus:border-[#a78bfa]"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="mb-4 w-full p-3 rounded-lg bg-[#020209] border border-[#4dffb4] text-[#e2e8f0] focus:outline-none focus:border-[#a78bfa]"
          required
        />
        {error && <div className="text-red-500 mb-2 text-center font-semibold">{error}</div>}
        <button
          type="submit"
          className={`w-full py-3 rounded-lg mt-2 mb-2 ${buttonPrimary} hover:from-[#60a5fa] hover:to-[#4dffb4] transition-all`}
        >
          {isLogin ? 'Login' : 'Sign Up'}
        </button>
        <button
          type="button"
          className={`w-full py-3 rounded-lg mb-2 ${buttonSecondary} hover:from-[#f472b6] hover:to-[#b482ff] transition-all`}
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
        </button>
        <div className="flex justify-between mt-4">
          <button
            type="button"
            className="text-xs text-[#b482ff] underline font-bold"
            onClick={() => setForm({ email: '', password: '', name: '' })}
          >
            Clear
          </button>
          <button
            type="button"
            className="text-xs text-[#f472b6] underline font-bold"
            onClick={() => navigate('/')}
          >
            Back to Dashboard
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginSignup;

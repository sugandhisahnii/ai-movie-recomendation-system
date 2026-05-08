import { useContext, useState } from 'react';
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const normalizedEmail = email.trim().toLowerCase();
    if (!emailRegex.test(normalizedEmail)) {
      setError('Enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Password is required.');
      return;
    }

    setSubmitting(true);
    try {
      await login(normalizedEmail, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not sign in right now.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative hidden overflow-hidden lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(239,68,68,0.22),_transparent_35%),linear-gradient(135deg,#09090b_0%,#111827_42%,#0f172a_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.04)_40%,transparent_80%)]" />

          <div className="relative z-10 flex h-full w-full flex-col justify-between px-12 py-14">
            <div>
              <Link to="/" className="text-5xl font-black tracking-tight text-netflix-red">AIMOVIE</Link>
              <p className="mt-6 max-w-xl text-5xl font-black leading-tight">
                Your watchlist, search history and recommendations stay synced.
              </p>
              <p className="mt-6 max-w-lg text-lg leading-8 text-gray-300">
                Sign in to unlock smarter movie discovery, persistent lists and sharper language-based recommendations.
              </p>
            </div>

            <div className="grid max-w-2xl gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <ShieldCheck className="mb-4 text-netflix-red" size={24} />
                <h3 className="font-semibold">Secure auth</h3>
                <p className="mt-2 text-sm text-gray-400">JWT-based sessions with backend validation.</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <Mail className="mb-4 text-netflix-red" size={24} />
                <h3 className="font-semibold">One identity</h3>
                <p className="mt-2 text-sm text-gray-400">Use one email across watchlist, search and profile.</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <LockKeyhole className="mb-4 text-netflix-red" size={24} />
                <h3 className="font-semibold">Private lists</h3>
                <p className="mt-2 text-sm text-gray-400">Save titles and keep your picks tied to your account.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-10">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-400">Welcome Back</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight">Sign in</h1>
              <p className="mt-3 text-gray-400">Access your personalized movie space.</p>
            </div>

            {error ? (
              <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-300">Email</span>
                <div className="flex items-center rounded-2xl border border-white/10 bg-[#111827] px-4">
                  <Mail size={18} className="text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-transparent px-3 py-4 text-white outline-none placeholder:text-gray-500"
                    autoComplete="email"
                    required
                  />
                </div>
              </label>

              <label className="block">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-300">Password</span>
                  <span className="text-xs text-gray-500">Minimum 8 characters</span>
                </div>
                <div className="flex items-center rounded-2xl border border-white/10 bg-[#111827] px-4">
                  <LockKeyhole size={18} className="text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-transparent px-3 py-4 text-white outline-none placeholder:text-gray-500"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="text-gray-400 transition hover:text-white"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-netflix-red px-5 py-4 text-base font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-8 text-sm text-gray-400">
              New to AIMOVIE?{' '}
              <Link to="/register" className="font-semibold text-white hover:text-netflix-red transition">
                Create an account
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;

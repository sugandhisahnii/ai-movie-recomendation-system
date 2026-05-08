import { useContext, useMemo, useState } from 'react';
import { Eye, EyeOff, LockKeyhole, Mail, Sparkles, User } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getPasswordChecks = (password) => ({
  minLength: password.length >= 8,
  hasLetter: /[A-Za-z]/.test(password),
  hasNumber: /[0-9]/.test(password)
});

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const passwordChecks = useMemo(() => getPasswordChecks(password), [password]);
  const passwordStrength = Object.values(passwordChecks).filter(Boolean).length;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedName.length < 2) {
      setError('Enter your full name.');
      return;
    }

    if (!emailRegex.test(normalizedEmail)) {
      setError('Enter a valid email address.');
      return;
    }

    if (passwordStrength < 3) {
      setError('Use a stronger password with 8+ characters, letters and numbers.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await register(normalizedName, normalizedEmail, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create your account right now.');
    } finally {
      setSubmitting(false);
    }
  };

  const checkClass = (passed) => (
    passed ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200' : 'border-white/10 bg-white/5 text-gray-400'
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
        <section className="flex items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-10">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-400">Create Account</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight">Join AIMOVIE</h1>
              <p className="mt-3 text-gray-400">Save your watchlist, login securely and get sharper recommendations.</p>
            </div>

            {error ? (
              <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-300">Full Name</span>
                <div className="flex items-center rounded-2xl border border-white/10 bg-[#111827] px-4">
                  <User size={18} className="text-gray-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Sugandhi Sahni"
                    className="w-full bg-transparent px-3 py-4 text-white outline-none placeholder:text-gray-500"
                    autoComplete="name"
                    required
                  />
                </div>
              </label>

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
                <span className="mb-2 block text-sm font-medium text-gray-300">Password</span>
                <div className="flex items-center rounded-2xl border border-white/10 bg-[#111827] px-4">
                  <LockKeyhole size={18} className="text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Create a password"
                    className="w-full bg-transparent px-3 py-4 text-white outline-none placeholder:text-gray-500"
                    autoComplete="new-password"
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

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-300">Confirm Password</span>
                <div className="flex items-center rounded-2xl border border-white/10 bg-[#111827] px-4">
                  <LockKeyhole size={18} className="text-gray-500" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Repeat your password"
                    className="w-full bg-transparent px-3 py-4 text-white outline-none placeholder:text-gray-500"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    className="text-gray-400 transition hover:text-white"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className={`rounded-2xl border px-3 py-3 text-xs ${checkClass(passwordChecks.minLength)}`}>
                  8+ characters
                </div>
                <div className={`rounded-2xl border px-3 py-3 text-xs ${checkClass(passwordChecks.hasLetter)}`}>
                  At least 1 letter
                </div>
                <div className={`rounded-2xl border px-3 py-3 text-xs ${checkClass(passwordChecks.hasNumber)}`}>
                  At least 1 number
                </div>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full transition-all ${
                    passwordStrength === 3 ? 'bg-emerald-500' : passwordStrength === 2 ? 'bg-amber-400' : 'bg-netflix-red'
                  }`}
                  style={{ width: `${(passwordStrength / 3) * 100}%` }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-netflix-red px-5 py-4 text-base font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-8 text-sm text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-white hover:text-netflix-red transition">
                Sign in
              </Link>
            </div>
          </div>
        </section>

        <section className="relative hidden overflow-hidden lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(239,68,68,0.2),_transparent_32%),linear-gradient(135deg,#0f172a_0%,#09090b_48%,#111827_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,rgba(255,255,255,0.05)_35%,transparent_70%)]" />

          <div className="relative z-10 flex h-full w-full flex-col justify-between px-12 py-14">
            <div>
              <Link to="/" className="text-5xl font-black tracking-tight text-netflix-red">AIMOVIE</Link>
              <p className="mt-6 max-w-xl text-5xl font-black leading-tight">
                Build your own smarter movie corner.
              </p>
              <p className="mt-6 max-w-lg text-lg leading-8 text-gray-300">
                Register once and keep recommendations, saved titles and browsing preferences tied to your account.
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <div className="mb-4 inline-flex rounded-2xl bg-netflix-red/15 p-3 text-netflix-red">
                  <Sparkles size={20} />
                </div>
                <h3 className="text-xl font-semibold">Smarter recommendations</h3>
                <p className="mt-2 text-sm leading-7 text-gray-400">
                  Your account connects ML recommendations, language lanes and saved watchlists into one personalized experience.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <h3 className="text-xl font-semibold">What you get</h3>
                <ul className="mt-3 space-y-3 text-sm text-gray-300">
                  <li>Persistent watchlist across sessions</li>
                  <li>Protected user account with hashed password</li>
                  <li>Clean login flow without fake demo bypass</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Register;

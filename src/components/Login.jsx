import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

/* ============================================================
   EDIT THESE DETAILS (put your real farm information here)
   ============================================================ */
const FARM = {
  name: 'Mohsin Cattle Farms',
  tagline: 'Fresh milk and healthy cattle, straight from our farm.',
  phone: '+92 300 0000000',
  whatsapp: '923000000000', // country code + number, digits only (no + or spaces)
  email: 'info@example.com',
  address: 'Add your farm address here',
  hours: 'Daily, 6:00 AM – 8:00 PM',
};

const OFFERS = [
  { icon: '🥛', title: 'Fresh Milk', text: 'Pure milk, collected and supplied fresh every day.' },
  { icon: '🐄', title: 'Cattle & Livestock', text: 'Healthy cows, buffaloes and goats, raised with care.' },
  { icon: '📦', title: 'Custom Orders', text: 'Need something specific? Tell us and we will arrange it.' },
];

const WHY = [
  { title: 'Fresh every day', text: 'Milk goes from our farm to you without delay.' },
  { title: 'Well-cared animals', text: 'Our herd is looked after and monitored closely.' },
  { title: 'Direct from the farm', text: 'No middlemen. You deal directly with us.' },
];

const ORDER_TYPES = ['Fresh Milk', 'Cattle / Livestock', 'Custom Order'];

// Put your photos in the "public/images" folder with these names
const HERO_IMAGE = '/images/hero.jpg';
const GALLERY = [
  { src: '/images/farm-1.jpg', emoji: '🐄' },
  { src: '/images/farm-2.jpg', emoji: '🐃' },
  { src: '/images/farm-3.jpg', emoji: '🥛' },
  { src: '/images/farm-4.jpg', emoji: '🌾' },
  { src: '/images/farm-5.jpg', emoji: '🐐' },
  { src: '/images/farm-6.jpg', emoji: '🚜' },
];

const PORTALS = {
  customer: {
    icon: '🛒',
    title: 'Customer Login',
    text: 'Check your orders and payments.',
    role: 'customer',
  },
  owner: {
    icon: '👑',
    title: 'Owner Login',
    text: 'View all farm records (read-only).',
    role: 'viewer',
  },
  admin: {
    icon: '🛠️',
    title: 'Admin Login',
    text: 'Manage animals, milk, customers and sales.',
    role: 'admin',
  },
};

const inputClass =
  'mt-1 block w-full rounded-lg border border-[#d9ceb4] bg-white px-3 py-2.5 text-sm text-[#1c2b21] placeholder-[#a89c80] focus:border-[#1f4d34] focus:outline-none focus:ring-2 focus:ring-[#1f4d34]/30';
const labelClass = 'block text-sm font-medium text-[#3d4a40]';
const btnPrimary =
  'rounded-full bg-[#1f4d34] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#163a27] disabled:opacity-60';
const btnAccent =
  'rounded-full bg-[#c9772b] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#b3661f]';
const btnOutline =
  'rounded-full border border-[#1f4d34] px-5 py-2.5 text-sm font-semibold text-[#1f4d34] transition hover:bg-[#1f4d34] hover:text-white';

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* Shows your photo, or a soft placeholder if the photo is not added yet */
function FarmImage({ src, alt, className = '', emoji = '🐄', eager = false }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex items-center justify-center bg-gradient-to-br from-[#e3d5b0] to-[#bfae7e] text-6xl ${className}`}
      >
        {emoji}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}

/* Sign In / Sign Up pop-up */
function AuthModal({ view, portal, setView, setPortal, onClose, onVisitor, startInfo }) {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState(startInfo || '');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const go = (nextView, nextPortal) => {
    setError('');
    setInfo('');
    if (nextPortal) setPortal(nextPortal);
    setView(nextView);
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setBusy(true);
    // App.jsx compares this with the real role of the account after login
    sessionStorage.setItem('cm_portal', portal);
    const { error: signInError } = await signIn(email, password);
    if (signInError) {
      sessionStorage.removeItem('cm_portal');
      setError(signInError.message);
    }
    setBusy(false);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setBusy(true);
    sessionStorage.setItem('cm_portal', 'customer');
    const { data, error: signUpError } = await signUp(email, password, fullName);
    if (signUpError) {
      sessionStorage.removeItem('cm_portal');
      setError(signUpError.message);
    } else if (!data?.session) {
      sessionStorage.removeItem('cm_portal');
      setPortal('customer');
      setView('signin');
      setInfo('Account created. Check your email to confirm it, then sign in here.');
    }
    setBusy(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-[#fffdf7] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-3 text-2xl leading-none text-[#7a6a45] hover:text-[#1c2b21]"
        >
          ×
        </button>

        {view === 'choose' && (
          <div>
            <h2 className="font-display text-2xl font-bold text-[#1c2b21]">Sign in</h2>
            <p className="mt-1 text-sm text-[#5d6b60]">Choose how you would like to continue.</p>

            <div className="mt-5 space-y-3">
              {Object.entries(PORTALS).map(([key, p]) => (
                <button
                  key={key}
                  onClick={() => go('signin', key)}
                  className="flex w-full items-center gap-4 rounded-xl border border-[#e6dcc4] bg-white p-4 text-left transition hover:border-[#1f4d34] hover:shadow-md"
                >
                  <span className="text-3xl">{p.icon}</span>
                  <span>
                    <span className="block font-semibold text-[#1c2b21]">{p.title}</span>
                    <span className="block text-sm text-[#5d6b60]">{p.text}</span>
                  </span>
                </button>
              ))}

              <button
                onClick={onVisitor}
                className="flex w-full items-center gap-4 rounded-xl border border-dashed border-[#c9772b] bg-[#fdf3e4] p-4 text-left transition hover:shadow-md"
              >
                <span className="text-3xl">👋</span>
                <span>
                  <span className="block font-semibold text-[#1c2b21]">I am a visitor</span>
                  <span className="block text-sm text-[#5d6b60]">
                    Just exploring? Contact us or place an order, no account needed.
                  </span>
                </span>
              </button>
            </div>
          </div>
        )}

        {view === 'signin' && (
          <div>
            <button
              onClick={() => go('choose')}
              className="text-sm font-medium text-[#1f4d34] hover:underline"
            >
              ← Back
            </button>
            <h2 className="mt-2 font-display text-2xl font-bold text-[#1c2b21]">
              {PORTALS[portal].icon} {PORTALS[portal].title}
            </h2>
            <p className="mt-1 text-sm text-[#5d6b60]">{PORTALS[portal].text}</p>

            {info && (
              <div className="mt-4 rounded-lg border border-green-300 bg-green-50 px-4 py-2 text-sm text-green-800">
                {info}
              </div>
            )}
            {error && (
              <div className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSignIn} className="mt-5 space-y-4">
              <div>
                <label className={labelClass}>Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                />
              </div>
              <button type="submit" disabled={busy} className={`${btnPrimary} w-full`}>
                {busy ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {portal === 'customer' && (
              <p className="mt-4 text-center text-sm text-[#5d6b60]">
                New customer?{' '}
                <button
                  onClick={() => go('signup')}
                  className="font-semibold text-[#1f4d34] hover:underline"
                >
                  Create an account
                </button>
              </p>
            )}
          </div>
        )}

        {view === 'signup' && (
          <div>
            <button
              onClick={() => go('choose')}
              className="text-sm font-medium text-[#1f4d34] hover:underline"
            >
              ← Back
            </button>
            <h2 className="mt-2 font-display text-2xl font-bold text-[#1c2b21]">
              Create a customer account
            </h2>
            <p className="mt-1 text-sm text-[#5d6b60]">
              Sign up to follow your orders and payments with {FARM.name}.
            </p>

            {error && (
              <div className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSignUp} className="mt-5 space-y-4">
              <div>
                <label className={labelClass}>Full name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Password (at least 6 characters)</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                />
              </div>
              <button type="submit" disabled={busy} className={`${btnPrimary} w-full`}>
                {busy ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-[#5d6b60]">
              Already have an account?{' '}
              <button
                onClick={() => go('signin', 'customer')}
                className="font-semibold text-[#1f4d34] hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Login() {
  const [view, setView] = useState('closed'); // closed | choose | signin | signup
  const [portal, setPortal] = useState('customer');
  const [notice, setNotice] = useState(() => sessionStorage.getItem('cm_portal_error') || '');
  const [order, setOrder] = useState({
    name: '',
    phone: '',
    type: ORDER_TYPES[0],
    details: '',
  });

  useEffect(() => {
    sessionStorage.removeItem('cm_portal_error');
  }, []);

  const closeModal = () => setView('closed');

  const goVisitor = () => {
    setView('closed');
    setTimeout(() => scrollToId('order'), 50);
  };

  const sendOrder = (e) => {
    e.preventDefault();
    const text = [
      `New order enquiry for ${FARM.name}`,
      `Name: ${order.name}`,
      `Phone: ${order.phone}`,
      `Order type: ${order.type}`,
      `Details: ${order.details || '-'}`,
    ].join('\n');
    window.open(
      `https://wa.me/${FARM.whatsapp}?text=${encodeURIComponent(text)}`,
      '_blank',
      'noopener'
    );
  };

  return (
    <div id="top" className="min-h-screen bg-[#f8f3e8] font-sans text-[#1c2b21]">
      {/* ---------- Header ---------- */}
      <header className="sticky top-0 z-40 border-b border-[#e6dcc4] bg-[#f8f3e8]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <button onClick={() => scrollToId('top')} className="flex items-center gap-3 text-left">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1f4d34] text-xl">
              🐄
            </span>
            <span className="leading-tight">
              <span className="block font-display text-lg font-bold">{FARM.name}</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8a7a52]">
                Cow Mania ERP
              </span>
            </span>
          </button>

          <nav className="hidden items-center gap-7 text-sm font-medium text-[#3d4a40] md:flex">
            <button onClick={() => scrollToId('about')} className="hover:text-[#1f4d34]">
              About
            </button>
            <button onClick={() => scrollToId('gallery')} className="hover:text-[#1f4d34]">
              Gallery
            </button>
            <button onClick={() => scrollToId('order')} className="hover:text-[#1f4d34]">
              Contact &amp; Orders
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={() => setView('choose')} className={btnOutline}>
              Sign In
            </button>
            <button
              onClick={() => {
                setPortal('customer');
                setView('signup');
              }}
              className={btnPrimary}
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {notice && (
        <div className="border-b border-amber-300 bg-amber-50 px-4 py-3 text-center text-sm text-amber-900">
          {notice}{' '}
          <button
            onClick={() => setNotice('')}
            className="ml-2 font-semibold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ---------- Hero ---------- */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 lg:grid-cols-2 lg:py-20">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#c9772b]">
            Dairy &amp; cattle farm
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            {FARM.tagline}
          </h1>
          <p className="mt-5 max-w-lg text-lg text-[#4b5a4f]">
            Welcome to {FARM.name}. Get to know our farm, reach out to us, or place an order today.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={() => scrollToId('order')} className={btnAccent}>
              Place an Order
            </button>
            <button onClick={() => scrollToId('order')} className={btnOutline}>
              Contact Us
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -bottom-4 -right-4 h-full w-full rounded-3xl bg-[#1f4d34]" />
          <FarmImage
            src={HERO_IMAGE}
            alt={`${FARM.name} farm`}
            emoji="🐄"
            eager
            className="relative aspect-[4/3] w-full rounded-3xl shadow-xl"
          />
        </div>
      </section>

      {/* ---------- About / What we offer ---------- */}
      <section id="about" className="scroll-mt-20 bg-[#efe6d2] py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">What we offer</h2>
          <p className="mt-2 max-w-2xl text-[#4b5a4f]">
            {FARM.name} raises healthy animals and supplies fresh farm products to families and
            businesses.
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {OFFERS.map((o) => (
              <div key={o.title} className="rounded-2xl border border-[#e0d4b8] bg-[#fffdf7] p-6">
                <div className="text-4xl">{o.icon}</div>
                <h3 className="mt-3 font-display text-xl font-bold">{o.title}</h3>
                <p className="mt-1 text-sm text-[#5d6b60]">{o.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {WHY.map((w, i) => (
              <div key={w.title} className="flex gap-4">
                <span className="font-display text-4xl font-bold text-[#c9772b]">{i + 1}</span>
                <div>
                  <h3 className="font-semibold">{w.title}</h3>
                  <p className="text-sm text-[#5d6b60]">{w.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Gallery ---------- */}
      <section id="gallery" className="scroll-mt-20 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Life at the farm</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
            {GALLERY.map((g, i) => (
              <div key={g.src} className="group overflow-hidden rounded-2xl">
                <FarmImage
                  src={g.src}
                  alt={`${FARM.name} photo ${i + 1}`}
                  emoji={g.emoji}
                  className="aspect-square w-full transition duration-500 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Contact & Orders (visitors) ---------- */}
      <section id="order" className="scroll-mt-20 bg-[#1f4d34] py-16 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Contact us &amp; place an order</h2>
          <p className="mt-2 max-w-2xl text-white/80">
            Visitors are always welcome. No account is needed to contact us or send an order.
          </p>

          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl bg-white/10 p-6">
              <h3 className="font-display text-xl font-bold">Farm details</h3>
              <ul className="mt-4 space-y-4 text-sm">
                <li className="flex gap-3">
                  <span>📞</span>
                  <a href={`tel:${FARM.phone.replace(/\s/g, '')}`} className="hover:underline">
                    {FARM.phone}
                  </a>
                </li>
                <li className="flex gap-3">
                  <span>💬</span>
                  <a
                    href={`https://wa.me/${FARM.whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline"
                  >
                    Chat on WhatsApp
                  </a>
                </li>
                <li className="flex gap-3">
                  <span>✉️</span>
                  <a href={`mailto:${FARM.email}`} className="hover:underline">
                    {FARM.email}
                  </a>
                </li>
                <li className="flex gap-3">
                  <span>📍</span>
                  <span>{FARM.address}</span>
                </li>
                <li className="flex gap-3">
                  <span>🕒</span>
                  <span>{FARM.hours}</span>
                </li>
              </ul>
            </div>

            <form onSubmit={sendOrder} className="rounded-2xl bg-[#fffdf7] p-6 text-[#1c2b21]">
              <h3 className="font-display text-xl font-bold">Order enquiry</h3>
              <div className="mt-4 space-y-4">
                <div>
                  <label className={labelClass}>Your name</label>
                  <input
                    type="text"
                    required
                    value={order.name}
                    onChange={(e) => setOrder({ ...order, name: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Phone number</label>
                  <input
                    type="tel"
                    required
                    value={order.phone}
                    onChange={(e) => setOrder({ ...order, phone: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>What would you like?</label>
                  <select
                    value={order.type}
                    onChange={(e) => setOrder({ ...order, type: e.target.value })}
                    className={inputClass}
                  >
                    {ORDER_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Details (quantity, delivery place, etc.)</label>
                  <textarea
                    rows={3}
                    value={order.details}
                    onChange={(e) => setOrder({ ...order, details: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <button type="submit" className={`${btnAccent} w-full`}>
                  Send order on WhatsApp
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="bg-[#163a27] py-6 text-center text-sm text-white/70">
        © {new Date().getFullYear()} {FARM.name}. Managed with Cow Mania ERP.
      </footer>

      {view !== 'closed' && (
        <AuthModal
          view={view}
          portal={portal}
          setView={setView}
          setPortal={setPortal}
          onClose={closeModal}
          onVisitor={goVisitor}
        />
      )}
    </div>
  );
}
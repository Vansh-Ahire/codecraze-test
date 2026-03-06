import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/book', label: 'Book Slot' },
  { to: '/payment', label: 'Payment' },
  { to: '/bookings', label: 'My Bookings' },
  { to: '/contact', label: 'Contact' },
];

const Navbar = ({ onLoginClick }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });

    // Check for user login state
    const checkUser = () => {
      const u = localStorage.getItem('parkeasy_user');
      if (u) setUser(JSON.parse(u));
      else setUser(null);
    };

    checkUser();
    window.addEventListener('storage', checkUser);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('storage', checkUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('parkeasy_token');
    localStorage.removeItem('parkeasy_user');
    setUser(null);
    window.location.href = '/';
  };

  const dynamicLinks = [...navLinks];
  if (user?.role === 'admin') {
    dynamicLinks.push({ to: '/admin', label: 'Admin Dashboard' });
    dynamicLinks.push({ to: '/admin/bookings', label: 'Manage All' });
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-white/98 backdrop-blur-xl border-b border-gray-200/80 shadow-sm'
        : 'bg-white/90 backdrop-blur-md border-b border-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-[60px]">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-8 h-8 rounded-[9px] icon-purple flex items-center justify-center shadow-sm transition-transform duration-200 group-hover:scale-105">
              <span className="text-sm">🚗</span>
            </div>
            <span className="text-[17px] font-bold tracking-tight gradient-text">ParkMate</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {dynamicLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${isActive
                    ? 'text-violet-700 bg-violet-50'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/80'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Right */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-[13px] font-medium text-gray-700">
                  <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600">
                    <FaBars className="text-[10px]" />
                  </div>
                  {user.name || user.username}
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-ghost text-[12px] px-3 py-1.5 !rounded-lg"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/admin-login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost text-[13px] px-4 py-2 !rounded-lg border border-violet-100 hover:bg-violet-50"
                >
                  Admin Portal
                </Link>
                <button
                  onClick={onLoginClick}
                  id="navbar-login-btn"
                  className="btn-primary text-[13.5px] px-4 py-2"
                >
                  LogIn
                </button>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition"
          >
            {menuOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 animate-fade-up">
          <div className="px-5 py-3 space-y-0.5">
            {dynamicLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                    ? 'text-violet-700 bg-violet-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="pt-2 pb-1">
              {user ? (
                <button
                  onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="w-full btn-ghost py-2.5"
                >
                  Logout
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/admin"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMenuOpen(false)}
                    className="w-full btn-ghost py-2.5 text-center border border-gray-100"
                  >
                    Admin Portal
                  </Link>
                  <button
                    onClick={() => { onLoginClick(); setMenuOpen(false); }}
                    className="w-full btn-primary py-2.5"
                  >
                    Login
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

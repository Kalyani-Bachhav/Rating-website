import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Store, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X, 
  Star
} from 'lucide-react';

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  // Compile role-specific navigation items
  const getNavItems = () => {
    if (!user) return [];
    
    const items = [];
    if (user.role === 'ADMIN') {
      items.push(
        { label: 'Admin Center', path: '/admin-dashboard', icon: LayoutDashboard }
      );
    } else if (user.role === 'STORE_OWNER') {
      items.push(
        { label: 'Store Dashboard', path: '/owner-dashboard', icon: LayoutDashboard }
      );
    } else if (user.role === 'USER') {
      items.push(
        { label: 'Explore Stores', path: '/user-dashboard', icon: Store }
      );
    }
    
    items.push({ label: 'My Profile', path: '/profile', icon: UserIcon });
    return items;
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-neo-bg text-black selection:bg-neo-accent selection:text-black font-sans">
      {/* Sidebar for desktop devices */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r-4 border-black sticky top-0 h-screen p-6 z-20">
        <div className="flex items-center gap-3 mb-10 px-2 group">
          <div className="p-2 border-4 border-black bg-neo-secondary shadow-neo-sm group-hover:rotate-6 transition-transform duration-200">
            <Star className="h-6 w-6 stroke-[3px] text-black fill-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter text-black m-0 leading-none">RateLocal</h1>
            <span className="text-xs text-black uppercase tracking-[0.2em] font-bold">Store Ratings</span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 space-y-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 font-bold uppercase tracking-wider text-sm transition-all duration-100 ${
                  active
                    ? 'bg-neo-secondary border-4 border-black text-black shadow-neo-sm translate-x-1'
                    : 'bg-white border-4 border-transparent text-black hover:border-black hover:bg-neo-secondary hover:shadow-neo-sm active:translate-x-1 active:translate-y-1 active:shadow-none'
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? 'stroke-[3px]' : 'stroke-[2.5px]'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom controls */}
        <div className="pt-6 border-t-4 border-black space-y-4">
          {/* User profile brief card */}
          {user && (
            <div className="flex items-center gap-3 p-3 border-4 border-black bg-neo-muted/30">
              <div className="h-10 w-10 border-4 border-black bg-neo-accent flex items-center justify-center font-black text-black uppercase text-lg shadow-neo-sm">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-black m-0 uppercase tracking-tight break-words leading-snug">{user.name}</p>
                <span className="text-[10px] font-bold text-black bg-white border-2 border-black px-1.5 py-0.5 rounded-full uppercase tracking-widest inline-block mt-1">
                  {user.role.replace('_', ' ')}
                </span>
              </div>
            </div>
          )}

          {/* Logout action button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-3 border-4 border-black bg-white hover:bg-neo-accent text-black font-bold uppercase tracking-wider transition-all duration-100 hover:shadow-neo-sm active:translate-x-1 active:translate-y-1 active:shadow-none"
            title="Sign Out"
          >
            <LogOut className="h-5 w-5 stroke-[3px]" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Header for mobile devices */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-neo-secondary border-b-4 border-black sticky top-0 z-40 shadow-neo-sm">
        <div className="flex items-center gap-3">
          <div className="p-1 border-[3px] border-black bg-white">
            <Star className="h-5 w-5 text-black stroke-[3px] fill-neo-accent" />
          </div>
          <span className="font-black text-black uppercase tracking-tighter text-xl">RateLocal</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 border-4 border-black bg-white text-black hover:bg-neo-accent transition-colors duration-100 active:translate-y-1"
        >
          {mobileMenuOpen ? <X className="h-5 w-5 stroke-[3px]" /> : <Menu className="h-5 w-5 stroke-[3px]" />}
        </button>
      </header>

      {/* Mobile Sidebar Navigation overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-neo-bg flex flex-col justify-between p-6 pt-24 animate-bounce-in overflow-y-auto">
          <nav className="space-y-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-4 px-4 py-4 border-4 border-black font-black uppercase tracking-wider text-lg transition-all ${
                    active
                      ? 'bg-neo-secondary text-black shadow-neo-md -translate-y-1'
                      : 'bg-white text-black hover:bg-neo-secondary hover:shadow-neo-sm active:translate-y-1 active:shadow-none'
                  }`}
                >
                  <Icon className="h-6 w-6 stroke-[3px]" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="pt-8 mt-8 border-t-4 border-black space-y-6">
            {user && (
              <div className="flex items-center gap-4 p-4 border-4 border-black bg-neo-muted/50">
                <div className="h-12 w-12 border-4 border-black bg-neo-secondary flex items-center justify-center font-black text-black uppercase text-xl shadow-neo-sm">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="text-lg font-black text-black uppercase tracking-tight m-0">{user.name}</p>
                  <span className="text-xs font-bold text-black bg-white border-2 border-black px-2 py-1 uppercase tracking-widest inline-block mt-1">
                    {user.role.replace('_', ' ')}
                  </span>
                </div>
              </div>
            )}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center justify-center gap-3 py-4 border-4 border-black bg-neo-secondary text-black hover:bg-neo-accent font-black text-lg uppercase tracking-wider transition-all hover:shadow-neo-md active:translate-y-1 active:shadow-none"
            >
              <LogOut className="h-6 w-6 stroke-[3px]" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 lg:p-12 max-w-7xl mx-auto w-full overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

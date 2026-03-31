import { useState, ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Image, Star, Zap, Settings, MessageSquare,
  ShoppingBag, Users, LogOut, MapPin, Menu, X, ChevronRight, BookOpen,
} from 'lucide-react';
import { useAdminAuth } from './AdminAuthContext';

interface NavItem {
  label: string;
  path: string;
  Icon: React.ElementType;
}

const NAV: NavItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', Icon: LayoutDashboard },
  { label: 'Properties', path: '/admin/properties', Icon: Building2 },
  { label: 'Banners', path: '/admin/banners', Icon: Image },
  { label: 'Testimonials', path: '/admin/testimonials', Icon: Star },
  { label: 'Advantages', path: '/admin/advantages', Icon: Zap },
  { label: 'Blog Posts', path: '/admin/blogs', Icon: BookOpen },
  { label: 'Contact Enquiries', path: '/admin/enquiries', Icon: MessageSquare },
  { label: 'Sell Enquiries', path: '/admin/sell-enquiries', Icon: ShoppingBag },
  { label: 'Visitors', path: '/admin/visitors', Icon: Users },
  { label: 'Settings', path: '/admin/settings', Icon: Settings },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, signOut } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="w-9 h-9 bg-[#c9a84c] rounded-lg flex items-center justify-center flex-shrink-0">
          <MapPin className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-white font-bold text-lg leading-none block">Western</span>
          <span className="text-[#c9a84c] text-xs leading-none tracking-wider uppercase">Admin Panel</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ label, path, Icon }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-[#c9a84c] text-white shadow-md'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
              {active && <ChevronRight className="w-3 h-3 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <div className="px-3 py-2 mb-2">
          <p className="text-white/40 text-xs">Signed in as</p>
          <p className="text-white/80 text-xs font-medium truncate">{user?.email}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-red-500/20 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden lg:flex lg:flex-col w-60 bg-[#0a2240] flex-shrink-0 fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-[#0a2240] flex flex-col z-50">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="lg:ml-60 flex-1 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 h-14 flex items-center justify-between sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <Link
              to="/"
              target="_blank"
              className="text-xs text-gray-500 hover:text-[#c9a84c] transition-colors border border-gray-200 rounded-lg px-3 py-1.5"
            >
              View Website
            </Link>
            <div className="w-8 h-8 bg-[#c9a84c] rounded-full flex items-center justify-center text-white text-xs font-bold">
              {user?.email?.[0]?.toUpperCase() ?? 'A'}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

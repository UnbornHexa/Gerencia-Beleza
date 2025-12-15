import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import Logo from './Logo';
import Avatar from './Avatar';
import {
  LayoutDashboard,
  Users,
  Calendar,
  DollarSign,
  Settings,
  Scissors,
  LogOut,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Clientes', href: '/clients', icon: Users },
  { name: 'Serviços', href: '/services', icon: Scissors },
  { name: 'Agenda', href: '/appointments', icon: Calendar },
  { name: 'Finanças', href: '/finances', icon: DollarSign },
  { name: 'Perfil', href: '/profile', icon: Settings },
];

export default function Layout() {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed left-0 top-0 h-full w-16 bg-white shadow-sm border-r border-gray-200 flex flex-col items-center py-4">
        <div className="mb-8">
          <Logo />
        </div>
        <nav className="flex-1 space-y-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title={item.name}
              >
                <Icon className="w-5 h-5" />
              </Link>
            );
          })}
        </nav>
        <div className="flex flex-col items-center gap-2">
          <Link to="/profile" className="mb-2" title="Meu Perfil">
            <Avatar size="sm" />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="text-gray-600 hover:text-red-600"
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </aside>
      <main className="ml-16 p-8">
        <div key={location.pathname} className="page-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}


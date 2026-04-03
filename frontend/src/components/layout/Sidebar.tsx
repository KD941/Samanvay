import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Package,
  FileText,
  ShoppingCart,
  Wrench,
  BarChart3,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import type { Role } from '../../types';
import clsx from 'clsx';

type NavItem = { name: string; href: string; icon: any; roles: Role[] | ['all'] };

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['all'] },

  // Admin
  { name: 'Vendors', href: '/vendors', icon: Building2, roles: ['admin'] },

  // Buyer + Vendor + Admin
  { name: 'Products', href: '/products', icon: Package, roles: ['buyer', 'vendor', 'admin'] },
  { name: 'Tenders', href: '/tenders', icon: FileText, roles: ['buyer', 'vendor', 'admin'] },
  { name: 'Orders', href: '/orders', icon: ShoppingCart, roles: ['buyer', 'vendor', 'admin'] },

  // Maintenance + Admin
  { name: 'Maintenance', href: '/maintenance', icon: Wrench, roles: ['maintenance', 'admin'] },

  // Analyst + Admin
  { name: 'Analytics', href: '/analytics', icon: BarChart3, roles: ['analyst', 'admin'] },
];

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuthStore();

  const filteredNavigation = navigation.filter(
    (item) => (item.roles as any).includes('all') || (user && (item.roles as Role[]).includes(user.role))
  );

  return (
    <div className="w-64 bg-[var(--surface)] relative z-20 shadow-[6px_0_15px_var(--shadow-dark)] flex flex-col transition-colors duration-500">
      <div className="flex flex-col items-center justify-center h-24 mt-4 mb-2 px-6">
        <div className="h-14 w-14 rounded-2xl bg-[var(--surface)] shadow-[var(--shadow)] flex items-center justify-center mb-3">
          <Building2 className="w-7 h-7 text-[var(--a2)]" />
        </div>
        <h1 className="text-xl font-extrabold text-neon tracking-wider">SAMANVAY</h1>
      </div>
      <nav className="p-4 space-y-3 flex-1">
        {filteredNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={clsx(
                'flex items-center px-5 py-3.5 text-sm font-bold rounded-2xl transition-all duration-300',
                isActive
                  ? 'bg-[var(--surface)] shadow-[var(--shadow-inset)] text-[var(--a2)] translate-x-1'
                  : 'bg-[var(--surface)] text-[var(--muted)] hover:shadow-[var(--shadow)] hover:text-[var(--text)] hover:-translate-y-0.5'
              )}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

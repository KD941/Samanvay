import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuthStore } from '../../stores/authStore';

export default function Layout() {
  const { user } = useAuthStore();

  // 3b: Slight UI variation per role (accent shifts)
  useEffect(() => {
    const root = document.documentElement;
    const roles = ['admin', 'buyer', 'vendor', 'maintenance', 'analyst'] as const;

    // clear previous role classes
    for (const r of roles) root.classList.remove(`role-${r}`);
    if (user?.role) root.classList.add(`role-${user.role}`);
  }, [user?.role]);

  return (
    <div className="flex h-screen bg-transparent">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

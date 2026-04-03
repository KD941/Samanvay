import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import {
  Building2,
  Package,
  FileText,
  ShoppingCart,
  Wrench,
  BarChart3,
  ChevronRight
} from 'lucide-react';

function Card({ title, desc, to, icon: Icon }: { title: string; desc: string; to: string; icon?: React.ElementType }) {
  return (
    <Link to={to} className="card group flex flex-col justify-between hover:shadow-[var(--shadow-hover)] transition-all duration-500 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-32 bg-[var(--a2)]/5 rounded-full blur-3xl -mr-16 -mt-16 transition-colors" />
      <div className="relative">
        <div className="w-12 h-12 rounded-2xl bg-[var(--surface)] shadow-[var(--shadow-inset)] text-[var(--a2)] flex items-center justify-center mb-4 group-hover:-translate-y-1 transition-transform duration-500">
          {Icon && <Icon className="w-6 h-6" />}
        </div>
        <h3 className="text-xl font-bold text-[var(--text)] group-hover:text-[var(--a2)] transition-colors">{title}</h3>
        <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">{desc}</p>
      </div>
      <div className="mt-6 flex items-center text-sm font-bold text-[var(--a2)] opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
        Explore <ChevronRight className="w-4 h-4 ml-1" />
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="card mb-8">
        <div className="relative">
          <h1 className="text-4xl font-extrabold text-neon mb-2">
            Welcome back, {user.name || user.email}
          </h1>
          <p className="text-lg text-[var(--muted)]">
            You are logged in as a <span className="font-bold text-[var(--a2)] px-2 py-0.5 rounded-lg bg-[var(--surface)] shadow-[var(--shadow-inset)]">{user.role.toUpperCase()}</span>.
          </p>
        </div>
      </div>

      {user.role === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card title="Manage Vendors" desc="Create/update vendors and view vendor details" to="/vendors" icon={Building2} />
          <Card title="Products" desc="Search products across vendors" to="/products" icon={Package} />
          <Card title="Tenders" desc="View and manage tenders + bids" to="/tenders" icon={FileText} />
          <Card title="Orders" desc="Track all orders" to="/orders" icon={ShoppingCart} />
          <Card title="Maintenance" desc="Work orders, schedules, complaints" to="/maintenance" icon={Wrench} />
          <Card title="Analytics" desc="Metrics, reports, recommendations" to="/analytics" icon={BarChart3} />
        </div>
      )}

      {user.role === 'buyer' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card title="Search & Compare Products" desc="Browse products and compare options" to="/products" icon={Package} />
          <Card title="Create / View Tenders" desc="Publish tenders and review vendor bids" to="/tenders" icon={FileText} />
          <Card title="Purchases / Orders" desc="Track current and previous orders" to="/orders" icon={ShoppingCart} />
        </div>
      )}

      {user.role === 'vendor' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card title="Tenders" desc="See tenders and submit bids" to="/tenders" icon={FileText} />
          <Card title="Orders" desc="Previously delivered orders + maintenance/complaint context" to="/orders" icon={ShoppingCart} />
        </div>
      )}

      {user.role === 'maintenance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card title="Maintenance" desc="Schedules, work orders, complaints" to="/maintenance" icon={Wrench} />
        </div>
      )}

      {user.role === 'analyst' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card title="Analytics" desc="Metrics, reports, recommendations" to="/analytics" icon={BarChart3} />
        </div>
      )}
    </div>
  );
}

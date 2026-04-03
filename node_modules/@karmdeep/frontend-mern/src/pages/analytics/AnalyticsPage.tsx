import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Users, Package, DollarSign } from 'lucide-react';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AnalyticsPage() {
  // Mock data - in production, fetch from API
  const revenueData = [
    { month: 'Jan', revenue: 45000, orders: 120 },
    { month: 'Feb', revenue: 52000, orders: 145 },
    { month: 'Mar', revenue: 48000, orders: 132 },
    { month: 'Apr', revenue: 61000, orders: 168 },
    { month: 'May', revenue: 55000, orders: 152 },
    { month: 'Jun', revenue: 67000, orders: 185 },
  ];

  const categoryData = [
    { name: 'CNC Machines', value: 35 },
    { name: 'VMC', value: 25 },
    { name: '3D Printers', value: 20 },
    { name: 'Automation', value: 15 },
    { name: 'Others', value: 5 },
  ];

  const vendorPerformance = [
    { vendor: 'Vendor A', orders: 45, rating: 4.8 },
    { vendor: 'Vendor B', orders: 38, rating: 4.6 },
    { vendor: 'Vendor C', orders: 32, rating: 4.7 },
    { vendor: 'Vendor D', orders: 28, rating: 4.5 },
    { vendor: 'Vendor E', orders: 25, rating: 4.4 },
  ];

  const stats = [
    {
      name: 'Total Revenue',
      value: '$328K',
      change: '+12.5%',
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      name: 'Active Users',
      value: '1,234',
      change: '+8.2%',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Products Sold',
      value: '902',
      change: '+15.3%',
      icon: Package,
      color: 'bg-purple-500',
    },
    {
      name: 'Growth Rate',
      value: '23.1%',
      change: '+4.1%',
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="card !mb-8 relative overflow-hidden">
        <div className="relative">
          <h1 className="text-4xl font-extrabold text-neon mb-2">Analytics Dashboard</h1>
          <p className="text-lg text-[var(--muted)]">Platform performance and insights</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.name}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="mt-2 text-sm text-green-600">{stat.change} from last month</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#0ea5e9"
                strokeWidth={2}
                name="Revenue ($)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Product Category Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Trend */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Orders</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="orders" fill="#10b981" name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Vendor Performance */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Vendors</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={vendorPerformance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="vendor" type="category" width={80} />
              <Tooltip />
              <Legend />
              <Bar dataKey="orders" fill="#0ea5e9" name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { action: 'New order placed', user: 'John Doe', time: '2 minutes ago' },
            { action: 'Product added', user: 'Vendor ABC', time: '15 minutes ago' },
            { action: 'Tender published', user: 'Jane Smith', time: '1 hour ago' },
            { action: 'Bid submitted', user: 'Vendor XYZ', time: '2 hours ago' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
              <div>
                <p className="font-medium text-gray-900">{activity.action}</p>
                <p className="text-sm text-gray-600">{activity.user}</p>
              </div>
              <span className="text-sm text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { Role } from '../../types';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../stores/authStore';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    role: 'buyer' as Role,
    vendorId: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await authService.register({
        email: formData.email,
        password: formData.password,
        name: formData.name || undefined,
        phone: formData.phone || undefined,
        role: formData.role,
        vendorId: formData.role === 'vendor' ? (formData.vendorId || undefined) : undefined,
      });

      // backend sets httpOnly cookie on register, so log them in immediately
      login(res.user); // No longer need to pass token
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-4xl font-bold text-primary-600">KarmDeep</h1>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="label">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                className="input"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full name"
              />
            </div>

            <div>
              <label htmlFor="phone" className="label">Phone</label>
              <input
                id="phone"
                name="phone"
                type="text"
                className="input"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="email" className="label">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="role" className="label">Role</label>
              <select
                id="role"
                name="role"
                required
                className="input"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="admin">Admin</option>
                <option value="buyer">Buyer</option>
                <option value="vendor">Vendor</option>
                <option value="maintenance">Maintenance</option>
                <option value="analyst">Analyst</option>
              </select>
            </div>

            {formData.role === 'vendor' && (
              <div>
                <label htmlFor="vendorId" className="label">Vendor ID (optional)</label>
                <input
                  id="vendorId"
                  name="vendorId"
                  type="text"
                  className="input"
                  value={formData.vendorId}
                  onChange={handleChange}
                  placeholder="Mongo ObjectId of Vendor"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Leave blank if you will create/link a Vendor profile later.
                </p>
              </div>
            )}

            <div>
              <label htmlFor="password" className="label">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="input"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full btn btn-primary">
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          <div className="text-center">
            <Link to="/login" className="text-sm text-primary-600 hover:text-primary-500">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

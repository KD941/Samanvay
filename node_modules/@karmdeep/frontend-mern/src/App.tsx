import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import Layout from './components/layout/Layout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import VendorsPage from './pages/vendors/VendorsPage';
import ProductsPage from './pages/products/ProductsPage';
import ProductDetailPage from './pages/products/ProductDetailPage';
import TendersPage from './pages/tenders/TendersPage';
import TenderDetailPage from './pages/tenders/TenderDetailPage';
import OrdersPage from './pages/orders/OrdersPage';
import OrderDetailPage from './pages/orders/OrderDetailPage';
import MaintenancePage from './pages/maintenance/MaintenancePage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import RequireRole from './components/auth/RequireRole';

function App() {
  const { isAuthenticated, checkAuthStatus } = useAuthStore();

  // Check authentication status on app startup
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return (
    <>
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Layout />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          >
            <Route index element={<DashboardPage />} />

            <Route
              path="vendors"
              element={
                <RequireRole roles={['admin']}>
                  <VendorsPage />
                </RequireRole>
              }
            />

            <Route
              path="products"
              element={
                <RequireRole roles={['buyer', 'admin']}>
                  <ProductsPage />
                </RequireRole>
              }
            />
            <Route
              path="products/:productId"
              element={
                <RequireRole roles={['buyer', 'admin']}>
                  <ProductDetailPage />
                </RequireRole>
              }
            />

            <Route
              path="tenders"
              element={
                <RequireRole roles={['buyer', 'vendor', 'admin']}>
                  <TendersPage />
                </RequireRole>
              }
            />
            <Route
              path="tenders/:tenderId"
              element={
                <RequireRole roles={['buyer', 'vendor', 'admin']}>
                  <TenderDetailPage />
                </RequireRole>
              }
            />

            <Route
              path="orders"
              element={
                <RequireRole roles={['buyer', 'vendor', 'admin']}>
                  <OrdersPage />
                </RequireRole>
              }
            />
            <Route
              path="orders/:orderId"
              element={
                <RequireRole roles={['buyer', 'vendor', 'admin']}>
                  <OrderDetailPage />
                </RequireRole>
              }
            />

            <Route
              path="maintenance"
              element={
                <RequireRole roles={['maintenance', 'admin']}>
                  <MaintenancePage />
                </RequireRole>
              }
            />

            <Route
              path="analytics"
              element={
                <RequireRole roles={['analyst', 'admin']}>
                  <AnalyticsPage />
                </RequireRole>
              }
            />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;

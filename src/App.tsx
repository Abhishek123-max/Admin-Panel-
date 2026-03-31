import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './admin/AdminAuthContext';
import LoginPage from './admin/LoginPage';
import AdminRoute from './admin/AdminRoute';
import Dashboard from './admin/pages/Dashboard';
import AdminProperties from './admin/pages/AdminProperties';
import AdminBanners from './admin/pages/AdminBanners';
import AdminTestimonials from './admin/pages/AdminTestimonials';
import AdminAdvantages from './admin/pages/AdminAdvantages';
import AdminEnquiries from './admin/pages/AdminEnquiries';
import AdminSellEnquiries from './admin/pages/AdminSellEnquiries';
import AdminVisitors from './admin/pages/AdminVisitors';
import AdminSettings from './admin/pages/AdminSettings';
import AdminBlogs from './admin/pages/AdminBlogs';
import { usePageTracker } from './hooks/usePageTracker';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function PageTracker() {
  usePageTracker();
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <ScrollToTop />
        <PageTracker />
        <Routes>
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
          <Route path="/admin/properties" element={<AdminRoute><AdminProperties /></AdminRoute>} />
          <Route path="/admin/banners" element={<AdminRoute><AdminBanners /></AdminRoute>} />
          <Route path="/admin/testimonials" element={<AdminRoute><AdminTestimonials /></AdminRoute>} />
          <Route path="/admin/advantages" element={<AdminRoute><AdminAdvantages /></AdminRoute>} />
          <Route path="/admin/enquiries" element={<AdminRoute><AdminEnquiries /></AdminRoute>} />
          <Route path="/admin/sell-enquiries" element={<AdminRoute><AdminSellEnquiries /></AdminRoute>} />
          <Route path="/admin/visitors" element={<AdminRoute><AdminVisitors /></AdminRoute>} />
          <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
          <Route path="/admin/blogs" element={<AdminRoute><AdminBlogs /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}

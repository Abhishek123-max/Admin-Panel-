import { Navigate } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext';
import AdminLayout from './AdminLayout';
import { ReactNode } from 'react';

export default function AdminRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-3 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace />;

  return <AdminLayout>{children}</AdminLayout>;
}

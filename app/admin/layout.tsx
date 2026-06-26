// app/admin/layout.tsx
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/Sidebar';
import { getServerUserWithProfile } from '@/lib/supabase/server';
import { env } from '@/lib/env-check';

export const metadata: Metadata = { title: 'Admin Dashboard' };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getServerUserWithProfile();

  if (!user) redirect('/login?redirect=/admin');

  const isAdmin = profile?.role === 'admin' || user.email === env.adminEmail;
  if (!isAdmin) redirect('/403');

  return (
    <div className="flex h-screen bg-[#07070f] overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto custom-scroll">
        {children}
      </main>
    </div>
  );
}

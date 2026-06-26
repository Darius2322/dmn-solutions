// app/admin/page.tsx
import { Suspense } from 'react';
import { getDashboardStats, getAllFeedback, getAllMembers } from '@/lib/actions';
import { StatsCards } from '@/components/admin/StatsCards';
import { ReviewsTable } from '@/components/admin/ReviewsTable';
import { MembersTable } from '@/components/admin/MembersTable';
import { RequestsQueue } from '@/components/admin/RequestsQueue';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function DashboardContent() {
  const [stats, reviews, members] = await Promise.all([
    getDashboardStats(),
    getAllFeedback(),
    getAllMembers(),
  ]);

  const supabase = createSupabaseServerClient();
  const { data: requests } = await supabase
    .from('requests').select('*').order('created_at', { ascending: false });

  return (
    <div className="p-6 space-y-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-syne font-extrabold text-2xl text-white">Admin Dashboard</h1>
        <p className="text-white/40 text-sm font-inter mt-1">
          Here&apos;s an overview of all member activity on DMN Solutions Kenya.
        </p>
      </div>

      {/* Stats + charts */}
      <StatsCards stats={stats} />

      {/* Data tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ReviewsTable reviews={reviews.slice(0, 10)} />
        <MembersTable members={members.slice(0, 10)} />
      </div>

      <RequestsQueue requests={requests ?? []} />
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="p-6 space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-white/[0.03] animate-pulse" />
        ))}
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}

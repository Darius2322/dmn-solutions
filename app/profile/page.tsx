// app/profile/page.tsx
import { redirect } from 'next/navigation';
import { getServerUserWithProfile } from '@/lib/supabase/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ProfileClient } from '@/components/profile/ProfileClient';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'My Account' };
export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const { user, profile } = await getServerUserWithProfile();
  if (!user) redirect('/login?redirect=/profile');

  const supabase = createSupabaseServerClient();
  const [
    { data: reviews },
    { data: requests },
    { data: comments },
    { data: badges },
    { data: notifications },
  ] = await Promise.all([
    supabase.from('feedback').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('comments').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('badges').select('*').eq('user_email', user.email ?? ''),
    supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(30),
  ]);

  return (
    <ProfileClient
      user={user}
      profile={profile}
      reviews={reviews ?? []}
      requests={requests ?? []}
      comments={comments ?? []}
      badges={badges ?? []}
      notifications={notifications ?? []}
    />
  );
}

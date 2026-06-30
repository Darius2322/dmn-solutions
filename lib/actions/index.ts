// lib/actions/index.ts
'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient, createSupabaseAdminClient, getServerUser } from '@/lib/supabase/server';
import {
  ServiceSchema, PortfolioSchema, FeedbackSchema,
  CommentSchema, RequestSchema, RequestStatusSchema, BadgeSchema,
  type ServiceInput, type PortfolioInput,
} from '@/lib/validators';

// ── Helper: standardised action response ─────────────────────────────────────
type ActionResult<T = void> = { success: true; data?: T } | { success: false; error: string };

async function requireAdmin(): Promise<{ userId: string } | never> {
  const user = await getServerUser();
  if (!user) throw new Error('Unauthenticated');
  const supabase = createSupabaseServerClient();
  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single();
  if (profile?.role !== 'admin' && user.email !== process.env.ADMIN_EMAIL) throw new Error('Forbidden');
  return { userId: user.id };
}

// ═══════════════════════════════════════════════════════════════════════════
// SERVICES
// ═══════════════════════════════════════════════════════════════════════════

export async function getServices(activeOnly = true) {
  const supabase = createSupabaseServerClient();
  let q = supabase.from('services').select('*').order('sort_order');
  if (activeOnly) q = q.eq('is_active', true);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createService(raw: ServiceInput): Promise<ActionResult> {
  try {
    await requireAdmin();
    const input = ServiceSchema.parse(raw);
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from('services').insert(input);
    if (error) return { success: false, error: error.message };
    revalidatePath('/'); revalidatePath('/admin');
    return { success: true };
  } catch (e: unknown) { return { success: false, error: (e as Error).message }; }
}

export async function updateService(id: string, raw: Partial<ServiceInput>): Promise<ActionResult> {
  try {
    await requireAdmin();
    const input = ServiceSchema.partial().parse(raw);
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from('services').update({ ...input, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) return { success: false, error: error.message };
    revalidatePath('/'); revalidatePath('/admin');
    return { success: true };
  } catch (e: unknown) { return { success: false, error: (e as Error).message }; }
}

export async function deleteService(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    revalidatePath('/'); revalidatePath('/admin');
    return { success: true };
  } catch (e: unknown) { return { success: false, error: (e as Error).message }; }
}

// ═══════════════════════════════════════════════════════════════════════════
// PORTFOLIO
// ═══════════════════════════════════════════════════════════════════════════

export async function getPortfolio() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from('portfolio').select('*').order('sort_order').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createPortfolioItem(raw: PortfolioInput): Promise<ActionResult> {
  try {
    await requireAdmin();
    const input = PortfolioSchema.parse(raw);
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from('portfolio').insert(input);
    if (error) return { success: false, error: error.message };
    revalidatePath('/'); revalidatePath('/admin');
    return { success: true };
  } catch (e: unknown) { return { success: false, error: (e as Error).message }; }
}

export async function updatePortfolioItem(id: string, raw: Partial<PortfolioInput>): Promise<ActionResult> {
  try {
    await requireAdmin();
    const input = PortfolioSchema.partial().parse(raw);
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from('portfolio').update(input).eq('id', id);
    if (error) return { success: false, error: error.message };
    revalidatePath('/'); revalidatePath('/admin');
    return { success: true };
  } catch (e: unknown) { return { success: false, error: (e as Error).message }; }
}

export async function deletePortfolioItem(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from('portfolio').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    revalidatePath('/'); revalidatePath('/admin');
    return { success: true };
  } catch (e: unknown) { return { success: false, error: (e as Error).message }; }
}

// ═══════════════════════════════════════════════════════════════════════════
// FEEDBACK / REVIEWS
// ═══════════════════════════════════════════════════════════════════════════

export async function submitFeedback(formData: FormData): Promise<ActionResult> {
  try {
    const user = await getServerUser();
    const raw = {
      rating:     Number(formData.get('rating')),
      service:    formData.get('service') as string,
      comment:    formData.get('comment') as string,
      user_name:  (formData.get('user_name') as string) || user?.user_metadata?.full_name || 'Anonymous',
      user_email: (formData.get('user_email') as string) || user?.email || '',
    };
    const input = FeedbackSchema.parse(raw);
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from('feedback').insert({
      ...input,
      user_id: user?.id ?? null,
    });
    if (error) return { success: false, error: error.message };
    revalidatePath('/');
    return { success: true };
  } catch (e: unknown) { return { success: false, error: (e as Error).message }; }
}

export async function getAllFeedback() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from('feedback').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function deleteFeedback(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from('feedback').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    revalidatePath('/admin');
    return { success: true };
  } catch (e: unknown) { return { success: false, error: (e as Error).message }; }
}

// ═══════════════════════════════════════════════════════════════════════════
// REQUESTS
// ═══════════════════════════════════════════════════════════════════════════

export async function submitRequest(formData: FormData): Promise<ActionResult> {
  try {
    const user = await getServerUser();
    if (!user) return { success: false, error: 'You must be signed in to submit a request.' };
    const raw = {
      title:       formData.get('title') as string,
      description: formData.get('description') as string,
      service:     formData.get('service') as string,
    };
    const input = RequestSchema.parse(raw);
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from('requests').insert({
      ...input, user_id: user.id, user_email: user.email,
      user_name: user.user_metadata?.full_name ?? user.email, status: 'open',
    });
    if (error) return { success: false, error: error.message };
    revalidatePath('/profile'); revalidatePath('/admin');
    return { success: true };
  } catch (e: unknown) { return { success: false, error: (e as Error).message }; }
}

export async function updateRequestStatus(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    const raw = {
      id:          formData.get('id') as string,
      status:      formData.get('status') as string,
      admin_reply: formData.get('admin_reply') as string,
    };
    const input = RequestStatusSchema.parse(raw);
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from('requests').update({ status: input.status, admin_reply: input.admin_reply }).eq('id', input.id);
    if (error) return { success: false, error: error.message };
    revalidatePath('/admin'); revalidatePath('/profile');
    return { success: true };
  } catch (e: unknown) { return { success: false, error: (e as Error).message }; }
}

// ═══════════════════════════════════════════════════════════════════════════
// MEMBERS & BADGES
// ═══════════════════════════════════════════════════════════════════════════

export async function getAllMembers() {
  try {
    await requireAdmin();
    const admin = createSupabaseAdminClient();
    const { data: profiles } = await admin.from('profiles').select('*, badges(*)').order('created_at', { ascending: false });
    return profiles ?? [];
  } catch { return []; }
}

export async function toggleMemberActive(userId: string, isActive: boolean): Promise<ActionResult> {
  try {
    await requireAdmin();
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from('profiles').update({ is_active: isActive }).eq('user_id', userId);
    if (error) return { success: false, error: error.message };
    revalidatePath('/admin');
    return { success: true };
  } catch (e: unknown) { return { success: false, error: (e as Error).message }; }
}

export async function awardBadge(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    const user = await getServerUser();
    const raw = {
      user_email:  formData.get('user_email') as string,
      badge_key:   formData.get('badge_key') as string,
      badge_label: formData.get('badge_label') as string,
      badge_icon:  formData.get('badge_icon') as string,
    };
    const input = BadgeSchema.parse(raw);
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from('badges').insert({ ...input, awarded_by: user?.email ?? 'admin' });
    if (error) return { success: false, error: error.message };
    revalidatePath('/admin');
    return { success: true };
  } catch (e: unknown) { return { success: false, error: (e as Error).message }; }
}

export async function removeMember(userId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const admin = createSupabaseAdminClient();
    await admin.from('badges').delete().eq('user_email', userId);
    await admin.from('activity_log').delete().eq('user_id', userId);
    await admin.from('notifications').delete().eq('user_id', userId);
    const { error } = await admin.from('profiles').delete().eq('user_id', userId);
    if (error) return { success: false, error: error.message };
    revalidatePath('/admin');
    return { success: true };
  } catch (e: unknown) { return { success: false, error: (e as Error).message }; }
}

// ═══════════════════════════════════════════════════════════════════════════
// VERCEL INTEGRATION — import deployed projects directly into portfolio
// ═══════════════════════════════════════════════════════════════════════════

interface VercelProject {
  id: string;
  name: string;
  framework: string | null;
  link?: { type: string; repo?: string; org?: string };
  latestDeployments?: { url: string; createdAt: number; readyState: string }[];
}

/** Fetch the admin's Vercel projects using their personal VERCEL_API_TOKEN env var. */
export async function getVercelProjects(): Promise<
  ActionResult<{ id: string; name: string; url: string; framework: string | null }[]>
> {
  try {
    await requireAdmin();
    const token = process.env.VERCEL_API_TOKEN;
    if (!token) {
      return { success: false, error: 'VERCEL_API_TOKEN is not configured. Add it in your environment variables.' };
    }

    const teamId = process.env.VERCEL_TEAM_ID; // optional, only needed for team accounts
    const url = `https://api.vercel.com/v9/projects${teamId ? `?teamId=${teamId}` : ''}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { success: false, error: body?.error?.message ?? `Vercel API error (${res.status})` };
    }

    const data = await res.json();
    const projects: VercelProject[] = data.projects ?? [];

    const formatted = projects.map((p) => {
      const latest = p.latestDeployments?.[0];
      const liveUrl = latest?.url ? `https://${latest.url}` : `https://${p.name}.vercel.app`;
      return {
        id: p.id,
        name: p.name,
        url: liveUrl,
        framework: p.framework,
      };
    });

    return { success: true, data: formatted };
  } catch (e: unknown) {
    return { success: false, error: (e as Error).message };
  }
}

/** Import a Vercel project directly as a new portfolio entry. */
export async function importVercelProjectToPortfolio(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    const title    = formData.get('title') as string;
    const url      = formData.get('url') as string;
    const category = (formData.get('category') as string) || 'web';
    const framework = formData.get('framework') as string;

    const input = PortfolioSchema.parse({
      title,
      description: framework ? `Deployed on Vercel — built with ${framework}.` : 'Deployed on Vercel.',
      url,
      image: '',
      tags: framework ? `Vercel, ${framework}` : 'Vercel',
      category,
      featured: false,
      sort_order: 0,
    });

    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from('portfolio').insert(input);
    if (error) return { success: false, error: error.message };

    revalidatePath('/');
    revalidatePath('/admin/portfolio');
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: (e as Error).message };
  }
}


// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD METRICS
// ═══════════════════════════════════════════════════════════════════════════

export async function getDashboardStats() {
  await requireAdmin();
  const supabase = createSupabaseServerClient();
  const [reviews, members, requests, comments] = await Promise.all([
    supabase.from('feedback').select('rating, created_at, service'),
    supabase.from('profiles').select('id, created_at, role'),
    supabase.from('requests').select('id, status, created_at'),
    supabase.from('comments').select('id, type, created_at'),
  ]);
  const reviewData  = reviews.data  ?? [];
  const memberData  = members.data  ?? [];
  const requestData = requests.data ?? [];
  const avgRating   = reviewData.length
    ? reviewData.reduce((s, r) => s + (r.rating ?? 0), 0) / reviewData.length
    : 0;
  const ratingDist = [5, 4, 3, 2, 1].map((star) => ({
    star, count: reviewData.filter((r) => r.rating === star).length,
  }));
  const openRequests = requestData.filter((r) => r.status === 'open').length;
  return {
    totalReviews: reviewData.length,
    avgRating:    parseFloat(avgRating.toFixed(1)),
    totalMembers: memberData.length,
    openRequests,
    ratingDist,
    totalComments: (comments.data ?? []).length,
  };
}

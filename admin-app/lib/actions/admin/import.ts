"use server";

import { getCurrentAdmin } from "@/lib/auth/admin";
import { createProject } from "@/lib/actions/admin/portfolio";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
function titleCase(s: string) {
  return s.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function listGithubRepos() {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false as const, error: "Not authorized" };

  const token = process.env.GITHUB_TOKEN;
  if (!token) return { success: false as const, error: "GitHub is not configured (missing GITHUB_TOKEN)." };

  try {
    const res = await fetch("https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner", {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
      cache: "no-store",
    });
    if (!res.ok) return { success: false as const, error: `GitHub API error (${res.status}). Check GITHUB_TOKEN is valid.` };
    const repos = await res.json();
    const items = repos.map((r: any) => ({ name: r.name as string, url: (r.homepage as string) || null }));
    return { success: true as const, items };
  } catch {
    return { success: false as const, error: "Could not reach GitHub." };
  }
}

export async function listVercelProjects() {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false as const, error: "Not authorized" };

  const token = process.env.VERCEL_API_TOKEN;
  if (!token) return { success: false as const, error: "Vercel is not configured (missing VERCEL_API_TOKEN)." };

  try {
    const res = await fetch("https://api.vercel.com/v9/projects?limit=100", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return { success: false as const, error: `Vercel API error (${res.status}). Check VERCEL_API_TOKEN is valid.` };
    const data = await res.json();
    const items = (data.projects ?? []).map((p: any) => {
      const alias =
        p.targets?.production?.alias?.[0] ??
        p.latestDeployments?.[0]?.alias?.[0] ??
        p.latestDeployments?.[0]?.url ??
        `${p.name}.vercel.app`;
      return { name: p.name as string, url: `https://${alias}` };
    });
    return { success: true as const, items };
  } catch {
    return { success: false as const, error: "Could not reach Vercel." };
  }
}

export async function importFromSource(item: { name: string; url?: string | null }) {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false as const, error: "Not authorized" };

  return createProject({
    title: titleCase(item.name),
    slug: slugify(item.name),
    description: "Imported project — add a real description and image.",
    category: "business",
    technologies: [],
    liveUrl: item.url ?? undefined,
    tags: [],
    featured: false,
  });
}

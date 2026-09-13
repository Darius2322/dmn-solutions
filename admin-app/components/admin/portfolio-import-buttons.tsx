"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Github, Triangle, Loader2 } from "lucide-react";
import { createProject } from "@/lib/actions/admin/portfolio";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function titleCase(s: string) {
  return s.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function parseImportUrl(raw: string) {
  let url = raw.trim();
  if (!url) return null;
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;

  let name = "";
  let liveUrl: string | undefined;

  try {
    const u = new URL(url);
    if (u.hostname.includes("github.com")) {
      const parts = u.pathname.split("/").filter(Boolean);
      name = parts[1] || parts[0] || u.hostname;
      liveUrl = undefined;
    } else {
      name = u.hostname.split(".")[0];
      liveUrl = url;
    }
  } catch {
    return null;
  }

  return { title: titleCase(name), slug: slugify(name), liveUrl };
}

export function PortfolioImportButtons() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleImport(kind: "github" | "vercel") {
    const label = kind === "github" ? "GitHub repo URL" : "Vercel (or any live) project URL";
    const raw = window.prompt(`Paste the ${label}:`);
    if (!raw) return;

    const parsed = parseImportUrl(raw);
    if (!parsed) {
      setError("Couldn't read that URL — try pasting the full link.");
      return;
    }

    setError("");
    startTransition(async () => {
      const result = await createProject({
        title: parsed.title,
        slug: parsed.slug,
        description: "Imported project — add a real description and image.",
        category: "business",
        technologies: [],
        liveUrl: parsed.liveUrl,
        tags: [],
        featured: false,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() => handleImport("github")}
        className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm text-foreground hover:bg-background disabled:opacity-60"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Github className="h-4 w-4" />}
        Import from GitHub
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => handleImport("vercel")}
        className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm text-foreground hover:bg-background disabled:opacity-60"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Triangle className="h-4 w-4" />}
        Import from Vercel / URL
      </button>
      {error && <p className="w-full text-xs text-error">{error}</p>}
    </div>
  );
}

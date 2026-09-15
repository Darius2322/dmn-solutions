"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Github, Triangle, Loader2, X, Search } from "lucide-react";
import { listGithubRepos, listVercelProjects, importFromSource } from "@/lib/actions/admin/import";

type Item = { name: string; url: string | null };

export function PortfolioImportButtons() {
  const router = useRouter();
  const [mode, setMode] = useState<"github" | "vercel" | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function open(kind: "github" | "vercel") {
    setMode(kind);
    setLoading(true);
    setError("");
    setItems([]);
    const result = kind === "github" ? await listGithubRepos() : await listVercelProjects();
    setLoading(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setItems(result.items);
  }

  function close() {
    setMode(null);
    setItems([]);
    setQuery("");
    setError("");
  }

  function handleImport(item: Item) {
    startTransition(async () => {
      const result = await importFromSource(item);
      if (!result.success) {
        setError(result.error);
        return;
      }
      close();
      router.refresh();
    });
  }

  const filtered = items.filter((i) => i.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => open("github")}
        className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm text-foreground hover:bg-background"
      >
        <Github className="h-4 w-4" />
        Import from GitHub
      </button>
      <button
        type="button"
        onClick={() => open("vercel")}
        className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm text-foreground hover:bg-background"
      >
        <Triangle className="h-4 w-4" />
        Import from Vercel
      </button>

      {mode && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4" onClick={close}>
          <div
            className="w-full max-w-md rounded-lg border border-border bg-surface shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-sm font-medium text-foreground">
                {mode === "github" ? "Import from GitHub" : "Import from Vercel"}
              </p>
              <button onClick={close} aria-label="Close">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <div className="border-b border-border px-4 py-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter..."
                  className="w-full rounded-md border border-border bg-background py-1.5 pl-8 pr-3 text-sm text-foreground"
                />
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {loading && (
                <p className="flex items-center justify-center gap-2 px-3 py-6 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                </p>
              )}
              {!loading && error && <p className="px-3 py-4 text-center text-sm text-error">{error}</p>}
              {!loading && !error && filtered.length === 0 && (
                <p className="px-3 py-4 text-center text-sm text-muted-foreground">No results.</p>
              )}
              {!loading &&
                filtered.map((item) => (
                  <button
                    key={item.name}
                    disabled={isPending}
                    onClick={() => handleImport(item)}
                    className="flex w-full flex-col items-start gap-0.5 rounded-md px-3 py-2 text-left hover:bg-background disabled:opacity-60"
                  >
                    <span className="text-sm font-medium text-foreground">{item.name}</span>
                    {item.url && <span className="truncate text-xs text-muted-foreground">{item.url}</span>}
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

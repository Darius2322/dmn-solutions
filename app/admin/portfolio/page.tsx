// app/admin/portfolio/page.tsx
'use client';
import { useState, useTransition, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, ExternalLink, Star, StarOff, RefreshCw, X, Save, Image, Triangle, Download, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { getAllPortfolio, createPortfolioItem, updatePortfolioItem, deletePortfolioItem, togglePortfolioHidden, getVercelProjects, importVercelProjectToPortfolio } from '@/lib/actions';
import type { Portfolio } from '@/lib/supabase/types';

const CATEGORIES = [
  { value: 'web',        label: 'Web Development'  },
  { value: 'mobile',     label: 'Mobile App'        },
  { value: 'ecommerce',  label: 'E-Commerce'        },
  { value: 'marketing',  label: 'SEO / Marketing'   },
  { value: 'design',     label: 'UI/UX Design'      },
  { value: 'cloud',      label: 'Cloud / SaaS'      },
  { value: 'wifi',       label: 'WiFi Networks'     },
  { value: 'electrical', label: 'Electrical'        },
  { value: 'business',   label: 'Business / Other'  },
];

const EMPTY_FORM = {
  title: '', description: '', url: '', image: '',
  tags: '', category: 'web', featured: false, sort_order: 0,
};

type FormState = typeof EMPTY_FORM;

// ── Project Form Modal ────────────────────────────────────────────────────────
function ProjectModal({
  item, onClose, onSaved,
}: {
  item: Portfolio | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!item;
  const [form, setForm] = useState<FormState>(
    item
      ? { title: item.title, description: item.description ?? '', url: item.url ?? '',
          image: item.image ?? '', tags: item.tags ?? '', category: item.category,
          featured: item.featured, sort_order: item.sort_order }
      : { ...EMPTY_FORM }
  );
  const [pending, start] = useTransition();

  function set(k: keyof FormState, v: string | boolean | number) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      sort_order: Number(form.sort_order),
      features: [],
    };
    start(async () => {
      const res = isEdit
        ? await updatePortfolioItem(item!.id, payload)
        : await createPortfolioItem(payload);
      if (res.success) {
        toast.success(isEdit ? 'Project updated ✅' : 'Project added ✅');
        onSaved();
        onClose();
      } else {
        toast.error(res.error);
      }
    });
  }

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-white/40 text-xs font-syne font-semibold mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );

  const inputCls = "w-full bg-[#0a0a14] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white/85 text-sm font-inter outline-none focus:border-electric/50 focus:ring-1 focus:ring-electric/20 placeholder:text-white/20 transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="w-full sm:max-w-lg bg-[#0d0d1a] border border-white/[0.06] rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] flex-shrink-0">
          <h2 className="font-syne font-extrabold text-white text-base">
            {isEdit ? '✏️ Edit Project' : '➕ Add Project'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/[0.05] flex items-center justify-center text-white/40 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-5 space-y-4 custom-scroll">
          <Field label="Project Title *">
            <input value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="e.g. Pamoja Cyber Cafe" required className={inputCls} />
          </Field>

          <Field label="Description">
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Brief description of the project…" rows={3}
              className={`${inputCls} resize-none`} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <select value={form.category} onChange={e => set('category', e.target.value)} className={inputCls}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="Sort Order">
              <input type="number" value={form.sort_order} onChange={e => set('sort_order', e.target.value)}
                min={0} max={999} className={inputCls} />
            </Field>
          </div>

          <Field label="Live URL">
            <input value={form.url} onChange={e => set('url', e.target.value)}
              placeholder="https://your-project.vercel.app" type="url" className={inputCls} />
          </Field>

          <Field label="Image URL">
            <input value={form.image} onChange={e => set('image', e.target.value)}
              placeholder="https://images.unsplash.com/…" className={inputCls} />
            {form.image && (
              <div className="mt-2 relative h-28 rounded-xl overflow-hidden border border-white/[0.06]">
                <img src={form.image} alt="Preview" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display='none')} />
              </div>
            )}
          </Field>

          <Field label="Tags (comma separated)">
            <input value={form.tags} onChange={e => set('tags', e.target.value)}
              placeholder="React, Supabase, Tailwind" className={inputCls} />
          </Field>

          {/* Featured toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <div>
              <p className="text-white font-syne font-semibold text-sm">Featured Project</p>
              <p className="text-white/35 text-xs font-inter mt-0.5">Show this project prominently in the grid</p>
            </div>
            <button type="button" onClick={() => set('featured', !form.featured)}
              className={`relative w-12 h-6 rounded-full transition-colors ${form.featured ? 'bg-electric' : 'bg-white/10'}`}>
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${form.featured ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/[0.06] flex gap-3 flex-shrink-0">
          <button type="button" onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-white/[0.08] text-white/50 font-syne font-semibold text-sm hover:text-white hover:border-white/20 transition-colors">
            Cancel
          </button>
          <button
            onClick={e => { e.preventDefault(); document.querySelector('form')?.requestSubmit(); }}
            disabled={pending}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-electric to-neon text-white font-syne font-bold text-sm disabled:opacity-50">
            {pending ? <><RefreshCw size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> {isEdit ? 'Update' : 'Add Project'}</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Project Card ──────────────────────────────────────────────────────────────
function ProjectCard({
  item, onEdit, onDelete, onToggleFeatured, onToggleHidden,
}: {
  item: Portfolio;
  onEdit: (i: Portfolio) => void;
  onDelete: (i: Portfolio) => void;
  onToggleFeatured: (i: Portfolio) => void;
  onToggleHidden: (i: Portfolio) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`glass-card overflow-hidden group ${item.hidden ? 'opacity-55' : ''}`}
    >
      {/* Image */}
      <div className="relative h-40 bg-gradient-to-br from-electric/15 to-neon/5">
        {item.image ? (
          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Image size={32} className="text-white/10" />
          </div>
        )}
        {item.featured && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-amber-500 text-black text-[0.65rem] font-syne font-black">
            ⭐ Featured
          </span>
        )}
        {item.hidden && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-gray-600 text-white text-[0.65rem] font-syne font-black flex items-center gap-1" style={{ marginTop: item.featured ? '26px' : 0 }}>
            <EyeOff size={10} /> Hidden
          </span>
        )}
        <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onToggleFeatured(item)} title={item.featured ? 'Unfeature' : 'Feature'}
            className="w-7 h-7 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center text-amber-400 hover:bg-amber-500/20 transition-colors">
            {item.featured ? <StarOff size={13} /> : <Star size={13} />}
          </button>
          {item.url && (
            <a href={item.url} target="_blank" rel="noreferrer"
              className="w-7 h-7 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white transition-colors">
              <ExternalLink size={13} />
            </a>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-syne font-bold text-white text-sm truncate flex-1">{item.title}</h3>
          <span className="px-2 py-0.5 rounded-md bg-electric/10 text-electric text-[0.65rem] font-syne font-semibold flex-shrink-0">
            {CATEGORIES.find(c => c.value === item.category)?.label ?? item.category}
          </span>
        </div>
        <p className="text-white/40 text-xs font-inter line-clamp-2 mb-4">
          {item.description || 'No description'}
        </p>
        {item.tags && (
          <div className="flex flex-wrap gap-1 mb-3">
            {item.tags.split(',').slice(0,3).map(t => (
              <span key={t} className="px-1.5 py-0.5 rounded bg-white/[0.04] text-white/35 text-[0.62rem] font-inter">{t.trim()}</span>
            ))}
          </div>
        )}
        <div className="flex gap-2 mb-2">
          <button onClick={() => onEdit(item)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-electric/30 text-electric text-xs font-syne font-bold hover:bg-electric/10 transition-colors">
            <Pencil size={12} /> Edit
          </button>
          <button onClick={() => onDelete(item)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-rose-500/30 text-rose-400 text-xs font-syne font-bold hover:bg-rose-500/10 transition-colors">
            <Trash2 size={12} /> Delete
          </button>
        </div>
        <button onClick={() => onToggleHidden(item)}
          className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-syne font-bold transition-colors ${
            item.hidden
              ? 'border-green-500/30 text-green-400 hover:bg-green-500/10'
              : 'border-white/[0.1] text-white/50 hover:bg-white/[0.05]'
          }`}>
          {item.hidden ? <><Eye size={12} /> Show on Site</> : <><EyeOff size={12} /> Hide from Site</>}
        </button>
      </div>
    </motion.div>
  );
}

// ── Delete confirm modal ──────────────────────────────────────────────────────
function DeleteModal({ item, onClose, onConfirm, pending }: {
  item: Portfolio; onClose: ()=>void; onConfirm: ()=>void; pending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ opacity:0,scale:0.9 }} animate={{ opacity:1,scale:1 }}
        className="glass-card w-full max-w-sm p-6">
        <div className="w-12 h-12 rounded-xl bg-rose-500/15 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={22} className="text-rose-400" />
        </div>
        <h3 className="font-syne font-bold text-white text-center text-base mb-2">Delete Project?</h3>
        <p className="text-white/45 text-sm font-inter text-center mb-6">
          &ldquo;<strong className="text-white">{item.title}</strong>&rdquo; will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/[0.08] text-white/50 font-syne font-semibold text-sm">Cancel</button>
          <button onClick={onConfirm} disabled={pending}
            className="flex-1 py-3 rounded-xl bg-rose-500 text-white font-syne font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
            {pending ? <><RefreshCw size={13} className="animate-spin"/>Deleting…</> : <><Trash2 size={13}/>Delete</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Vercel Import Modal ────────────────────────────────────────────────────────
interface VercelProjectItem { id: string; name: string; url: string; framework: string | null; }

function VercelImportModal({ onClose, onImported }: { onClose: () => void; onImported: () => void }) {
  const [projects, setProjects] = useState<VercelProjectItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [importing, setImporting] = useState<string | null>(null);
  const [imported, setImported] = useState<Set<string>>(new Set());
  const [pending, start] = useTransition();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await getVercelProjects();
      if (res.success) setProjects(res.data ?? []);
      else setError(res.error);
      setLoading(false);
    })();
  }, []);

  function handleImport(p: VercelProjectItem) {
    setImporting(p.id);
    const fd = new FormData();
    fd.set('title', p.name);
    fd.set('url', p.url);
    fd.set('category', 'web');
    fd.set('framework', p.framework ?? '');
    start(async () => {
      const res = await importVercelProjectToPortfolio(fd);
      setImporting(null);
      if (res.success) {
        toast.success(`"${p.name}" imported to portfolio ✅`);
        setImported((s) => new Set(s).add(p.id));
        onImported();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="w-full sm:max-w-lg bg-[#0d0d1a] border border-white/[0.06] rounded-t-3xl sm:rounded-2xl max-h-[85vh] flex flex-col"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] flex-shrink-0">
          <h2 className="font-syne font-extrabold text-white text-base flex items-center gap-2">
            <Triangle size={16} className="fill-white" /> Import from Vercel
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/[0.05] flex items-center justify-center text-white/40 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 custom-scroll">
          {loading && (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-white/[0.03] animate-pulse" />)}
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-8">
              <p className="text-rose-400 text-sm font-inter mb-2">{error}</p>
              <p className="text-white/30 text-xs font-inter">
                Add <code className="text-electric">VERCEL_API_TOKEN</code> in your Vercel project&apos;s environment variables.
                Generate one at <span className="text-electric">vercel.com/account/tokens</span>.
              </p>
            </div>
          )}

          {!loading && !error && projects.length === 0 && (
            <p className="text-center text-white/30 text-sm font-inter py-8">No Vercel projects found.</p>
          )}

          {!loading && !error && projects.map((p) => {
            const isImported = imported.has(p.id);
            const isImporting = importing === p.id;
            return (
              <div key={p.id} className="flex items-center gap-3 p-3.5 rounded-xl border border-white/[0.06] mb-2.5 hover:border-electric/30 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-black flex items-center justify-center flex-shrink-0">
                  <Triangle size={14} className="fill-white text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-syne font-bold text-sm truncate">{p.name}</p>
                  <p className="text-white/35 text-xs font-inter truncate">{p.url.replace('https://', '')}</p>
                </div>
                {p.framework && (
                  <span className="px-2 py-0.5 rounded-md bg-white/[0.05] text-white/40 text-[0.65rem] font-syne font-semibold flex-shrink-0">
                    {p.framework}
                  </span>
                )}
                <button
                  onClick={() => handleImport(p)}
                  disabled={isImporting || isImported || pending}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-syne font-bold flex-shrink-0 transition-colors ${
                    isImported
                      ? 'bg-green-500/15 text-green-400'
                      : 'bg-electric/15 text-electric hover:bg-electric/25'
                  } disabled:opacity-60`}
                >
                  {isImported ? <><CheckCircle2 size={13} /> Added</> :
                   isImporting ? <><RefreshCw size={13} className="animate-spin" /> Adding</> :
                   <><Download size={13} /> Import</>}
                </button>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminPortfolioPage() {
  const [items, setItems]         = useState<Portfolio[]>([]);
  const [loading, setLoading]     = useState(true);
  const [modalItem, setModalItem] = useState<Portfolio | null | 'new'>(null);
  const [deleteTarget, setDeleteTarget] = useState<Portfolio | null>(null);
  const [pending, start]          = useTransition();
  const [search, setSearch]       = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [vercelOpen, setVercelOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await getAllPortfolio()); }
    catch { toast.error('Failed to load portfolio'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function handleDelete(item: Portfolio) {
    start(async () => {
      const res = await deletePortfolioItem(item.id);
      if (res.success) { toast.success('Project deleted'); setDeleteTarget(null); load(); }
      else toast.error(res.error);
    });
  }

  function handleToggleFeatured(item: Portfolio) {
    start(async () => {
      const res = await updatePortfolioItem(item.id, { featured: !item.featured });
      if (res.success) { toast.success(item.featured ? 'Removed from featured' : 'Marked as featured ⭐'); load(); }
      else toast.error(res.error);
    });
  }

  function handleToggleHidden(item: Portfolio) {
    start(async () => {
      const res = await togglePortfolioHidden(item.id, !item.hidden);
      if (res.success) { toast.success(item.hidden ? '✅ Project visible on site' : '👁️ Project hidden from site'); load(); }
      else toast.error(res.error);
    });
  }

  const filtered = items
    .filter(i => catFilter === 'all' || i.category === catFilter)
    .filter(i => !search || i.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-syne font-extrabold text-2xl text-white">Portfolio Projects</h1>
          <p className="text-white/35 text-sm font-inter mt-1">{items.length} projects · changes reflect live on site</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2.5 rounded-xl border border-white/[0.08] text-white/40 hover:text-white transition-colors">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setVercelOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.1] bg-black text-white font-syne font-bold text-sm hover:border-white/30 transition-colors">
            <Triangle size={14} className="fill-white" /> Import from Vercel
          </button>
          <button onClick={() => setModalItem('new')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-electric to-neon text-white font-syne font-bold text-sm">
            <Plus size={16} /> Add Project
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search projects…"
          className="flex-1 min-w-[180px] max-w-xs bg-[#0d0d1a] border border-white/[0.08] rounded-xl px-3 py-2 text-white/80 text-sm font-inter outline-none focus:border-electric/50 placeholder:text-white/20" />
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          className="bg-[#0d0d1a] border border-white/[0.08] rounded-xl px-3 py-2 text-white/60 text-sm font-inter outline-none focus:border-electric/50">
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_,i) => <div key={i} className="h-72 rounded-2xl bg-white/[0.03] animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{opacity:0}} animate={{opacity:1}}
          className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-electric/10 flex items-center justify-center mx-auto mb-4">
            <Plus size={28} className="text-electric/50" />
          </div>
          <p className="text-white/30 font-inter mb-4">{search || catFilter !== 'all' ? 'No projects match your filters.' : 'No projects yet.'}</p>
          <button onClick={() => setModalItem('new')}
            className="px-5 py-2.5 rounded-xl bg-electric/15 text-electric font-syne font-bold text-sm hover:bg-electric/25 transition-colors">
            Add First Project
          </button>
        </motion.div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map(item => (
              <ProjectCard key={item.id} item={item}
                onEdit={i => setModalItem(i)}
                onDelete={i => setDeleteTarget(i)}
                onToggleFeatured={handleToggleFeatured}
                onToggleHidden={handleToggleHidden}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {(modalItem === 'new' || (modalItem && typeof modalItem === 'object')) && (
          <ProjectModal
            item={modalItem === 'new' ? null : modalItem as Portfolio}
            onClose={() => setModalItem(null)}
            onSaved={load}
          />
        )}
        {deleteTarget && (
          <DeleteModal
            item={deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={() => handleDelete(deleteTarget)}
            pending={pending}
          />
        )}
        {vercelOpen && (
          <VercelImportModal
            onClose={() => setVercelOpen(false)}
            onImported={load}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

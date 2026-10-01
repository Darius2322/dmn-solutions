import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { Loader2 } from 'lucide-react';

export interface ConsentDoc { version: string; title: string; body: string; enforced: boolean }

export async function fetchConsent(): Promise<ConsentDoc | null> {
  if (!supabase) return null;
  const { data } = await supabase.rpc('get_current_consent');
  return (data as ConsentDoc | null) ?? null;
}

/** The data-use notice with an "I accept" checkbox. Drop it into any sign-up / account-setup form:
 *   <ConsentBox onChange={(accepted, version) => ...} />
 * and send { acceptedTerms: accepted, termsVersion: version } to claim-owner-account. */
export function ConsentBox({ onChange }: { onChange: (accepted: boolean, version: string | null) => void }) {
  const [doc, setDoc] = useState<ConsentDoc | null | undefined>(undefined);
  const [checked, setChecked] = useState(false);
  useEffect(() => { void fetchConsent().then(setDoc).catch(() => setDoc(null)); }, []);
  useEffect(() => { onChange(checked, doc?.version ?? null); }, [checked, doc]);
  if (doc === undefined) return <p className="text-xs text-slate-500">Loading terms…</p>;
  if (!doc) return null;
  return (
    <section aria-label={doc.title} className="rounded-card border border-slate-200 bg-paper-raised">
      <h3 className="px-3 pt-3 text-sm font-semibold">{doc.title}</h3>
      <div tabIndex={0} className="mx-3 my-2 max-h-48 overflow-y-auto text-xs text-slate-600 whitespace-pre-line leading-relaxed pr-1">{doc.body}</div>
      <label className="flex items-start gap-3 px-3 py-3 border-t border-slate-200 cursor-pointer min-h-[52px]">
        <input type="checkbox" className="mt-0.5 w-5 h-5 accent-[#146b4a] shrink-0" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
        <span className="text-sm">I have read and accept how ShopOS uses my data <span className="text-slate-400">(v{doc.version})</span></span>
      </label>
    </section>
  );
}

/** Shown once to people who signed up before the notice existed (only when the notice is marked "enforced"). */
export function ConsentGate() {
  const { business } = useAuth();
  const [doc, setDoc] = useState<ConsentDoc | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!business || !supabase || !navigator.onLine) return;
    void (async () => {
      const { data } = await supabase!.rpc('my_consent_status');
      if ((data as any)?.needed) setDoc(await fetchConsent());
    })();
  }, [business?.id]);
  if (!doc) return null;
  async function accept() {
    setBusy(true); setError(null);
    const { error: e } = await supabase!.rpc('accept_current_consent', { p_user_agent: navigator.userAgent });
    setBusy(false);
    if (e) setError('Could not save your acceptance. Check your connection and try again.'); else setDoc(null);
  }
  return (
    <div className="fixed inset-0 z-[90] bg-ink/60 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={doc.title}>
      <div className="bg-paper w-full max-w-md rounded-2xl p-4 space-y-3 max-h-[92vh] overflow-y-auto">
        <ConsentBox onChange={(a) => setAccepted(a)} />
        {error && <p role="alert" className="text-sm text-rust-600">{error}</p>}
        <button onClick={accept} disabled={!accepted || busy} className="btn-primary w-full min-h-[48px] flex items-center justify-center gap-1.5">{busy && <Loader2 className="w-4 h-4 animate-spin" />} Accept and continue</button>
      </div>
    </div>
  );
}

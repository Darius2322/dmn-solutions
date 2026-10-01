import { useState } from 'react';
import { X, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

/** Delete-account dialog. This is a SOFT delete: access closes immediately, but nothing is erased. The data is held
 * for 30 days and a ShopOS administrator can restore it. Owners also type the business name. */
export function DeleteAccountDialog({ pendingChanges, onClose }: { pendingChanges: number; onClose: () => void }) {
  const { profile, business, signOut } = useAuth();
  const isOwner = profile?.role === 'owner';
  const [password, setPassword] = useState(''); const [confirmText, setConfirmText] = useState(''); const [bizName, setBizName] = useState(''); const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false); const [error, setError] = useState<string | null>(null); const [done, setDone] = useState(false);

  async function submit() {
    if (!supabase) return;
    if (!navigator.onLine) { setError("You're offline. Connect to the internet to delete your account."); return; }
    setBusy(true); setError(null);
    const { data, error: e } = await supabase.functions.invoke('delete-my-account', { body: { password, confirmText, businessName: bizName, reason } });
    setBusy(false);
    if (e || (data as any)?.error) {
      let msg = (data as any)?.error as string | undefined;
      if (!msg && (e as any)?.context?.json) { try { msg = (await (e as any).context.json())?.error; } catch { /* ignore */ } }
      setError(msg ?? 'Could not delete the account. Please try again.'); return;
    }
    setDone(true);
    setTimeout(() => { void signOut(); }, 2500);
  }

  const ready = password.length > 0 && confirmText.trim().toUpperCase() === 'DELETE' && (!isOwner || bizName.trim().length > 0);
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Delete account">
      <div className="absolute inset-0 bg-ink/50" onClick={busy || done ? undefined : onClose} />
      <div className="relative w-full max-w-md bg-paper-raised rounded-2xl p-5 space-y-3 max-h-[92vh] overflow-y-auto shadow-xl">
        {done ? (
          <div className="text-center py-4">
            <p className="font-semibold">Account closed</p>
            <p className="text-sm text-slate-500 mt-1">Your data is kept for 30 days. If this was a mistake, contact ShopOS support and an administrator can restore it. Signing you out…</p>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-display text-lg font-semibold">Delete {isOwner ? 'business account' : 'my account'}</h2>
              <button onClick={onClose} aria-label="Close" className="w-9 h-9 -mr-2 flex items-center justify-center rounded-full hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex gap-2 text-sm bg-amber-50 text-amber-700 rounded-card p-3">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                {isOwner
                  ? <>This closes <b>{business?.name}</b> and sign-in for you and all your staff straight away. Your records are <b>not erased</b>: they're held for 30 days so an administrator can restore them.</>
                  : <>This closes your own sign-in. The business keeps its records, including the ones you created.</>}
                {pendingChanges > 0 && <div className="mt-1.5"><b>{pendingChanges} change{pendingChanges === 1 ? '' : 's'} haven't synced yet.</b> Cancel and sync first, or they may be lost from the server.</div>}
              </div>
            </div>
            <label className="block"><span className="block text-sm font-medium text-slate-600 mb-1.5">Your password</span><input className="input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
            {isOwner && <label className="block"><span className="block text-sm font-medium text-slate-600 mb-1.5">Type your business name: <span className="font-semibold">{business?.name}</span></span><input className="input" value={bizName} onChange={(e) => setBizName(e.target.value)} /></label>}
            <label className="block"><span className="block text-sm font-medium text-slate-600 mb-1.5">Type DELETE to confirm</span><input className="input" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} autoCapitalize="characters" /></label>
            <label className="block"><span className="block text-sm font-medium text-slate-600 mb-1.5">Reason <span className="text-slate-400 font-normal">(optional)</span></span><input className="input" value={reason} maxLength={300} onChange={(e) => setReason(e.target.value)} /></label>
            {error && <p role="alert" className="text-sm text-rust-600">{error}</p>}
            <div className="flex gap-2">
              <button onClick={onClose} className="btn-secondary flex-1 min-h-[46px]">Cancel</button>
              <button onClick={submit} disabled={!ready || busy} className="flex-1 min-h-[46px] rounded-card bg-rust-600 text-white font-medium disabled:opacity-50 flex items-center justify-center gap-1.5">{busy && <Loader2 className="w-4 h-4 animate-spin" />} Delete account</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

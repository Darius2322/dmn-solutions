import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Mail, Phone, Store, ShieldCheck, Clock, KeyRound } from 'lucide-react';
import { useAuth } from '../../lib/auth';

/** The signed-in person's own profile. */
export function ProfilePage() {
  const navigate = useNavigate();
  const { profile, business, branches, activeBranchId } = useAuth();
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => { void supabase?.auth.getSession().then(({ data }) => setEmail(data.session?.user.email ?? null)); }, []);
  if (!profile) return null;
  const initials = profile.fullName.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase() || 'U';
  const branch = branches.find((b) => b.id === activeBranchId);
  const rows = [
    { icon: Mail, label: 'Email', value: email },
    { icon: Phone, label: 'Phone', value: (profile as any).phone },
    { icon: Store, label: 'Business', value: business?.name },
    { icon: Store, label: 'Branch', value: branch?.name },
    { icon: Clock, label: 'Last sign-in', value: (profile as any).lastLoginAt ? new Date((profile as any).lastLoginAt).toLocaleString() : null },
    { icon: Clock, label: 'Member since', value: (profile as any).createdAt ? new Date((profile as any).createdAt).toLocaleDateString() : null }
  ].filter((r) => r.value);
  return (
    <div className="p-4 md:p-8 max-w-xl mx-auto pb-24">
      <div className="flex items-center gap-4 mb-5">
        <span className="w-16 h-16 rounded-full bg-field-600 text-white flex items-center justify-center text-xl font-semibold shrink-0">{initials}</span>
        <div className="min-w-0"><h1 className="font-display text-2xl font-semibold truncate">{profile.fullName}</h1><p className="text-sm text-slate-500 capitalize">{profile.role.replace(/_/g, ' ')} · {profile.status}</p></div>
      </div>
      <ul className="card divide-y divide-slate-100">
        {rows.map((r) => (
          <li key={r.label} className="flex items-center gap-3 px-4 py-3.5 min-h-[56px]"><r.icon className="w-4 h-4 text-slate-400 shrink-0" /><div className="min-w-0"><div className="text-xs text-slate-500">{r.label}</div><div className="text-sm truncate">{r.value}</div></div></li>
        ))}
      </ul>
      <div className="grid grid-cols-2 gap-2 mt-4">
        <button onClick={() => navigate('/security')} className="btn-secondary min-h-[48px] flex items-center justify-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Security</button>
        <button onClick={() => navigate('/security')} className="btn-secondary min-h-[48px] flex items-center justify-center gap-1.5"><KeyRound className="w-4 h-4" /> Change password</button>
      </div>
      <p className="text-xs text-slate-500 mt-3">To change your name or role, ask the business owner.</p>
    </div>
  );
}

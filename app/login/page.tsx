// app/login/page.tsx
'use client';
import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { LoginSchema, SignupSchema } from '@/lib/validators';

export default function LoginPage() {
  const [isSignup, setIsSignup]   = useState(false);
  const [showPass, setShowPass]   = useState(false);
  const [error, setError]         = useState('');
  const [pending, startTransition] = useTransition();
  const router     = useRouter();
  const params     = useSearchParams();
  const redirectTo = params.get('redirect') ?? '/';
  const db = createSupabaseBrowserClient();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const fd = new FormData(e.currentTarget);
    const raw = {
      email:     fd.get('email')    as string,
      password:  fd.get('password') as string,
      full_name: fd.get('name')     as string,
      confirm:   fd.get('confirm')  as string,
    };

    startTransition(async () => {
      if (isSignup) {
        const result = SignupSchema.safeParse(raw);
        if (!result.success) { setError(result.error.errors[0].message); return; }
        const { error: err } = await db.auth.signUp({
          email: result.data.email,
          password: result.data.password,
          options: { data: { full_name: result.data.full_name }, emailRedirectTo: `${window.location.origin}/` },
        });
        if (err) { setError(err.message); return; }
        setError('✅ Check your email to confirm your account!');
      } else {
        const result = LoginSchema.safeParse(raw);
        if (!result.success) { setError(result.error.errors[0].message); return; }
        const { error: err } = await db.auth.signInWithPassword({ email: result.data.email, password: result.data.password });
        if (err) { setError(err.message); return; }
        router.push(redirectTo);
        router.refresh();
      }
    });
  }

  const fields = isSignup
    ? [
        { name: 'name',     type: 'text',     placeholder: 'Full name',     icon: User },
        { name: 'email',    type: 'email',    placeholder: 'Email address', icon: Mail },
        { name: 'password', type: showPass ? 'text' : 'password', placeholder: 'Password (min 6 chars)', icon: Lock },
        { name: 'confirm',  type: 'password', placeholder: 'Confirm password', icon: Lock },
      ]
    : [
        { name: 'email',    type: 'email',    placeholder: 'Email address', icon: Mail },
        { name: 'password', type: showPass ? 'text' : 'password', placeholder: 'Password', icon: Lock },
      ];

  return (
    <div className="min-h-screen bg-[#07070f] grid-bg flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo size={48} />
        </div>

        <div className="glass-card p-7">
          <h1 className="font-syne font-extrabold text-xl text-white mb-1">
            {isSignup ? 'Create an account' : 'Welcome back'}
          </h1>
          <p className="text-white/40 text-sm font-inter mb-6">
            {isSignup ? 'Join the DMN Solutions community.' : 'Sign in to your account.'}
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className={`px-4 py-3 rounded-xl text-sm font-inter mb-4 ${
                error.startsWith('✅')
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {fields.map(({ name, type, placeholder, icon: Icon }) => (
              <div key={name} className="relative">
                <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                <input
                  name={name} type={type} placeholder={placeholder} required
                  className="w-full bg-[#0d0d1a] border border-white/[0.08] rounded-xl pl-9 pr-4 py-3 text-white/85 text-sm font-inter outline-none focus:border-electric/50 focus:ring-1 focus:ring-electric/20 placeholder:text-white/20 transition-colors"
                />
                {name === 'password' && (
                  <button type="button" onClick={() => setShowPass((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                )}
              </div>
            ))}

            {!isSignup && (
              <div className="text-right">
                <button type="button" className="text-electric text-xs font-syne font-semibold hover:text-neon transition-colors">
                  Forgot password?
                </button>
              </div>
            )}

            <motion.button
              type="submit" disabled={pending}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-electric to-neon text-white font-syne font-bold text-sm disabled:opacity-50 mt-2"
              whileTap={{ scale: 0.97 }}
            >
              {pending ? 'Please wait…' : isSignup ? 'Create Account' : 'Sign In'}
            </motion.button>
          </form>

          <div className="mt-5 text-center">
            <span className="text-white/35 text-sm font-inter">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}
            </span>
            <button
              onClick={() => { setIsSignup((s) => !s); setError(''); }}
              className="ml-2 text-electric text-sm font-syne font-bold hover:text-neon transition-colors"
            >
              {isSignup ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

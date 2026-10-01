import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export interface ShoposContact { email: string | null; whatsapp: string | null; phone: string | null; slogan: string }

/** Used until (or if) the live values can't be fetched, e.g. when offline. The real values live in the database
 * (platform_settings) so they can be changed without a new release. */
export const SHOPOS_FALLBACK: ShoposContact = { email: 'shoposmodern@gmail.com', whatsapp: '254110554040', phone: '+2540110554040', slogan: 'Smart tools for every shop' };
const KEY = 'shopos.contact.v1';

function cached(): ShoposContact { try { return { ...SHOPOS_FALLBACK, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }; } catch { return SHOPOS_FALLBACK; } }

export function useShoposContact(): ShoposContact {
  const [c, setC] = useState<ShoposContact>(cached);
  useEffect(() => {
    if (!supabase || !navigator.onLine) return;
    void supabase.rpc('get_shopos_contact').then(({ data }) => {
      if (data) { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* ignore */ } setC({ ...SHOPOS_FALLBACK, ...(data as object) }); }
    });
  }, []);
  return c;
}

export const telHref = (n?: string | null) => (n ? `tel:${n.replace(/[^\d+]/g, '')}` : undefined);
export const waHref = (n?: string | null, text?: string) => {
  if (!n) return undefined;
  const d = n.replace(/\D/g, ''); const intl = d.startsWith('0') ? `254${d.slice(1)}` : d;
  return `https://wa.me/${intl}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
};

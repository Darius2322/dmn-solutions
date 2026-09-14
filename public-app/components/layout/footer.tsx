import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <Image src="/images/logo-icon.png" alt="" width={24} height={24} className="h-6 w-6" />
              <p className="text-base font-semibold text-ink-foreground">DMN Solutions</p>
            </div>
            <p className="mt-3 text-sm text-ink-muted-foreground">
              Practical digital, technology, electrical, computer training and internet services.
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-ink-foreground">Navigation</p>
            <ul className="mt-3 space-y-2 text-sm text-ink-muted-foreground">
              <li><Link href="/services" className="hover:text-ink-foreground">Services</Link></li>
              <li><Link href="/portfolio" className="hover:text-ink-foreground">Portfolio</Link></li>
              <li><Link href="/about" className="hover:text-ink-foreground">About</Link></li>
              <li><Link href="/track-order" className="hover:text-ink-foreground">Track Order</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-medium text-ink-foreground">Support</p>
            <ul className="mt-3 space-y-2 text-sm text-ink-muted-foreground">
              <li><Link href="/donate" className="hover:text-ink-foreground">Donate</Link></li>
              <li><Link href="/referral" className="hover:text-ink-foreground">Referral Program</Link></li>
              <li><Link href="/support" className="hover:text-ink-foreground">Support Us</Link></li>
              <li><Link href="/work-with-us" className="hover:text-ink-foreground">Work With Us</Link></li>
              <li><Link href="/report-bug" className="hover:text-ink-foreground">Report a Bug</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-medium text-ink-foreground">Legal</p>
            <ul className="mt-3 space-y-2 text-sm text-ink-muted-foreground">
              <li><Link href="/privacy" className="hover:text-ink-foreground">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-ink-foreground">Terms of Service</Link></li>
              <li><Link href="/refund-policy" className="hover:text-ink-foreground">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-ink-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} DMN Solutions. All rights reserved.</p>
          <Link href="/contact" className="hover:text-ink-foreground">Contact us</Link>
        </div>
      </div>
    </footer>
  );
}

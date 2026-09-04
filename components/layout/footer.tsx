import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-base font-semibold text-foreground">DMN Solutions</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Practical digital, technology, electrical, computer training and internet services.
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-foreground">Navigation</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/services" className="hover:text-foreground">Services</Link></li>
              <li><Link href="/portfolio" className="hover:text-foreground">Portfolio</Link></li>
              <li><Link href="/about" className="hover:text-foreground">About</Link></li>
              <li><Link href="/track-order" className="hover:text-foreground">Track Order</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-medium text-foreground">Support</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/donate" className="hover:text-foreground">Donate</Link></li>
              <li><Link href="/referral" className="hover:text-foreground">Referral Program</Link></li>
              <li><Link href="/support" className="hover:text-foreground">Support Us</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-medium text-foreground">Legal</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
              <li><Link href="/refund-policy" className="hover:text-foreground">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} DMN Solutions. All rights reserved.</p>
          <Link href="/contact" className="hover:text-foreground">Contact us</Link>
        </div>
      </div>
    </footer>
  );
}

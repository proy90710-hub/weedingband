import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="sm:col-span-2">
          <h3 className="text-display text-2xl text-gold">ShaadiBaaja</h3>
          <p className="mt-3 max-w-sm text-sm text-ink-foreground/75">
            Band, dhol, ghodi-baggi aur baraat lights — sab kuch ek jagah. Book verified baraat
            teams for your wedding in minutes.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-widest text-gold">Explore</h4>
          <ul className="mt-3 space-y-2 text-sm text-ink-foreground/75">
            <li>
              <Link to="/services" className="hover:text-gold">
                Services
              </Link>
            </li>
            <li>
              <Link to="/book" className="hover:text-gold">
                Book Baraat
              </Link>
            </li>
            <li>
              <Link to="/my-bookings" className="hover:text-gold">
                My Bookings
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-gold">
                About
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-widest text-gold">Contact</h4>
          <ul className="mt-3 space-y-2 text-sm text-ink-foreground/75">
            <li>help@shaadibaaja.in</li>
            <li>+91 98xxx 45xxx</li>
            <li>Delhi · Jaipur · Mumbai · Lucknow</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink-foreground/15">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-xs text-ink-foreground/70 sm:flex-row sm:items-center sm:justify-between">
          <p>Developed by Priya Roy</p>
          <p>Built during internship at Talking Crooks IT Pvt. Ltd.</p>
        </div>
      </div>
    </footer>
  );
}

import { createFileRoute } from "@tanstack/react-router";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About ShaadiBaaja — Project by Priya Roy" },
      {
        name: "description",
        content:
          "ShaadiBaaja is a wedding band and baraat booking platform built by Priya Roy during her internship at Talking Crooks IT Pvt. Ltd.",
      },
      { property: "og:title", content: "About ShaadiBaaja — Project by Priya Roy" },
      {
        property: "og:description",
        content: "The story, tech stack and database design behind ShaadiBaaja.",
      },
    ],
  }),
  component: About,
});

const stack = [
  ["Frontend", "React + TanStack Start, Tailwind CSS v4 design system"],
  ["Backend", "TanStack server functions (typed RPC on the edge)"],
  ["Database", "PostgreSQL (Lovable Cloud) with row-level security"],
  ["Why", "One toolchain, real relational data, and instant hosting for the demo"],
];

const tables = [
  {
    name: "service_categories",
    fields: "id (PK), name, slug (unique), description, icon, sort_order, created_at",
  },
  {
    name: "vendors",
    fields:
      "id (PK), category_id (FK → service_categories), name, city, description, price, rating, members, featured, active, created_at",
  },
  {
    name: "bookings",
    fields:
      "id (PK), customer_name, phone, email, event_date, baraat_time, venue, city, guest_count, notes, total_price, status, created_at",
  },
  {
    name: "booking_items",
    fields:
      "id (PK), booking_id (FK → bookings), vendor_id (FK → vendors), quantity, price, created_at",
  },
];

function About() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-4xl text-primary">About ShaadiBaaja</h1>
        <p className="mt-4 text-muted-foreground">
          Booking a baraat in India still runs on phone calls, cousins' recommendations and
          guesswork on price. ShaadiBaaja puts every part of the procession — band, dhol,
          ghodi-baggi and lights — in one catalogue with clear pricing, so a family can plan the
          whole entry in one sitting.
        </p>

        <section className="mt-10">
          <h2 className="text-2xl text-primary">Tech stack</h2>
          <dl className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {stack.map(([k, v]) => (
              <div key={k} className="grid gap-1 p-4 sm:grid-cols-3">
                <dt className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  {k}
                </dt>
                <dd className="text-sm sm:col-span-2">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl text-primary">Database schema</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Relationships: service_categories 1:N vendors · bookings 1:N booking_items · vendors
            1:N booking_items.
          </p>
          <div className="mt-4 space-y-3">
            {tables.map((t) => (
              <div key={t.name} className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-mono text-sm font-semibold text-primary">{t.name}</h3>
                <p className="mt-1 font-mono text-xs leading-relaxed text-muted-foreground">
                  {t.fields}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl text-primary">Scope</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-lg text-primary">In this version</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                <li>Service catalogue with category filters</li>
                <li>Multi-service baraat booking with live total</li>
                <li>Bookings saved to the database</li>
                <li>Booking lookup by phone number</li>
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-lg text-primary">Planned next</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                <li>Customer accounts and vendor logins</li>
                <li>Online advance payment</li>
                <li>Availability calendar per vendor</li>
                <li>Reviews after the wedding</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-xl border border-border bg-secondary/60 p-6">
          <h2 className="text-2xl text-primary">Developed by Priya Roy</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Built during internship at Talking Crooks IT Pvt. Ltd. as the project development
            task — wireframe to working full-stack application.
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

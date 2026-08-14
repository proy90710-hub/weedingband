import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, IndianRupee, ShieldCheck, Star } from "lucide-react";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { categoriesQuery, categoryImages, vendorsQuery } from "@/lib/catalog";
import { formatINR } from "@/lib/format";

import heroImg from "@/assets/hero-baraat.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ShaadiBaaja — Book Wedding Band, Dhol & Baraat Online" },
      {
        name: "description",
        content:
          "Book verified wedding bands, dhol groups, ghodi-baggi and baraat lights for your shaadi. Compare prices, pick your team and confirm in minutes.",
      },
      { property: "og:title", content: "ShaadiBaaja — Book Wedding Band, Dhol & Baraat Online" },
      {
        property: "og:description",
        content:
          "Verified baraat teams for bands, dhol, ghodi-baggi and lights. Compare prices and book online.",
      },
    ],
  }),
  component: Home,
});

const steps = [
  {
    icon: Star,
    title: "1. Choose your baraat",
    text: "Browse bands, dhol groups, ghodi-baggi and light walas with real prices.",
  },
  {
    icon: CalendarCheck,
    title: "2. Pick date & venue",
    text: "Tell us the shaadi date, baraat time and where the procession starts.",
  },
  {
    icon: ShieldCheck,
    title: "3. Confirm & relax",
    text: "We lock your team, share the booking ID and follow up before the big day.",
  },
];

function Home() {
  const { data: categories } = useQuery(categoriesQuery);
  const { data: vendors } = useQuery(vendorsQuery);
  const featured = (vendors ?? []).filter((v) => v.featured).slice(0, 3);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main>
        <section className="relative">
          <img
            src={heroImg}
            alt="Indian wedding baraat with brass band, dhol players and a decorated ghodi at sunset"
            width={1600}
            height={1008}
            className="h-[74vh] min-h-[460px] w-full object-cover"
          />
          <div className="bg-hero-scrim absolute inset-0" />
          <div className="absolute inset-0 flex items-end">
            <div className="mx-auto w-full max-w-6xl px-4 pb-14">
              <p className="text-sm uppercase tracking-[0.3em] text-gold">Baraat, sorted</p>
              <h1 className="mt-3 max-w-2xl text-4xl leading-tight text-ink-foreground sm:text-6xl">
                Band, dhol, ghodi aur roshni — one booking.
              </h1>
              <p className="mt-4 max-w-xl text-base text-ink-foreground/85">
                ShaadiBaaja lets you compare verified baraat teams across cities and book the
                whole procession without a single phone call.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/book">Book your baraat</Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link to="/services">Browse services</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl text-primary">What we book for you</h2>
              <p className="mt-2 text-muted-foreground">
                Four categories, every one of them essential to a proper baraat.
              </p>
            </div>
            <Link to="/services" className="hidden text-sm font-medium text-primary underline sm:block">
              See all
            </Link>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(categories ?? []).map((cat) => (
              <Link
                key={cat.id}
                to="/services"
                className="group overflow-hidden rounded-xl border border-border bg-card shadow-card transition-transform hover:-translate-y-1"
              >
                <img
                  src={categoryImages[cat.slug]}
                  alt={cat.name}
                  loading="lazy"
                  width={900}
                  height={700}
                  className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="p-4">
                  <h3 className="text-lg text-primary">{cat.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{cat.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-secondary/60 py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-center text-3xl text-primary">How it works</h2>
            <div className="divider-marigold mx-auto mt-4 w-48" />
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {steps.map((s) => (
                <div key={s.title} className="rounded-xl border border-border bg-card p-6 shadow-card">
                  <s.icon className="size-7 text-accent" />
                  <h3 className="mt-4 text-xl text-primary">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl text-primary">Most booked this season</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {featured.map((v) => (
              <div key={v.id} className="rounded-xl border border-border bg-card p-6 shadow-card">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl text-primary">{v.name}</h3>
                  <span className="flex items-center gap-1 text-sm text-accent-foreground">
                    <Star className="size-4 fill-gold text-gold" />
                    {v.rating}
                  </span>
                </div>
                <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                  {v.city} · {v.members} members
                </p>
                <p className="mt-3 text-sm text-muted-foreground">{v.description}</p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-lg font-semibold text-primary">
                    <IndianRupee className="size-4" />
                    {formatINR(v.price).replace("₹", "")}
                  </span>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/book" search={{ vendor: v.id }}>
                      Add to booking
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

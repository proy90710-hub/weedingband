import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Star, Users } from "lucide-react";
import { useState } from "react";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { categoriesQuery, categoryImages, vendorsQuery } from "@/lib/catalog";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Baraat Services & Prices — ShaadiBaaja" },
      {
        name: "description",
        content:
          "Compare wedding bands, dhol groups, ghodi-baggi and baraat light packages with transparent prices, ratings and team sizes.",
      },
      { property: "og:title", content: "Baraat Services & Prices — ShaadiBaaja" },
      {
        property: "og:description",
        content: "Wedding bands, dhol, ghodi-baggi and lights with transparent prices.",
      },
    ],
  }),
  component: Services,
});

function Services() {
  const { data: categories = [] } = useQuery(categoriesQuery);
  const { data: vendors = [], isLoading } = useQuery(vendorsQuery);
  const [active, setActive] = useState<string>("all");

  const filtered = active === "all" ? vendors : vendors.filter((v) => v.category_id === active);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-4xl text-primary">Our baraat services</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Every team below is verified, priced upfront and available for the current wedding
          season. Pick as many as you need — the booking form adds them all up.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          <button
            onClick={() => setActive("all")}
            className={cn(
              "rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors",
              active === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-foreground hover:bg-secondary",
            )}
          >
            All services
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActive(cat.id)}
              className={cn(
                "rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors",
                active === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-foreground hover:bg-secondary",
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {isLoading ? (
          <p className="mt-10 text-muted-foreground">Loading services…</p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((v) => {
              const slug = categories.find((c) => c.id === v.category_id)?.slug ?? "bands";
              return (
                <article
                  key={v.id}
                  className="overflow-hidden rounded-xl border border-border bg-card shadow-card"
                >
                  <img
                    src={categoryImages[slug]}
                    alt={v.name}
                    loading="lazy"
                    width={900}
                    height={700}
                    className="h-44 w-full object-cover"
                  />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-xl leading-snug text-primary">{v.name}</h2>
                      <span className="flex shrink-0 items-center gap-1 text-sm">
                        <Star className="size-4 fill-gold text-gold" />
                        {v.rating}
                      </span>
                    </div>
                    <p className="mt-1 flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                      {v.city}
                      <span className="flex items-center gap-1">
                        <Users className="size-3" /> {v.members}
                      </span>
                    </p>
                    <p className="mt-3 min-h-12 text-sm text-muted-foreground">{v.description}</p>
                    <div className="mt-5 flex items-center justify-between">
                      <span className="text-lg font-semibold text-primary">
                        {formatINR(v.price)}
                      </span>
                      <Button asChild size="sm">
                        <Link to="/book" search={{ vendor: v.id }}>
                          Book
                        </Link>
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { categoriesQuery, vendorsQuery } from "@/lib/catalog";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  vendor: z.string().optional(),
});

export const Route = createFileRoute("/book")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Book Your Baraat — ShaadiBaaja" },
      {
        name: "description",
        content:
          "Select your band, dhol group, ghodi-baggi and lights, add your wedding date and venue, and send a baraat booking request in one form.",
      },
      { property: "og:title", content: "Book Your Baraat — ShaadiBaaja" },
      {
        property: "og:description",
        content: "Pick your baraat teams and send a booking request in minutes.",
      },
    ],
  }),
  component: BookPage,
});

type Form = {
  customer_name: string;
  phone: string;
  email: string;
  event_date: string;
  baraat_time: string;
  venue: string;
  city: string;
  guest_count: string;
  notes: string;
};

const emptyForm: Form = {
  customer_name: "",
  phone: "",
  email: "",
  event_date: "",
  baraat_time: "",
  venue: "",
  city: "",
  guest_count: "",
  notes: "",
};

function BookPage() {
  const { vendor: preselected } = Route.useSearch();
  const { data: categories = [] } = useQuery(categoriesQuery);
  const { data: vendors = [] } = useQuery(vendorsQuery);

  const [selected, setSelected] = useState<Record<string, number>>(
    preselected ? { [preselected]: 1 } : {},
  );
  const [form, setForm] = useState<Form>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<{ id: string; total: number } | null>(null);

  const total = useMemo(
    () =>
      Object.entries(selected).reduce((sum, [id, qty]) => {
        const v = vendors.find((x) => x.id === id);
        return sum + (v ? Number(v.price) * qty : 0);
      }, 0),
    [selected, vendors],
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = 1;
      return next;
    });
  }

  function setQty(id: string, delta: number) {
    setSelected((prev) => {
      const qty = Math.max(1, Math.min(10, (prev[id] ?? 1) + delta));
      return { ...prev, [id]: qty };
    });
  }

  const update = (key: keyof Form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (Object.keys(selected).length === 0) {
      toast.error("Kam se kam ek service select karein.");
      return;
    }
    setSubmitting(true);
    try {
      // Bookings are created server-side so prices and status can't be forged.
      const result = await submitBooking({
        data: {
          customer_name: form.customer_name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || null,
          event_date: form.event_date,
          baraat_time: form.baraat_time || null,
          venue: form.venue.trim(),
          city: form.city.trim(),
          guest_count: form.guest_count ? Number(form.guest_count) : null,
          notes: form.notes.trim() || null,
          items: Object.entries(selected).map(([vendorId, qty]) => ({
            vendor_id: vendorId,
            quantity: qty,
          })),
        },
      });

      setConfirmed({ id: result.id, total: result.total });
      setSelected({});
      setForm(emptyForm);
      toast.success("Booking request sent!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmed) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="mx-auto max-w-xl px-4 py-20 text-center">
          <CheckCircle2 className="mx-auto size-14 text-accent" />
          <h1 className="mt-5 text-3xl text-primary">Baraat booked!</h1>
          <p className="mt-3 text-muted-foreground">
            Your request is saved. Our team will call you within 24 hours to confirm the teams and
            advance amount.
          </p>
          <div className="mt-6 rounded-xl border border-border bg-card p-5 text-left">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Booking ID</p>
            <p className="font-mono text-sm break-all">{confirmed.id}</p>
            <p className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">
              Estimated total
            </p>
            <p className="text-2xl font-semibold text-primary">{formatINR(confirmed.total)}</p>
          </div>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild>
              <Link to="/my-bookings">View my bookings</Link>
            </Button>
            <Button asChild variant="outline" onClick={() => setConfirmed(null)}>
              <Link to="/services">Book more</Link>
            </Button>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-4xl text-primary">Book your baraat</h1>
        <p className="mt-2 text-muted-foreground">
          Select the teams you want, then fill in your wedding details.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl text-primary">1. Choose services</h2>
              <div className="mt-4 space-y-6">
                {categories.map((cat) => (
                  <div key={cat.id}>
                    <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                      {cat.name}
                    </h3>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {vendors
                        .filter((v) => v.category_id === cat.id)
                        .map((v) => {
                          const isOn = Boolean(selected[v.id]);
                          return (
                            <div
                              key={v.id}
                              className={cn(
                                "rounded-xl border p-4 transition-colors",
                                isOn
                                  ? "border-accent bg-accent/10"
                                  : "border-border bg-card hover:bg-secondary/50",
                              )}
                            >
                              <button
                                type="button"
                                onClick={() => toggle(v.id)}
                                className="w-full text-left"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <span className="font-medium text-primary">{v.name}</span>
                                  <span className="text-sm font-semibold">
                                    {formatINR(v.price)}
                                  </span>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {v.city} · {v.members} members · ⭐ {v.rating}
                                </p>
                              </button>
                              {isOn && (
                                <div className="mt-3 flex items-center gap-2">
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="outline"
                                    className="size-7"
                                    aria-label="Decrease quantity"
                                    onClick={() => setQty(v.id, -1)}
                                  >
                                    <Minus className="size-3" />
                                  </Button>
                                  <span className="w-6 text-center text-sm">{selected[v.id]}</span>
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="outline"
                                    className="size-7"
                                    aria-label="Increase quantity"
                                    onClick={() => setQty(v.id, 1)}
                                  >
                                    <Plus className="size-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl text-primary">2. Wedding details</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="customer_name">Your name *</Label>
                  <Input
                    id="customer_name"
                    required
                    value={form.customer_name}
                    onChange={update("customer_name")}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone number *</Label>
                  <Input
                    id="phone"
                    required
                    inputMode="tel"
                    placeholder="9876543210"
                    value={form.phone}
                    onChange={update("phone")}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={update("email")}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="event_date">Wedding date *</Label>
                  <Input
                    id="event_date"
                    type="date"
                    required
                    value={form.event_date}
                    onChange={update("event_date")}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="baraat_time">Baraat time</Label>
                  <Input
                    id="baraat_time"
                    type="time"
                    value={form.baraat_time}
                    onChange={update("baraat_time")}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="guest_count">Approx. baraatis</Label>
                  <Input
                    id="guest_count"
                    type="number"
                    min={1}
                    value={form.guest_count}
                    onChange={update("guest_count")}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="venue">Baraat start venue *</Label>
                  <Input
                    id="venue"
                    required
                    value={form.venue}
                    onChange={update("venue")}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    required
                    value={form.city}
                    onChange={update("city")}
                    className="mt-1.5"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="notes">Special requests</Label>
                  <Textarea
                    id="notes"
                    rows={3}
                    placeholder="Songs, entry sequence, colour theme…"
                    value={form.notes}
                    onChange={update("notes")}
                    className="mt-1.5"
                  />
                </div>
              </div>
            </section>
          </div>

          <aside className="h-fit rounded-xl border border-border bg-card p-6 shadow-card lg:sticky lg:top-24">
            <h2 className="text-xl text-primary">Your baraat</h2>
            <div className="divider-marigold my-4" />
            {Object.keys(selected).length === 0 ? (
              <p className="text-sm text-muted-foreground">No services selected yet.</p>
            ) : (
              <ul className="space-y-3">
                {Object.entries(selected).map(([id, qty]) => {
                  const v = vendors.find((x) => x.id === id);
                  if (!v) return null;
                  return (
                    <li key={id} className="flex justify-between gap-3 text-sm">
                      <span>
                        {v.name}
                        {qty > 1 && <span className="text-muted-foreground"> × {qty}</span>}
                      </span>
                      <span className="font-medium">{formatINR(Number(v.price) * qty)}</span>
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="divider-marigold my-4" />
            <div className="flex items-center justify-between">
              <span className="text-sm uppercase tracking-widest text-muted-foreground">Total</span>
              <span className="text-2xl font-semibold text-primary">{formatINR(total)}</span>
            </div>
            <Button type="submit" className="mt-5 w-full" size="lg" disabled={submitting}>
              {submitting ? "Sending…" : "Confirm booking request"}
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">
              No payment now. Our team calls you to confirm availability and advance.
            </p>
          </aside>
        </form>
      </main>

      <SiteFooter />
    </div>
  );
}

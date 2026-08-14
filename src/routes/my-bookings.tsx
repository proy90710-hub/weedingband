import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getBookingsByPhone } from "@/lib/booking.functions";
import { formatDate, formatINR } from "@/lib/format";

export const Route = createFileRoute("/my-bookings")({
  head: () => ({
    meta: [
      { title: "My Baraat Bookings — ShaadiBaaja" },
      {
        name: "description",
        content:
          "Enter the phone number you booked with to see your baraat booking history, selected teams, status and total amount.",
      },
      { property: "og:title", content: "My Baraat Bookings — ShaadiBaaja" },
      {
        property: "og:description",
        content: "Look up your baraat bookings using your phone number.",
      },
    ],
  }),
  component: MyBookings;
});

type BookingRow = Awaited<ReturnType<typeof getBookingsByPhone>>[number];

function MyBookings() {
  const lookup = useServerFn(getBookingsByPhone);
  const [phone, setPhone] = useState("");
  const [rows, setRows] = useState<BookingRow[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (phone.trim().length < 6) {
      toast.error("Please enter a valid phone number.");
      return;
    }
    setLoading(true);
    try {
      const result = await lookup({ data: { phone: phone.trim() } });
      setRows(result);
    } catch {
      toast.error("Could not fetch bookings. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-4xl text-primary">My bookings</h1>
        <p className="mt-2 text-muted-foreground">
          Enter the phone number you used while booking to see your baraat records.
        </p>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Label htmlFor="phone">Phone number</Label>
            <Input
              id="phone"
              inputMode="tel"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <Button type="submit" disabled={loading} size="lg">
            <Search className="mr-2 size-4" />
            {loading ? "Searching…" : "Find bookings"}
          </Button>
        </form>

        {rows !== null && rows.length === 0 && (
          <p className="mt-10 rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
            No bookings found for this number.
          </p>
        )}

        <div className="mt-10 space-y-5">
          {(rows ?? []).map((b) => (
            <article key={b.id} className="rounded-xl border border-border bg-card p-6 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl text-primary">{b.customer_name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDate(b.event_date)}
                    {b.baraat_time ? ` · ${b.baraat_time}` : ""} · {b.venue}, {b.city}
                  </p>
                </div>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-widest text-secondary-foreground">
                  {b.status}
                </span>
              </div>

              <ul className="mt-4 space-y-1.5 text-sm">
                {b.booking_items?.map((item, i) => (
                  <li key={i} className="flex justify-between gap-3">
                    <span>
                      {item.vendors?.name}
                      {item.quantity > 1 && (
                        <span className="text-muted-foreground"> × {item.quantity}</span>
                      )}
                    </span>
                    <span className="font-medium">{formatINR(Number(item.price))}</span>
                  </li>
                ))}
              </ul>

              {b.notes && (
                <p className="mt-4 rounded-lg bg-secondary/60 p-3 text-sm text-muted-foreground">
                  {b.notes}
                </p>
              )}

              <div className="divider-marigold my-4" />
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">
                  Booked on {formatDate(b.created_at)}
                </span>
                <span className="text-lg font-semibold text-primary">
                  {formatINR(Number(b.total_price))}
                </span>
              </div>
            </article>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

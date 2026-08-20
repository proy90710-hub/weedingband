import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Pencil, Search, Trash2, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { BookingEditor } from "@/components/BookingEditor";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cancelBooking, deleteBooking, getBookingsByPhone } from "@/lib/booking.functions";
import { formatDate, formatINR } from "@/lib/format";

export const Route = createFileRoute("/my-bookings")({
  head: () => ({
    meta: [
      { title: "My Baraat Bookings — ShaadiBaaja" },
      {
        name: "description",
        content:
          "Enter the phone number you booked with to see your baraat booking history, edit details, change teams, cancel or delete a booking.",
      },
      { property: "og:title", content: "My Baraat Bookings — ShaadiBaaja" },
      {
        property: "og:description",
        content: "Look up, edit, cancel or delete your baraat bookings with your phone number.",
      },
    ],
  }),
  component: MyBookings,
});

type BookingRow = Awaited<ReturnType<typeof getBookingsByPhone>>[number];

function MyBookings() {
  const lookup = useServerFn(getBookingsByPhone);
  const cancelFn = useServerFn(cancelBooking);
  const deleteFn = useServerFn(deleteBooking);
  const [phone, setPhone] = useState("");
  const [rows, setRows] = useState<BookingRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function refresh(num: string) {
    const result = await lookup({ data: { phone: num.trim() } });
    setRows(result);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{10}$/.test(phone.trim())) {
      toast.error("Your number is wrong, please correct 10 digits number");
      return;
    }
    setLoading(true);
    try {
      await refresh(phone);
      setEditingId(null);
    } catch {
      toast.error("Could not fetch bookings. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function onCancelBooking(id: string) {
    if (!confirm("Cancel this booking?")) return;
    setBusyId(id);
    try {
      await cancelFn({ data: { id, phone: phone.trim() } });
      toast.success("Booking cancelled.");
      await refresh(phone);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not cancel booking");
    } finally {
      setBusyId(null);
    }
  }

  async function onDeleteBooking(id: string) {
    if (!confirm("Delete this booking permanently?")) return;
    setBusyId(id);
    try {
      await deleteFn({ data: { id, phone: phone.trim() } });
      toast.success("Booking deleted.");
      await refresh(phone);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete booking");
    } finally {
      setBusyId(null);
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
              inputMode="numeric"
              maxLength={10}
              pattern="\d{10}"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
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

              <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                <div className="flex justify-between gap-3 sm:block">
                  <dt className="text-muted-foreground">Phone</dt>
                  <dd>{b.phone}</dd>
                </div>
                <div className="flex justify-between gap-3 sm:block">
                  <dt className="text-muted-foreground">Email</dt>
                  <dd>{b.email || "—"}</dd>
                </div>
                <div className="flex justify-between gap-3 sm:block">
                  <dt className="text-muted-foreground">Baraatis</dt>
                  <dd>{b.guest_count ?? "—"}</dd>
                </div>
                <div className="flex justify-between gap-3 sm:block">
                  <dt className="text-muted-foreground">Booking ID</dt>
                  <dd className="font-mono text-xs break-all">{b.id}</dd>
                </div>
              </dl>

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

              <div className="mt-4 flex flex-wrap gap-2">
                {b.status !== "cancelled" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(editingId === b.id ? null : b.id)}
                    >
                      <Pencil className="mr-2 size-3.5" />
                      {editingId === b.id ? "Close editor" : "Edit booking"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busyId === b.id}
                      onClick={() => onCancelBooking(b.id)}
                    >
                      <XCircle className="mr-2 size-3.5" />
                      Cancel booking
                    </Button>
                  </>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={busyId === b.id}
                  onClick={() => onDeleteBooking(b.id)}
                >
                  <Trash2 className="mr-2 size-3.5" />
                  Delete
                </Button>
              </div>

              {editingId === b.id && (
                <BookingEditor
                  booking={b}
                  onCancel={() => setEditingId(null)}
                  onSaved={async () => {
                    setEditingId(null);
                    await refresh(phone);
                  }}
                />
              )}
            </article>
          ))}

        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

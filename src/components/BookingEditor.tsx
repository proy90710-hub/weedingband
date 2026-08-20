import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateBooking } from "@/lib/booking.functions";
import { categoriesQuery, vendorsQuery } from "@/lib/catalog";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

export type EditableBooking = {
  id: string;
  customer_name: string;
  phone: string;
  email: string | null;
  event_date: string;
  baraat_time: string | null;
  venue: string;
  city: string;
  guest_count: number | null;
  notes: string | null;
  booking_items: { vendor_id: string; quantity: number }[] | null;
};

export function BookingEditor({
  booking,
  onCancel,
  onSaved,
}: {
  booking: EditableBooking;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const save = useServerFn(updateBooking);
  const { data: categories = [] } = useQuery(categoriesQuery);
  const { data: vendors = [] } = useQuery(vendorsQuery);

  const [selected, setSelected] = useState<Record<string, number>>(() =>
    Object.fromEntries((booking.booking_items ?? []).map((i) => [i.vendor_id, i.quantity])),
  );
  const [form, setForm] = useState({
    customer_name: booking.customer_name,
    email: booking.email ?? "",
    event_date: booking.event_date,
    baraat_time: booking.baraat_time ?? "",
    venue: booking.venue,
    city: booking.city,
    guest_count: booking.guest_count ? String(booking.guest_count) : "",
    notes: booking.notes ?? "",
  });
  const [saving, setSaving] = useState(false);

  const total = useMemo(
    () =>
      Object.entries(selected).reduce((sum, [id, qty]) => {
        const v = vendors.find((x) => x.id === id);
        return sum + (v ? Number(v.price) * qty : 0);
      }, 0),
    [selected, vendors],
  );

  const update = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  function toggle(id: string) {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = 1;
      return next;
    });
  }

  function setQty(id: string, delta: number) {
    setSelected((prev) => ({
      ...prev,
      [id]: Math.max(1, Math.min(10, (prev[id] ?? 1) + delta)),
    }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (Object.keys(selected).length === 0) {
      toast.error("Please select at least one service.");
      return;
    }
    setSaving(true);
    try {
      await save({
        data: {
          id: booking.id,
          customer_name: form.customer_name.trim(),
          phone: booking.phone,
          email: form.email.trim() || null,
          event_date: form.event_date,
          baraat_time: form.baraat_time || null,
          venue: form.venue.trim(),
          city: form.city.trim(),
          guest_count: form.guest_count ? Number(form.guest_count) : null,
          notes: form.notes.trim() || null,
          items: Object.entries(selected).map(([vendor_id, quantity]) => ({
            vendor_id,
            quantity,
          })),
        },
      });
      toast.success("Booking updated!");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update booking");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-5 space-y-6 border-t border-border pt-5">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Edit services
        </h3>
        <div className="mt-3 space-y-4">
          {categories.map((cat) => (
            <div key={cat.id}>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{cat.name}</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {vendors
                  .filter((v) => v.category_id === cat.id)
                  .map((v) => {
                    const isOn = Boolean(selected[v.id]);
                    return (
                      <div
                        key={v.id}
                        className={cn(
                          "rounded-lg border p-3 transition-colors",
                          isOn ? "border-accent bg-accent/10" : "border-border bg-background",
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => toggle(v.id)}
                          className="flex w-full items-start justify-between gap-2 text-left"
                        >
                          <span className="text-sm font-medium text-primary">{v.name}</span>
                          <span className="text-sm">{formatINR(v.price)}</span>
                        </button>
                        {isOn && (
                          <div className="mt-2 flex items-center gap-2">
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
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`name-${booking.id}`}>Your name</Label>
          <Input
            id={`name-${booking.id}`}
            required
            value={form.customer_name}
            onChange={update("customer_name")}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor={`email-${booking.id}`}>Email</Label>
          <Input
            id={`email-${booking.id}`}
            type="email"
            value={form.email}
            onChange={update("email")}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor={`date-${booking.id}`}>Wedding date</Label>
          <Input
            id={`date-${booking.id}`}
            type="date"
            required
            value={form.event_date}
            onChange={update("event_date")}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor={`time-${booking.id}`}>Baraat time</Label>
          <Input
            id={`time-${booking.id}`}
            type="time"
            value={form.baraat_time}
            onChange={update("baraat_time")}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor={`venue-${booking.id}`}>Venue</Label>
          <Input
            id={`venue-${booking.id}`}
            required
            value={form.venue}
            onChange={update("venue")}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor={`city-${booking.id}`}>City</Label>
          <Input
            id={`city-${booking.id}`}
            required
            value={form.city}
            onChange={update("city")}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor={`guests-${booking.id}`}>Approx. baraatis</Label>
          <Input
            id={`guests-${booking.id}`}
            type="number"
            min={1}
            value={form.guest_count}
            onChange={update("guest_count")}
            className="mt-1.5"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor={`notes-${booking.id}`}>Special requests</Label>
          <Textarea
            id={`notes-${booking.id}`}
            rows={3}
            value={form.notes}
            onChange={update("notes")}
            className="mt-1.5"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">
          New total: <strong className="text-primary">{formatINR(total)}</strong>
        </span>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}

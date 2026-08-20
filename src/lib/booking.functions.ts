import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const phoneSchema = z.object({ phone: z.string().min(6).max(20) });

const createBookingSchema = z.object({
  customer_name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(6).max(20),
  email: z.string().trim().email().max(200).nullable().optional(),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  baraat_time: z.string().trim().max(20).nullable().optional(),
  venue: z.string().trim().min(2).max(200),
  city: z.string().trim().min(2).max(100),
  guest_count: z.number().int().min(1).max(100000).nullable().optional(),
  notes: z.string().trim().max(1000).nullable().optional(),
  items: z
    .array(
      z.object({
        vendor_id: z.string().uuid(),
        quantity: z.number().int().min(1).max(10),
      }),
    )
    .min(1)
    .max(20),
});

/**
 * Create a booking. Runs server-side: prices come from the vendors table, and
 * status/total are never trusted from the client.
 */
export const createBooking = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => createBookingSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const vendorIds = [...new Set(data.items.map((i) => i.vendor_id))];
    const { data: vendors, error: vendorError } = await supabaseAdmin
      .from("vendors")
      .select("id, price")
      .eq("active", true)
      .in("id", vendorIds);

    if (vendorError) throw new Error("Could not verify the selected services.");
    if (!vendors || vendors.length !== vendorIds.length) {
      throw new Error("One or more selected services are unavailable.");
    }

    const priceById = new Map(vendors.map((v) => [v.id, Number(v.price)]));
    const items = data.items.map((i) => ({
      vendor_id: i.vendor_id,
      quantity: i.quantity,
      price: (priceById.get(i.vendor_id) ?? 0) * i.quantity,
    }));
    const total = items.reduce((sum, i) => sum + i.price, 0);

    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .insert({
        customer_name: data.customer_name,
        phone: data.phone,
        email: data.email || null,
        event_date: data.event_date,
        baraat_time: data.baraat_time || null,
        venue: data.venue,
        city: data.city,
        guest_count: data.guest_count ?? null,
        notes: data.notes || null,
        total_price: total,
        status: "pending",
      })
      .select("id")
      .single();

    if (error || !booking) throw new Error("Could not save your booking. Please try again.");

    const { error: itemsError } = await supabaseAdmin
      .from("booking_items")
      .insert(items.map((i) => ({ ...i, booking_id: booking.id })));

    if (itemsError) {
      await supabaseAdmin.from("bookings").delete().eq("id", booking.id);
      throw new Error("Could not save your booking. Please try again.");
    }

    return { id: booking.id, total };
  });

/**
 * Look up a customer's own bookings by the phone number they booked with.
 * Bookings are not readable from the browser (RLS blocks it), so this runs
 * server-side and only ever returns rows matching the exact phone number.
 */
export const getBookingsByPhone = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => phoneSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: bookings, error } = await supabaseAdmin
      .from("bookings")
      .select(
        "id, customer_name, phone, email, event_date, baraat_time, venue, city, guest_count, notes, total_price, status, created_at, booking_items(vendor_id, quantity, price, vendors(name, city))",
      )
      .eq("phone", data.phone.trim())
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw new Error("Could not load your bookings. Please try again.");
    return bookings ?? [];
  });

const updateBookingSchema = createBookingSchema.extend({
  id: z.string().uuid(),
});

async function assertOwner(id: string, phone: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: existing, error } = await supabaseAdmin
    .from("bookings")
    .select("id, phone, status")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error("Could not load this booking.");
  if (!existing || existing.phone !== phone.trim()) {
    throw new Error("Booking not found for this phone number.");
  }
  if (existing.status === "cancelled") {
    throw new Error("This booking is already cancelled.");
  }
  return existing;
}

/**
 * Update an existing booking. Ownership is proven by the phone number the
 * booking was created with; prices and total are recomputed server-side.
 */
export const updateBooking = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => updateBookingSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await assertOwner(data.id, data.phone);

    const vendorIds = [...new Set(data.items.map((i) => i.vendor_id))];
    const { data: vendors, error: vendorError } = await supabaseAdmin
      .from("vendors")
      .select("id, price")
      .eq("active", true)
      .in("id", vendorIds);

    if (vendorError) throw new Error("Could not verify the selected services.");
    if (!vendors || vendors.length !== vendorIds.length) {
      throw new Error("One or more selected services are unavailable.");
    }

    const priceById = new Map(vendors.map((v) => [v.id, Number(v.price)]));
    const items = data.items.map((i) => ({
      booking_id: data.id,
      vendor_id: i.vendor_id,
      quantity: i.quantity,
      price: (priceById.get(i.vendor_id) ?? 0) * i.quantity,
    }));
    const total = items.reduce((sum, i) => sum + i.price, 0);

    const { error: updateError } = await supabaseAdmin
      .from("bookings")
      .update({
        customer_name: data.customer_name,
        email: data.email || null,
        event_date: data.event_date,
        baraat_time: data.baraat_time || null,
        venue: data.venue,
        city: data.city,
        guest_count: data.guest_count ?? null,
        notes: data.notes || null,
        total_price: total,
      })
      .eq("id", data.id);

    if (updateError) throw new Error("Could not update your booking. Please try again.");

    await supabaseAdmin.from("booking_items").delete().eq("booking_id", data.id);
    const { error: itemsError } = await supabaseAdmin.from("booking_items").insert(items);
    if (itemsError) throw new Error("Could not update the selected services.");

    return { id: data.id, total };
  });

const ownerSchema = z.object({
  id: z.string().uuid(),
  phone: z.string().trim().min(6).max(20),
});

/** Cancel a booking (keeps the record, marks it cancelled). */
export const cancelBooking = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => ownerSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await assertOwner(data.id, data.phone);

    const { error } = await supabaseAdmin
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", data.id);

    if (error) throw new Error("Could not cancel this booking.");
    return { id: data.id };
  });

/** Permanently delete a booking and its items. */
export const deleteBooking = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => ownerSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existing, error: loadError } = await supabaseAdmin
      .from("bookings")
      .select("id, phone")
      .eq("id", data.id)
      .maybeSingle();

    if (loadError) throw new Error("Could not load this booking.");
    if (!existing || existing.phone !== data.phone.trim()) {
      throw new Error("Booking not found for this phone number.");
    }

    await supabaseAdmin.from("booking_items").delete().eq("booking_id", data.id);
    const { error } = await supabaseAdmin.from("bookings").delete().eq("id", data.id);
    if (error) throw new Error("Could not delete this booking.");
    return { id: data.id };
  });


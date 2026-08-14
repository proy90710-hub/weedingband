import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const phoneSchema = z.object({ phone: z.string().min(6).max(20) });

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
        "id, customer_name, phone, event_date, baraat_time, venue, city, guest_count, notes, total_price, status, created_at, booking_items(quantity, price, vendors(name, city))",
      )
      .eq("phone", data.phone.trim())
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw new Error(error.message);
    return bookings ?? [];
  });

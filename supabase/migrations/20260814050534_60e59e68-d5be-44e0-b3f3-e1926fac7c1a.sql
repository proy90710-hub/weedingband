DROP POLICY IF EXISTS "Anyone can create a booking" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can add items to a booking" ON public.booking_items;

REVOKE INSERT, UPDATE, DELETE, SELECT ON public.bookings FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, SELECT ON public.booking_items FROM anon, authenticated;

GRANT ALL ON public.bookings TO service_role;
GRANT ALL ON public.booking_items TO service_role;

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_items ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_status_check CHECK (status IN ('pending','confirmed','cancelled')),
  ADD CONSTRAINT bookings_total_price_check CHECK (total_price >= 0);

ALTER TABLE public.booking_items
  ADD CONSTRAINT booking_items_quantity_check CHECK (quantity > 0 AND quantity <= 10),
  ADD CONSTRAINT booking_items_price_check CHECK (price >= 0);
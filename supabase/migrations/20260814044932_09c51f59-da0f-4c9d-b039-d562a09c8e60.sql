CREATE TABLE public.service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'music',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category_id uuid NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
  city text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric(10,2) NOT NULL DEFAULT 0,
  rating numeric(2,1) NOT NULL DEFAULT 4.5,
  members int NOT NULL DEFAULT 1,
  image_url text,
  featured boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  phone text NOT NULL,
  email text,
  event_date date NOT NULL,
  baraat_time text,
  venue text NOT NULL,
  city text NOT NULL,
  guest_count int,
  notes text,
  total_price numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.booking_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  vendor_id uuid NOT NULL REFERENCES public.vendors(id),
  quantity int NOT NULL DEFAULT 1,
  price numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_vendors_category ON public.vendors(category_id);
CREATE INDEX idx_booking_items_booking ON public.booking_items(booking_id);
CREATE INDEX idx_bookings_phone ON public.bookings(phone);

GRANT SELECT ON public.service_categories TO anon, authenticated;
GRANT SELECT ON public.vendors TO anon, authenticated;
GRANT INSERT ON public.bookings TO anon, authenticated;
GRANT INSERT ON public.booking_items TO anon, authenticated;
GRANT ALL ON public.service_categories TO service_role;
GRANT ALL ON public.vendors TO service_role;
GRANT ALL ON public.bookings TO service_role;
GRANT ALL ON public.booking_items TO service_role;

ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are publicly viewable" ON public.service_categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Vendors are publicly viewable" ON public.vendors FOR SELECT TO anon, authenticated USING (active);
CREATE POLICY "Anyone can create a booking" ON public.bookings FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can add items to a booking" ON public.booking_items FOR INSERT TO anon, authenticated WITH CHECK (true);

INSERT INTO public.service_categories (name, slug, description, icon, sort_order) VALUES
('Wedding Bands', 'bands', 'Brass bands with full uniform, trumpets and shehnai for the classic baraat sound.', 'music', 1),
('Dhol Groups', 'dhol', 'High-energy dhol players and nagada teams to set the baraat on fire.', 'drum', 2),
('Ghodi & Baggi', 'ghodi-baggi', 'Decorated mare, horse-drawn baggi and vintage buggy for the dulha.', 'horse', 3),
('Lights & Decor', 'lights', 'Baraat light walas, LED phool jhaad, flower shower and cold pyro.', 'lightbulb', 4);

INSERT INTO public.vendors (name, category_id, city, description, price, rating, members, featured) VALUES
('Shri Ganesh Brass Band', (SELECT id FROM public.service_categories WHERE slug='bands'), 'Delhi', '25-member brass band in royal red uniform with trumpet, clarinet and shehnai.', 45000, 4.8, 25, true),
('Royal Rajwada Band', (SELECT id FROM public.service_categories WHERE slug='bands'), 'Jaipur', 'Rajasthani style band with safa-clad musicians and folk repertoire.', 62000, 4.9, 30, true),
('Milan Wedding Band', (SELECT id FROM public.service_categories WHERE slug='bands'), 'Lucknow', 'Affordable 15-member band, perfect for intimate baraats.', 28000, 4.4, 15, false),
('Punjab Dhol Kings', (SELECT id FROM public.service_categories WHERE slug='dhol'), 'Amritsar', '6 dhol players in Punjabi attire, bhangra beats guaranteed.', 18000, 4.9, 6, true),
('Nagada Nights Group', (SELECT id FROM public.service_categories WHERE slug='dhol'), 'Delhi', 'Dhol + nagada combo with LED dhol option for night baraats.', 22000, 4.7, 8, false),
('Desi Beat Dholwale', (SELECT id FROM public.service_categories WHERE slug='dhol'), 'Mumbai', '4 dhol players, 2 hours performance with entry sequence.', 12000, 4.5, 4, false),
('Maharaja Ghodi Service', (SELECT id FROM public.service_categories WHERE slug='ghodi-baggi'), 'Delhi', 'White decorated mare with velvet jhool and handler.', 15000, 4.6, 2, true),
('Shahi Baggi Wale', (SELECT id FROM public.service_categories WHERE slug='ghodi-baggi'), 'Jaipur', 'Golden vintage baggi with two horses and coachman in livery.', 35000, 4.8, 3, false),
('Vintage Car & Ghodi', (SELECT id FROM public.service_categories WHERE slug='ghodi-baggi'), 'Chandigarh', 'Choose between decorated ghodi or a vintage convertible entry.', 25000, 4.5, 2, false),
('Jhilmil Light Wale', (SELECT id FROM public.service_categories WHERE slug='lights'), 'Delhi', '20 light bearers with LED phool jhaad and generator trolley.', 20000, 4.6, 20, true),
('Sparkle Baraat Lights', (SELECT id FROM public.service_categories WHERE slug='lights'), 'Kanpur', 'Cold pyro, flower shower machine and LED tunnel for the entry.', 30000, 4.7, 12, false),
('Roshni Decor Crew', (SELECT id FROM public.service_categories WHERE slug='lights'), 'Mumbai', 'Full baraat lighting with themed colour palette and smoke effects.', 26000, 4.4, 14, false);
# ShaadiBaaja — Wedding Band & Baraat Booking Platform

**Developed by Priya Roy** · Built during internship at Talking Crooks IT Pvt. Ltd.

## What it does

ShaadiBaaja lets a family plan and book an entire wedding baraat online — brass bands,
dhol groups, ghodi/baggi and baraat lights — with upfront prices, a live total and a
booking record they can look up later with their phone number.

### Core features (in this version)

- Service catalogue with category filters, ratings, team size and pricing
- Multi-service booking cart with quantities and a live total
- Booking form saving to a relational database (booking + booking items)
- Booking history lookup by phone number (server-side, privacy safe)
- About page with tech stack and database schema
- Consistent branding: name, logo, colour theme, developer credit in the footer

### Out of scope for now

Customer/vendor logins, online payments, per-vendor availability calendar, reviews.

## Tech stack

| Layer    | Choice                                                     |
| -------- | ---------------------------------------------------------- |
| Frontend | React 19 + TanStack Start (SSR), Tailwind CSS v4, shadcn/ui |
| Backend  | TanStack server functions (typed RPC)                      |
| Database | PostgreSQL with row-level security                          |
| Fonts    | Marcellus (display) + Karla (body)                          |

Chosen because one toolchain covers frontend, backend and hosting, while PostgreSQL
gives real foreign keys and relationships for the schema requirement.

## Database schema

```
service_categories (id PK, name, slug UNIQUE, description, icon, sort_order, created_at)
vendors            (id PK, category_id FK -> service_categories, name, city, description,
                    price, rating, members, image_url, featured, active, created_at)
bookings           (id PK, customer_name, phone, email, event_date, baraat_time, venue,
                    city, guest_count, notes, total_price, status, created_at)
booking_items      (id PK, booking_id FK -> bookings, vendor_id FK -> vendors,
                    quantity, price, created_at)
```

Relationships: `service_categories 1:N vendors`, `bookings 1:N booking_items`,
`vendors 1:N booking_items`.

Access rules: categories and vendors are publicly readable; anyone can create a booking;
booking details are never readable from the browser and are only returned by the
server-side lookup filtered on the exact phone number.

## Run it locally

```bash
bun install     # or: npm install
bun run dev     # starts the app on http://localhost:8080
```

Environment variables for the database connection live in `.env`.

## Pages

| Route          | Screen                                        |
| -------------- | --------------------------------------------- |
| `/`            | Home — hero, categories, how it works, popular |
| `/services`    | Full catalogue with category filters           |
| `/book`        | Booking form with service selection and total  |
| `/my-bookings` | Booking history lookup by phone                |
| `/about`       | Project, tech stack, schema, credits           |

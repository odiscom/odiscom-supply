# Odiscom Supply

B2B telecom supply platform for fiber, wireless infrastructure, quoting, PDF quote generation, quote acceptance, and order management.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## Supabase setup

Run `supabase/schema.sql` in the Supabase SQL editor.

## Main routes

- `/` homepage
- `/shop` catalog
- `/quote` quote request form
- `/admin/quotes` quote dashboard
- `/admin/orders` order dashboard

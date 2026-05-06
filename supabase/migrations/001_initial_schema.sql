-- ─────────────────────────────────────────────────────────────
-- Deyjung Restro & Pizzeria — Initial Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ─────────────────────────────────────────────────────────────

-- Menu items (synced from Loyverse or uploaded via CSV)
CREATE TABLE IF NOT EXISTS menu_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loyverse_item_id TEXT UNIQUE,
  name            TEXT NOT NULL,
  description     TEXT,
  category        TEXT,
  price           NUMERIC(10, 2) NOT NULL DEFAULT 0,
  image_url       TEXT,
  is_available    BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-incrementing order number (starts at 1001 for readability)
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1001;

-- Customer orders
CREATE TABLE IF NOT EXISTS orders (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number        INTEGER NOT NULL DEFAULT nextval('order_number_seq'),
  order_type          TEXT NOT NULL CHECK (order_type IN ('dine_in', 'takeaway')),
  table_number        INTEGER,
  customer_name       TEXT,
  customer_note       TEXT,
  subtotal            NUMERIC(10, 2) NOT NULL,
  loyverse_receipt_id TEXT,
  status              TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Line items belonging to each order
CREATE TABLE IF NOT EXISTS order_items (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id         UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id     UUID REFERENCES menu_items(id) ON DELETE SET NULL,
  loyverse_item_id TEXT,
  item_name        TEXT NOT NULL,
  item_price       NUMERIC(10, 2) NOT NULL,
  quantity         INTEGER NOT NULL DEFAULT 1,
  item_note        TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Row-Level Security ───────────────────────────────────────

ALTER TABLE menu_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Anyone (customers) can read available menu items
CREATE POLICY "Public read menu_items"
  ON menu_items FOR SELECT USING (true);

-- Anyone (customers) can place orders
CREATE POLICY "Public insert orders"
  ON orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Public insert order_items"
  ON order_items FOR INSERT WITH CHECK (true);

-- Anyone can read orders (admin dashboard — add auth later if needed)
CREATE POLICY "Public read orders"
  ON orders FOR SELECT USING (true);

CREATE POLICY "Public read order_items"
  ON order_items FOR SELECT USING (true);

-- Staff can update order status
CREATE POLICY "Public update orders"
  ON orders FOR UPDATE USING (true);

-- ─── Realtime ─────────────────────────────────────────────────
-- Enable realtime for the orders table so the admin dashboard
-- receives live updates without polling.
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

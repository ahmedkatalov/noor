-- Availability flag: позволяет персоналу временно скрывать товар как "нет в наличии",
-- не удаляя его (is_active остаётся TRUE).
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS is_available BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_products_is_available ON products(is_available);

-- PREVIEW DRAFT ONLY: do not apply until the approved repricing payload is confirmed.
-- Baseline is public.products.price only. products.original_price is intentionally not read or changed.
-- The guard prevents applying this approved 252-row preview to a changed catalog.
BEGIN;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS msrp_price numeric(12,2),
  ADD COLUMN IF NOT EXISTS price_hkd numeric(12,2);

DO $$
DECLARE
  product_count integer;
  id_price_checksum text;
BEGIN
  SELECT count(*) INTO product_count FROM public.products;
  IF product_count <> 252 THEN
    RAISE EXCEPTION 'Expected 252 product rows from approved preview; found %; no prices updated', product_count;
  END IF;
  SELECT md5(string_agg(id::text || '|' || price::text, E'\n' ORDER BY mofu_sku NULLS LAST, id))
    INTO id_price_checksum
  FROM public.products;
  IF id_price_checksum IS DISTINCT FROM 'ebc3ba5eae60481dfeae38f6357fd4e2' THEN
    RAISE EXCEPTION 'The product ID/price snapshot changed after preview; no prices updated';
  END IF;
END $$;

UPDATE public.products
SET msrp_price = COALESCE(msrp_price, price),
    price = (floor(COALESCE(msrp_price, price) * 1.12) + 0.90)::numeric(12,2),
    price_hkd = (floor(COALESCE(msrp_price, price) * 1.12) + 0.90)::numeric(12,2),
    current_hkd = (floor(COALESCE(msrp_price, price) * 1.12) + 0.90)::numeric(12,2);

DO $$
DECLARE
  invalid_count integer;
BEGIN
  SELECT count(*) INTO invalid_count
  FROM public.products
  WHERE msrp_price IS NULL
     OR price IS DISTINCT FROM (floor(msrp_price * 1.12) + 0.90)::numeric(12,2)
     OR price_hkd IS DISTINCT FROM price
     OR current_hkd IS DISTINCT FROM price
     OR round(price * 100)::integer % 100 <> 90;
  IF invalid_count <> 0 THEN
    RAISE EXCEPTION 'Post-update validation failed for % product rows', invalid_count;
  END IF;
END $$;

COMMIT;

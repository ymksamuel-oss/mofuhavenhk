-- Correct the 2026-10-08 repricing mistake: never derive a new MSRP from the old retail price.
-- Source: the Admin pricing workflow's JPY cost (legacy DB column cost_price_rmb).
-- Formula: MSRP = round(cost_jpy * 0.052 * 2.2); sale = floor(MSRP * 1.12) + 0.90.
-- All 252 production products were verified to have positive costs before this migration.
BEGIN;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS msrp_price numeric(12,2),
  ADD COLUMN IF NOT EXISTS price_hkd numeric(12,2);

DO $$
DECLARE
  product_count integer;
  invalid_cost_count integer;
  target_cost numeric;
BEGIN
  SELECT count(*) INTO product_count FROM public.products;
  IF product_count <> 252 THEN
    RAISE EXCEPTION 'Expected 252 verified products; found %; no prices updated', product_count;
  END IF;

  SELECT count(*) INTO invalid_cost_count
  FROM public.products
  WHERE cost_price_rmb IS NULL OR cost_price_rmb <= 0;
  IF invalid_cost_count <> 0 THEN
    RAISE EXCEPTION 'Found % products without a positive verified JPY cost; no prices updated', invalid_cost_count;
  END IF;

  SELECT cost_price_rmb INTO target_cost
  FROM public.products
  WHERE mofu_sku = '4976064025357';
  IF target_cost IS DISTINCT FROM 275::numeric THEN
    RAISE EXCEPTION 'Unexpected JPY cost for SKU 4976064025357: %; no prices updated', target_cost;
  END IF;
END $$;

WITH recalculated AS (
  SELECT
    id,
    round(cost_price_rmb * 0.052 * 2.2, 0)::numeric(12,2) AS suggested_retail_price
  FROM public.products
  WHERE cost_price_rmb > 0
)
UPDATE public.products AS product
SET msrp_price = recalculated.suggested_retail_price,
    price = (floor(recalculated.suggested_retail_price * 1.12) + 0.90)::numeric(12,2),
    price_hkd = (floor(recalculated.suggested_retail_price * 1.12) + 0.90)::numeric(12,2),
    current_hkd = (floor(recalculated.suggested_retail_price * 1.12) + 0.90)::numeric(12,2),
    original_price = NULL
FROM recalculated
WHERE product.id = recalculated.id;

COMMENT ON COLUMN public.products.cost_price_rmb IS
  'Legacy column name; current Mofu Haven catalogue values are supplier unit cost in JPY and are interpreted as cost_jpy by Admin pricing.';

DO $$
DECLARE
  invalid_count integer;
  target_price numeric;
BEGIN
  SELECT count(*) INTO invalid_count
  FROM public.products
  WHERE msrp_price IS DISTINCT FROM round(cost_price_rmb * 0.052 * 2.2, 0)::numeric(12,2)
     OR price IS DISTINCT FROM (floor(msrp_price * 1.12) + 0.90)::numeric(12,2)
     OR price_hkd IS DISTINCT FROM price
     OR current_hkd IS DISTINCT FROM price
     OR original_price IS NOT NULL
     OR round(price * 100)::integer % 100 <> 90;
  IF invalid_count <> 0 THEN
    RAISE EXCEPTION 'Post-update pricing validation failed for % products', invalid_count;
  END IF;

  SELECT price INTO target_price
  FROM public.products
  WHERE mofu_sku = '4976064025357';
  IF target_price IS DISTINCT FROM 34.90::numeric THEN
    RAISE EXCEPTION 'Target SKU 4976064025357 should be HK$34.90; found %', target_price;
  END IF;
END $$;

COMMIT;

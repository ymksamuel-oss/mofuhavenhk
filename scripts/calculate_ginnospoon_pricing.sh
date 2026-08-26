#!/usr/bin/env bash
set -euo pipefail

FX=1.1654
MARGIN=0.45
DENOMINATOR=0.55

printf 'sku\tcost_cny\tcost_hkd\ttarget_hkd\tretail_hkd\n'
while IFS=$'\t' read -r sku cost; do
  cost_hkd=$(awk -v c="$cost" -v fx="$FX" 'BEGIN { printf "%.6f", c * fx }')
  target_hkd=$(awk -v h="$cost_hkd" -v d="$DENOMINATOR" 'BEGIN { printf "%.6f", h / d }')
  retail_hkd=$(awk -v t="$target_hkd" 'BEGIN { dollars = int(t); cents = int((t - dollars) * 100 + 0.999999); if (cents <= 90) printf "%d.90", dollars; else printf "%d.90", dollars + 1 }')
  printf '%s\t%s\t%s\t%s\t%s\n' "$sku" "$cost" "$cost_hkd" "$target_hkd" "$retail_hkd"
done <<'PRODUCTS'
hairball_240g	44.80
cream_tuna_chicken_180g	46.80
cream_fish_chicken_three_180g	46.80
cream_fish_chicken_two_180g	46.80
cream_hairball_180g	46.80
shimi_tuna_chicken_192g	46.80
shimi_tuna_seabream_192g	46.80
shimi_vomit_care_192g	46.80
senior_kidney_200g	46.80
kitten_fish_240g	46.80
PRODUCTS

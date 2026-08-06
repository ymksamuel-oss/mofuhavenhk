#!/usr/bin/env python3
"""
Download one real photograph per catalog SKU (Unsplash CDN / Openverse /
Wikimedia Commons). No AI-generated or illustrated artwork.
"""

from __future__ import annotations

import io
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PRODUCTS_TS = ROOT / "src" / "lib" / "products.ts"
OUT_DIR = ROOT / "public" / "products"
ATTR_PATH = OUT_DIR / "ATTRIBUTION.json"
UA = {
    "User-Agent": (
        "MofuHavenHK/1.0 (+https://github.com/ymksamuel-oss/mofuhavenhk; "
        "sourcing CC/commercial pet-product photographs for storefront)"
    )
}

# Curated Unsplash CDN photos (real camera photos, Unsplash License).
# Assigned preferentially by keyword; leftovers fill remaining SKUs.
CURATED_UNSPLASH: list[tuple[list[str], str]] = [
    (["cat-food", "bestseller-cat-food", "deal-food"], "https://images.unsplash.com/photo-1596854236500-a0b80b17154e"),
    (["dog-food", "deal-food"], "https://images.unsplash.com/photo-1647616350787-6428e907a7fa"),
    (["kibble", "cat-food"], "https://images.unsplash.com/photo-1764249453891-84799ed79e9e"),
    (["cat-food", "bowl"], "https://images.unsplash.com/photo-1558993457-4bc6ec2c3734"),
    (["litter", "tofu"], "https://images.unsplash.com/photo-1712804995181-53405b86f476"),
    (["fountain", "water"], "https://images.unsplash.com/photo-1772800562154-2a321e304f19"),
    (["carrier", "backpack", "outdoor-pet-carrier"], "https://images.unsplash.com/photo-1572008125409-1b013b702875"),
    (["carrier", "bag"], "https://images.unsplash.com/photo-1767352630502-d07b98d73be1"),
    (["collar", "leash", "harness", "wafuu"], "https://images.unsplash.com/photo-1578667155203-9bed7fd07d0c"),
    (["toy", "chew", "ball"], "https://images.unsplash.com/photo-1749000684397-e9b7d619c6e2"),
    (["toy", "dog"], "https://images.unsplash.com/photo-1639029187205-8fc7e01b1a97"),
    (["toy", "dog"], "https://images.unsplash.com/photo-1589924749359-9697080c3577"),
    (["toy", "dog"], "https://images.unsplash.com/photo-1591946614720-90a587da4a36"),
    (["leash", "harness"], "https://images.unsplash.com/photo-1619980073677-cae31ed7cede"),
    (["bed", "pet-bed"], "https://images.unsplash.com/photo-1541188495357-ad2dc89487f4"),
    (["bed"], "https://images.unsplash.com/photo-1575337582562-a9bb16ed3cc8"),
    (["dog-food"], "https://images.unsplash.com/photo-1601758228006-964e41e5e8eb"),
    (["dog-food"], "https://images.unsplash.com/photo-1655210913074-e5c7f651bc46"),
    (["dog-food"], "https://images.unsplash.com/photo-1658418171785-6effc7240676"),
    (["treat", "snack", "jerky"], "https://images.unsplash.com/photo-1596491112146-f442e098810f"),
    (["toy"], "https://images.unsplash.com/photo-1477884143921-51d0a574ee09"),
    (["toy"], "https://images.unsplash.com/photo-1587203915986-228a25ea2b7e"),
    (["toy"], "https://images.unsplash.com/photo-1587559070757-f72a388edbba"),
    (["toy"], "https://images.unsplash.com/photo-1597046902504-dfae3612605f"),
    (["toy"], "https://images.unsplash.com/photo-1599867685938-9d7701a2d1ab"),
    (["toy"], "https://images.unsplash.com/photo-1610556009296-a3125836f118"),
    (["toy"], "https://images.unsplash.com/photo-1616887446499-27116f0e3b05"),
    (["toy"], "https://images.unsplash.com/photo-1618397360709-9dd900837411"),
    (["toy"], "https://images.unsplash.com/photo-1624609602652-b8ca6234bace"),
    (["toy"], "https://images.unsplash.com/photo-1627323721367-94128c3fa0f7"),
    (["toy"], "https://images.unsplash.com/photo-1687268783037-a116c975647d"),
    (["dog-food"], "https://images.unsplash.com/photo-1604544203292-0daa7f847478"),
    (["dog-food"], "https://images.unsplash.com/photo-1655210913315-e8147faf7600"),
    (["dog-food"], "https://images.unsplash.com/photo-1658418205277-6baf0f57b191"),
    (["dog-food"], "https://images.unsplash.com/photo-1676193866128-03a926df76ef"),
    (["dog-food"], "https://images.unsplash.com/photo-1682536192307-c25211b1d4ac"),
    (["dog-food"], "https://images.unsplash.com/photo-1695023267262-7f4ab64152b2"),
    (["dog-food"], "https://images.unsplash.com/photo-1695169954725-fa757fd7315c"),
    (["dog-food"], "https://images.unsplash.com/photo-1714068691210-073dc52c6c1d"),
    (["dog-food"], "https://images.unsplash.com/photo-1714068691256-cd3d65f97795"),
    (["dog-food"], "https://images.unsplash.com/photo-1745252798506-29500efc5b39"),
]

# Direct Wikimedia / Flickr product-style photographs for hard-to-match SKUs.
DIRECT_URLS: dict[str, tuple[str, str]] = {
    "cat-tofu-litter-6l": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Fresh_cat_litter.JPG/1280px-Fresh_cat_litter.JPG",
        "Wikimedia Commons — Fresh cat litter.JPG",
    ),
    "bestseller-litter-box": (
        "https://upload.wikimedia.org/wikipedia/commons/4/48/Modkat_Cat_Litter_Box_White_by_Modko.jpg",
        "Wikimedia Commons — Modkat Cat Litter Box White by Modko.jpg",
    ),
    "dog-chew-toy": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Blue_dog_bone_toy.JPG/1280px-Blue_dog_bone_toy.JPG",
        "Wikimedia Commons — Blue dog bone toy.JPG",
    ),
    "outdoor-pet-stroller": (
        "https://upload.wikimedia.org/wikipedia/commons/4/4f/A_domestic_pet_cat_inside_of_a_pet_stroller.jpg",
        "Wikimedia Commons — A domestic pet cat inside of a pet stroller.jpg",
    ),
    "pet-shampoo": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Pet_shampoo_bar_virgin_coconut_oil_Gliricidia_sepium5.jpg/1280px-Pet_shampoo_bar_virgin_coconut_oil_Gliricidia_sepium5.jpg",
        "Wikimedia Commons — Pet shampoo bar virgin coconut oil…",
    ),
}

# Openverse / Wikimedia search queries per product id.
QUERIES: dict[str, list[str]] = {
    "cat-bonito-flakes": ["bonito flakes package", "katsuobushi", "dried fish flakes food"],
    "cat-auto-water-fountain": ["cat water fountain", "pet water fountain"],
    "cat-tofu-litter-6l": ["cat litter bag", "tofu cat litter"],
    "cat-catnip-toy": ["catnip toy", "cat toy ball"],
    "cat-window-perch": ["cat window perch", "cat hammock window"],
    "dog-food-1-5kg": ["dog food bag", "dog kibble bag"],
    "dog-dental-chews": ["dog dental chew", "dog chew stick"],
    "dog-warm-coat": ["dog coat jacket", "dog sweater coat"],
    "dog-training-pads": ["dog training pad", "puppy pad"],
    "dog-raincoat": ["dog raincoat", "dog in raincoat"],
    "dog-wafuu-collar": ["dog collar bell", "dog collar"],
    "dog-chew-toy": ["dog rubber chew toy", "dog bone toy"],
    "dog-travel-bowl": ["foldable dog bowl", "silicone pet bowl"],
    "cat-freeze-dried-treats": ["freeze dried cat treats", "cat treats bag"],
    "dog-dried-meat-treats": ["dog jerky treats", "dog meat treats"],
    "assorted-treats-giftbox": ["pet treats gift box", "dog biscuits box"],
    "snack-chicken-jerky": ["chicken jerky dog", "chicken breast jerky pet"],
    "snack-cheese-stick": ["dog cheese treat", "pet cheese stick"],
    "snack-fish-cracker": ["cat fish treats", "cat biscuits"],
    "snack-sweet-potato-chips": ["sweet potato dog treat", "dog vegetable treats"],
    "snack-scallop-jerky": ["dried scallop food", "seafood dog treat"],
    "toy-neko-ichi-wobble-wand": ["cat feather wand toy", "cat teaser toy"],
    "toy-petio-silvervine-chew": ["cat chew stick toy", "matatabi cat toy"],
    "toy-richell-treat-ball": ["cat treat ball", "interactive cat ball"],
    "toy-doggyman-cotton-rope-bone": ["dog rope toy bone", "cotton rope dog toy"],
    "toy-supercat-disc-launcher": ["cat toy disc", "cat fetch toy"],
    "toy-adies-tunnel-scratcher": ["cat cardboard tunnel", "cat scratcher tunnel"],
    "toy-petio-plush-squeaky-animal": ["dog plush squeaky toy", "stuffed dog toy"],
    "toy-mindup-feather-wand": ["cat feather wand", "interactive cat wand"],
    "toy-planetdog-bounce-ball": ["dog bounce ball", "dog rubber ball"],
    "toy-cattyman-spinning-butterfly": ["cat butterfly toy", "electric cat toy"],
    "toy-richell-snuffle-mat": ["dog snuffle mat", "snuffle mat pet"],
    "toy-petio-catnip-fish-pillow": ["catnip fish toy", "cat fish plush"],
    "toy-doggyman-dumbbell-chew": ["dog dumbbell toy", "dog chew dumbbell"],
    "toy-nekoichi-bowl-scratcher": ["cardboard cat scratcher", "cat scratch pad"],
    "toy-koneko-bell-ball-set": ["cat bell ball toy", "kitten toy balls"],
    "toy-petio-laser-chaser": ["cat laser toy", "laser pointer cat"],
    "toy-doggyman-ring-frisbee": ["dog frisbee ring", "dog flying disc"],
    "toy-richell-cardboard-house": ["cat cardboard house", "cat box house"],
    "toy-supercat-catnip-mouse": ["catnip mouse toy", "cat mouse toy"],
    "toy-petio-slider-puzzle": ["dog puzzle toy", "dog treat puzzle"],
    "toy-cattyman-ball-tower": ["cat ball track toy", "cat toy tower"],
    "toy-doggyman-dental-tennis-balls": ["dog tennis ball", "dog ball toy"],
    "toy-nekoichi-feather-spring": ["cat spring toy", "cat feather toy"],
    "toy-richell-sisal-mouse": ["sisal cat toy", "cat mouse sisal"],
    "toy-petio-cooling-chew-bone": ["dog cooling chew", "dog bone chew toy"],
    "toy-cattyman-crinkle-tunnel": ["cat crinkle tunnel", "cat play tunnel"],
    "toy-doggyman-tugofwar-rope-ball": ["dog rope ball", "dog tug toy"],
    "toy-supercat-chirping-bird": ["cat bird toy", "catnip bird toy"],
    "pet-joint-supplement": ["pet vitamins bottle", "dog supplement bottle"],
    "cat-probiotics": ["pet probiotic", "pet supplement jar"],
    "dog-coat-oil": ["dog coat oil", "pet oil bottle"],
    "health-omega3": ["fish oil bottle pet", "omega 3 pet"],
    "health-dental-water": ["pet dental water", "dog dental care"],
    "health-senior-multivitamin": ["senior dog vitamins", "pet multivitamin"],
    "health-urinary-support": ["cat urinary care", "pet health supplement"],
    "health-calming-chews": ["dog calming chews", "pet calming treats"],
    "pet-odor-spray": ["pet odor spray", "pet deodorizer spray"],
    "litter-cleaning-kit": ["litter scoop kit", "cat litter scoop"],
    "pet-shampoo": ["pet shampoo bottle", "dog shampoo"],
    "cleaning-lint-roller": ["lint roller pet hair", "pet hair roller"],
    "cleaning-air-freshener": ["pet air freshener", "room spray bottle"],
    "cleaning-paw-wipes": ["pet wipes", "dog paw wipes"],
    "cleaning-deodorizing-mat": ["litter mat", "cat litter mat"],
    "cleaning-pet-toothbrush-kit": ["dog toothbrush", "pet toothbrush"],
    "deal-food-bundle": ["pet food bags", "dog and cat food"],
    "deal-treats-3pack": ["dog treats packages", "pet snacks pack"],
    "deal-supplement-bogo": ["pet supplement bottles", "dog vitamins"],
    "deal-cleaning-bundle": ["pet cleaning supplies", "pet shampoo spray"],
    "deal-health-trio": ["pet health products", "pet care bottles"],
    "deal-newyear-hamper": ["pet gift basket", "dog gift box"],
    "deal-toy-clearance": ["pile of dog toys", "pet toys assortment"],
    "deal-outdoor-combo": ["dog walking gear", "dog leash harness"],
    "bestseller-dog-giftbox": ["dog treat gift box", "dog biscuits gift"],
    "bestseller-cat-scratcher": ["cat scratcher", "cat scratching board"],
    "bestseller-pet-bed": ["pet bed", "dog bed cushion"],
    "bestseller-cat-tower": ["cat tree tower", "cat condo"],
    "bestseller-dog-harness": ["dog harness", "dog vest harness"],
    "bestseller-litter-box": ["covered litter box", "cat litter box"],
    "bestseller-cat-food": ["premium cat food", "cat food bag"],
    "bestseller-dog-treats": ["dog treats bag", "dog jerky pack"],
    "pet-travel-backpack": ["pet backpack carrier", "cat backpack"],
    "pet-foldable-bottle": ["pet water bottle", "dog travel bottle"],
    "pet-leash-set": ["dog leash set", "dog lead"],
    "outdoor-pet-stroller": ["pet stroller", "dog stroller"],
    "outdoor-collapsible-bowl-set": ["collapsible pet bowl", "travel dog bowl"],
    "outdoor-pet-carrier": ["pet carrier bag", "soft pet carrier"],
    "outdoor-led-collar": ["LED dog collar", "glow dog collar"],
    "outdoor-car-seat-cover": ["dog car seat cover", "pet car seat"],
}


def http_json(url: str) -> dict:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=40) as resp:
        return json.load(resp)


def http_bytes(url: str) -> bytes:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.read()


def product_ids() -> list[str]:
    """Return only hand-authored Product blocks with /products images.

    WT Japan cat/snack records come from src/data and dog records come from the
    authoritative JSON; their stable local image paths are governed separately.
    """
    text = PRODUCTS_TS.read_text(encoding="utf-8")
    pattern = re.compile(
        r'id:\s*"(?P<id>[^"]+)"[\s\S]*?image:\s*"/products/(?P=id)\.webp"',
        re.M,
    )
    return [match.group("id") for match in pattern.finditer(text)]


def score_title(title: str, query: str) -> int:
    title_l = (title or "").lower()
    score = 0
    for token in re.split(r"\s+", query.lower()):
        if len(token) > 2 and token in title_l:
            score += 3
    # Prefer titles that look like product photos, not random scenes.
    for bonus in ("toy", "food", "bag", "bottle", "collar", "leash", "bed", "litter", "shampoo", "treat", "bowl", "carrier", "harness", "scratch"):
        if bonus in title_l:
            score += 1
    for penalty in ("drawing", "illustration", "cartoon", "clipart", "logo", "svg", "map", "portrait of", "selfie"):
        if penalty in title_l:
            score -= 5
    return score


def search_openverse(query: str, used_urls: set[str]) -> list[dict]:
    params = urllib.parse.urlencode(
        {"q": query, "page_size": 20, "license_type": "commercial"}
    )
    url = f"https://api.openverse.org/v1/images/?{params}"
    try:
        data = http_json(url)
    except Exception:
        return []
    out = []
    for item in data.get("results") or []:
        img_url = item.get("url") or ""
        if not img_url or img_url in used_urls:
            continue
        mimeish = (item.get("filetype") or "").lower()
        if mimeish in {"svg", "pdf", "tif", "tiff"}:
            continue
        out.append(
            {
                "url": img_url,
                "title": item.get("title") or "",
                "source": f"Openverse/{item.get('source')}",
                "license": item.get("license"),
                "score": score_title(item.get("title") or "", query),
            }
        )
    out.sort(key=lambda x: x["score"], reverse=True)
    return out


def search_wikimedia(query: str, used_urls: set[str]) -> list[dict]:
    params = urllib.parse.urlencode(
        {
            "action": "query",
            "format": "json",
            "generator": "search",
            "gsrsearch": query,
            "gsrnamespace": "6",
            "gsrlimit": "12",
            "prop": "imageinfo",
            "iiprop": "url|size|mime",
            "iiurlwidth": "1200",
        }
    )
    url = f"https://commons.wikimedia.org/w/api.php?{params}"
    try:
        data = http_json(url)
    except Exception:
        return []
    out = []
    for page in (data.get("query") or {}).get("pages", {}).values():
        info = (page.get("imageinfo") or [{}])[0]
        mime = info.get("mime") or ""
        if not mime.startswith("image/") or mime in {"image/svg+xml", "image/tiff"}:
            continue
        img_url = info.get("thumburl") or info.get("url")
        if not img_url or img_url in used_urls:
            continue
        title = page.get("title") or ""
        out.append(
            {
                "url": img_url,
                "title": title,
                "source": "Wikimedia Commons",
                "license": "wikimedia",
                "score": score_title(title, query),
            }
        )
    out.sort(key=lambda x: x["score"], reverse=True)
    return out


def pick_curated(product_id: str, used_urls: set[str]) -> dict | None:
    # Prefer keyword hits, then any unused curated photo.
    ranked: list[tuple[int, str]] = []
    for keys, base in CURATED_UNSPLASH:
        if base in used_urls:
            continue
        url = f"{base}?w=1000&q=80&auto=format&fit=crop"
        if url in used_urls:
            continue
        hit = sum(1 for k in keys if k in product_id)
        ranked.append((hit, url))
    if not ranked:
        return None
    ranked.sort(key=lambda x: x[0], reverse=True)
    hit, url = ranked[0]
    return {
        "url": url,
        "title": product_id,
        "source": "Unsplash",
        "license": "unsplash",
        "score": 10 + hit if hit else 1,
    }


def to_webp(raw: bytes, dest: Path) -> None:
    img = Image.open(io.BytesIO(raw))
    img = img.convert("RGB")
    # Center-crop to square-ish product card, keep detail.
    w, h = img.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    img = img.crop((left, top, left + side, top + side))
    if side > 1000:
        img = img.resize((1000, 1000), Image.Resampling.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    img.save(dest, "WEBP", quality=85, method=6)


def resolve_candidate(product_id: str, used_urls: set[str]) -> dict:
    if product_id in DIRECT_URLS:
        url, credit = DIRECT_URLS[product_id]
        if url not in used_urls:
            return {
                "url": url,
                "title": credit,
                "source": "Wikimedia Commons",
                "license": "wikimedia",
                "score": 100,
            }

    candidates: list[dict] = []
    for query in QUERIES.get(product_id, [product_id.replace("-", " ")]):
        candidates.extend(search_openverse(query, used_urls))
        time.sleep(0.15)
        candidates.extend(search_wikimedia(query, used_urls))
        time.sleep(0.15)
        if any(c["score"] >= 6 for c in candidates):
            break

    candidates.sort(key=lambda x: x["score"], reverse=True)
    if candidates and candidates[0]["score"] >= 3:
        return candidates[0]

    curated = pick_curated(product_id, used_urls)
    if curated:
        return curated
    if candidates:
        return candidates[0]
    raise RuntimeError(f"No photograph found for {product_id}")


def update_products_ts(ids: list[str]) -> None:
    text = PRODUCTS_TS.read_text(encoding="utf-8")
    # Refresh product image field docs.
    text = re.sub(
        r"/\*\*\n\s*\* Path \(under /public\).*?\*/",
        (
            "/**\n"
            "   * Path (under /public) to a real product photograph for this SKU.\n"
            "   * Files live at `public/products/<productId>.webp` — never use\n"
            "   * AI-generated art, cartoons, or shared category illustrations.\n"
            "   */"
        ),
        text,
        count=1,
        flags=re.S,
    )
    # Replace every image: "/products/....webp" that belongs to a product block
    # by rewriting per-id via a simple pass over id occurrences.
    pattern = re.compile(
        r'(id:\s*"(?P<id>[^"]+)",\s*\n\s*categorySlug:\s*"[^"]+",\s*\n\s*)image:\s*"/products/[^"]+"',
        re.M,
    )

    def repl(match: re.Match[str]) -> str:
        pid = match.group("id")
        return f'{match.group(1)}image: "/products/{pid}.webp"'

    new_text, n = pattern.subn(repl, text)
    if n != len(ids):
        raise RuntimeError(f"Expected to rewrite {len(ids)} image paths, rewrote {n}")
    PRODUCTS_TS.write_text(new_text, encoding="utf-8")


def main() -> None:
    ids = product_ids()
    print(f"Products: {len(ids)}")
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    # Remove previous AI/illustration category artworks.
    for stale in OUT_DIR.glob("*.webp"):
        if stale.stem in {
            "cats",
            "dogs",
            "snacks",
            "toys",
            "health",
            "cleaning",
            "deals",
            "bestsellers",
            "outdoor",
        } or stale.stem in ids:
            # Always refresh per-SKU files in this run.
            if stale.stem in ids or stale.stem in {
                "cats",
                "dogs",
                "snacks",
                "toys",
                "health",
                "cleaning",
                "deals",
                "bestsellers",
                "outdoor",
            }:
                stale.unlink(missing_ok=True)

    used_urls: set[str] = set()
    attribution: dict[str, dict] = {}
    failures: list[str] = []

    for i, pid in enumerate(ids, 1):
        dest = OUT_DIR / f"{pid}.webp"
        print(f"[{i}/{len(ids)}] {pid}")
        try:
            cand = resolve_candidate(pid, used_urls)
            raw = http_bytes(cand["url"])
            # Basic sanity: reject tiny / non-image payloads.
            if len(raw) < 8_000:
                raise RuntimeError(f"image too small ({len(raw)} bytes)")
            to_webp(raw, dest)
            used_urls.add(cand["url"])
            # Also mark unsplash base without query.
            used_urls.add(cand["url"].split("?", 1)[0])
            attribution[pid] = {
                "file": f"/products/{pid}.webp",
                "source_url": cand["url"],
                "source": cand.get("source"),
                "title": cand.get("title"),
                "license": cand.get("license"),
            }
            print(f"  -> {dest.name} via {cand.get('source')} score={cand.get('score')}")
        except Exception as exc:
            failures.append(f"{pid}: {exc}")
            print(f"  !! {exc}")
        time.sleep(0.1)

    if failures:
        # Second pass: fill failures with remaining curated Unsplash only.
        for entry in list(failures):
            pid = entry.split(":", 1)[0]
            curated = pick_curated(pid, used_urls)
            if not curated:
                continue
            try:
                raw = http_bytes(curated["url"])
                to_webp(raw, OUT_DIR / f"{pid}.webp")
                used_urls.add(curated["url"])
                used_urls.add(curated["url"].split("?", 1)[0])
                attribution[pid] = {
                    "file": f"/products/{pid}.webp",
                    "source_url": curated["url"],
                    "source": curated.get("source"),
                    "title": curated.get("title"),
                    "license": curated.get("license"),
                }
                failures.remove(entry)
                print(f"  recovered {pid}")
            except Exception as exc:
                print(f"  recover fail {pid}: {exc}")

    missing = [pid for pid in ids if not (OUT_DIR / f"{pid}.webp").exists()]
    if missing:
        raise SystemExit(f"Missing photos for: {missing}")

    ATTR_PATH.write_text(json.dumps(attribution, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    update_products_ts(ids)
    print(f"Wrote {len(attribution)} photos + updated products.ts")


if __name__ == "__main__":
    main()

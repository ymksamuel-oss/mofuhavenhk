#!/usr/bin/env python3
"""Recover product packshots from Best Partner's official site by exact JAN.

The script never fetches Supabase URLs. It requires an exact JAN match on the
official product page and a product-image URL whose path also contains that JAN.
Run without --apply for a read-only dry run; use --apply to write WebP assets,
update the static catalog, and produce an audit CSV/JSON manifest.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import re
import socket
import sys
import threading
import time
import unicodedata
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from io import BytesIO
from pathlib import Path
from urllib.parse import unquote, urljoin, urlparse

import requests
import urllib3.util.connection
from bs4 import BeautifulSoup
from PIL import Image, ImageOps, UnidentifiedImageError
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# The Sandbox's default resolver may choose an unreachable IPv6 route for this
# host. Force IPv4 so the same official URLs work in both requests and curl -4.
urllib3.util.connection.allowed_gai_family = lambda: socket.AF_INET

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_MISSING = ROOT / "audit/missing-product-images-2026-10-17.csv"
DEFAULT_CATALOG = ROOT / "src/data/catalog-fallback.json"
DEFAULT_OUTPUT = ROOT / "public/images/products"
DEFAULT_REPORT = ROOT / "audit/product-image-recovery-2026-10-17.csv"
DEFAULT_MANIFEST = ROOT / "audit/product-image-recovery-2026-10-17.json"
OFFICIAL_HOSTS = {"best-partner.co.jp", "www.best-partner.co.jp"}
JAN_RE = re.compile(r"(?<!\d)(\d{13})(?!\d)")
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
THREAD_LOCAL = threading.local()
REQUEST_DELAY = 0.2


def session() -> requests.Session:
    current = getattr(THREAD_LOCAL, "session", None)
    if current is not None:
        return current
    retry = Retry(
        total=2,
        connect=2,
        read=2,
        status=2,
        backoff_factor=0.5,
        status_forcelist=(429, 500, 502, 503, 504),
        allowed_methods=frozenset({"GET", "HEAD"}),
        raise_on_status=False,
    )
    adapter = HTTPAdapter(max_retries=retry, pool_connections=4, pool_maxsize=4)
    current = requests.Session()
    current.mount("https://", adapter)
    current.mount("http://", adapter)
    current.headers.update(
        {
            "User-Agent": "Mozilla/5.0 (compatible; MofuHavenHK product-image recovery/1.0)",
            "Accept": "text/html,image/avif,image/webp,image/png,image/jpeg,*/*;q=0.8",
        }
    )
    THREAD_LOCAL.session = current
    return current


def official_url(url: str) -> bool:
    parsed = urlparse(url)
    host = (parsed.hostname or "").lower()
    return parsed.scheme == "https" and host in OFFICIAL_HOSTS


def request_get(url: str, *, referer: str | None = None) -> requests.Response:
    if not official_url(url):
        raise ValueError(f"Refusing non-official URL: {url}")
    time.sleep(REQUEST_DELAY)
    headers = {"Referer": referer} if referer else None
    response = session().get(url, headers=headers, timeout=(12, 35), allow_redirects=True)
    if not official_url(response.url):
        raise ValueError(f"Official request redirected to an unapproved host: {response.url}")
    return response


def normalize_text(value: str) -> str:
    return re.sub(r"\s+", "", unicodedata.normalize("NFKC", value))


def extract_jan(value: str) -> str | None:
    match = JAN_RE.search(value or "")
    return match.group(1) if match else None


def search_product_page(jan: str) -> tuple[str | None, str]:
    search_url = f"https://best-partner.co.jp/?s={jan}"
    response = request_get(search_url)
    if response.status_code != 200:
        return None, f"search_http_{response.status_code}"
    soup = BeautifulSoup(response.content, "html.parser")
    candidates: list[str] = []
    for anchor in soup.find_all("a", href=True):
        url = urljoin(response.url, anchor["href"].strip())
        parsed = urlparse(url)
        if not official_url(url):
            continue
        if re.fullmatch(r"/archives/\d+/?", parsed.path):
            if url not in candidates:
                candidates.append(url)
    if not candidates:
        return None, "no_official_product_page_in_search"

    for page_url in candidates[:8]:
        try:
            page = request_get(page_url, referer=response.url)
        except Exception:
            continue
        if page.status_code != 200:
            continue
        text = normalize_text(BeautifulSoup(page.content, "html.parser").get_text(" ", strip=True))
        if jan in text:
            return page.url, "exact_jan_page_match"
    return None, "search_results_without_exact_jan_page"


def parse_srcset(value: str, base_url: str, jan: str) -> list[tuple[int, str]]:
    parsed: list[tuple[int, str]] = []
    for candidate in value.split(","):
        parts = candidate.strip().split()
        if not parts:
            continue
        url = urljoin(base_url, parts[0])
        width = 0
        if len(parts) > 1:
            match = re.fullmatch(r"(\d+)w", parts[1])
            if match:
                width = int(match.group(1))
        if not width:
            dims = re.search(r"-(\d+)x(\d+)\.(?:jpe?g|png|webp)$", urlparse(url).path, re.I)
            if dims:
                width = int(dims.group(1))
        path = unquote(urlparse(url).path)
        if jan in path and official_url(url) and Path(path).suffix.lower() in IMAGE_EXTENSIONS:
            parsed.append((width, url))
    return parsed


def official_image_candidates(page_url: str, jan: str, html: bytes) -> list[str]:
    soup = BeautifulSoup(html, "html.parser")
    groups: list[list[tuple[int, str]]] = []
    seen_groups: set[tuple[str, ...]] = set()
    for tag in soup.find_all("img"):
        found: list[tuple[int, str]] = []
        for attribute in ("srcset", "data-srcset", "data-lazy-srcset", "data-original-srcset"):
            value = tag.get(attribute)
            if value:
                found.extend(parse_srcset(value, page_url, jan))
        for attribute in ("src", "data-src", "data-lazy-src", "data-original", "data-original-src"):
            value = tag.get(attribute)
            if value and not value.strip().lower().startswith("data:"):
                url = urljoin(page_url, value.strip())
                path = unquote(urlparse(url).path)
                if jan in path and official_url(url) and Path(path).suffix.lower() in IMAGE_EXTENSIONS:
                    found.append((0, url))
        if found:
            ordered = sorted(set(found), key=lambda item: (item[0], item[1]), reverse=True)
            signature = tuple(url for _, url in ordered)
            if signature not in seen_groups:
                seen_groups.add(signature)
                groups.append(ordered)

    # Prefer original uploads over WordPress resized variants. Preserve page order.
    output: list[str] = []
    for group in groups:
        originals = [url for _, url in group if not re.search(r"-\d+x\d+\.(?:jpe?g|png|webp)$", urlparse(url).path, re.I)]
        for url in (originals or [url for _, url in group]):
            if url not in output:
                output.append(url)
    if output:
        return output

    # An OG image is acceptable only when its official URL also names this JAN.
    for tag in soup.find_all("meta"):
        if tag.get("property") in {"og:image", "og:image:secure_url"} or tag.get("name") == "twitter:image":
            value = tag.get("content")
            if value:
                url = urljoin(page_url, value.strip())
                path = unquote(urlparse(url).path)
                if jan in path and official_url(url) and Path(path).suffix.lower() in IMAGE_EXTENSIONS:
                    output.append(url)
    return list(dict.fromkeys(output))


def encode_webp(image: Image.Image) -> tuple[bytes, int, tuple[int, int]]:
    image = ImageOps.exif_transpose(image)
    if image.mode not in ("RGB", "RGBA"):
        image = image.convert("RGBA" if "A" in image.getbands() else "RGB")
    if max(image.size) > 1600:
        scale = 1600 / max(image.size)
        image = image.resize((round(image.width * scale), round(image.height * scale)), Image.Resampling.LANCZOS)

    qualities = (96, 92, 88, 84, 80, 76, 72, 68, 64, 60)
    current = image
    best: tuple[int, int, bytes] | None = None
    for _ in range(5):
        attempts: list[tuple[int, bytes]] = []
        for quality in qualities:
            buffer = BytesIO()
            current.save(buffer, format="WEBP", quality=quality, method=6)
            payload = buffer.getvalue()
            attempts.append((quality, payload))
        in_range = [item for item in attempts if 50 * 1024 <= len(item[1]) <= 150 * 1024]
        if in_range:
            quality, payload = min(in_range, key=lambda item: (abs(len(item[1]) - 100 * 1024), -item[0]))
            return payload, quality, current.size
        smallest = min(attempts, key=lambda item: len(item[1]))
        largest = max(attempts, key=lambda item: len(item[1]))
        if best is None or abs(len(largest[1]) - 100 * 1024) < abs(best[0] - 100 * 1024):
            best = (len(largest[1]), largest[0], largest[1])
        if len(smallest[1]) < 50 * 1024:
            # Do not enlarge or pad simple photos merely to meet a nominal floor.
            quality, payload = largest
            return payload, quality, current.size
        if len(smallest[1]) > 150 * 1024:
            new_size = (round(current.width * 0.88), round(current.height * 0.88))
            if min(new_size) < 240:
                break
            current = current.resize(new_size, Image.Resampling.LANCZOS)
            continue
        break
    if best is None:
        raise ValueError("Unable to encode WebP")
    return best[2], best[1], current.size


def recover_one(jan: str) -> dict:
    result = {"jan": jan, "status": "unresolved", "detail": "", "product_page_url": "", "source_image_urls": [], "source_images": [], "webp_paths": [], "payloads": []}
    try:
        page_url, detail = search_product_page(jan); result["detail"] = detail
        if not page_url: return result
        result["product_page_url"] = page_url; page = request_get(page_url)
        if page.status_code != 200: result["detail"] = f"product_page_http_{page.status_code}"; return result
        if jan not in normalize_text(BeautifulSoup(page.content, "html.parser").get_text(" ", strip=True)):
            result["detail"] = "exact_jan_missing_after_fetch"; return result
        candidates = official_image_candidates(page.url, jan, page.content)
        if not candidates: result["detail"] = "no_official_image_url_named_with_jan"; return result
        payloads=[]; urls=[]; metas=[]
        for image_url in candidates:
            try:
                response=request_get(image_url, referer=page.url)
                if response.status_code != 200 or len(response.content)>15*1024*1024 or not response.headers.get("Content-Type", "").lower().startswith("image/"): continue
                with Image.open(BytesIO(response.content)) as source: source.verify()
                with Image.open(BytesIO(response.content)) as source:
                    dimensions=source.size
                    if min(dimensions)<250: continue
                    webp,quality,out_dimensions=encode_webp(source)
                payloads.append(webp); urls.append(response.url); metas.append({"source_dimensions":f"{dimensions[0]}x{dimensions[1]}","source_bytes":len(response.content),"webp_dimensions":f"{out_dimensions[0]}x{out_dimensions[1]}","webp_bytes":len(webp),"webp_quality":quality,"sha256":hashlib.sha256(webp).hexdigest()})
            except (requests.RequestException, UnidentifiedImageError, OSError, ValueError): continue
        if not payloads: result["detail"]="no_valid_image_candidates"; return result
        result.update({"status":"recovered","detail":"official_product_page_exact_jan_and_jan_named_images" + ("_only_one_official_image" if len(payloads)<2 else ""),"source_image_urls":urls,"source_images":metas,"webp_paths":[f"/images/products/{jan}-{i}.webp" for i in range(1,len(payloads)+1)],"payloads":payloads})
        return result
    except requests.RequestException as exc: result["detail"]=f"request_error:{type(exc).__name__}"; return result
    except Exception as exc: result["detail"]=f"processing_error:{type(exc).__name__}:{exc}"; return result

def read_inputs(missing_csv: Path, catalog_path: Path) -> tuple[list[dict], dict, dict[str, list[dict]]]:
    with missing_csv.open(encoding="utf-8-sig", newline="") as file:
        missing_rows = list(csv.DictReader(file))
    catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    products = catalog.get("products") if isinstance(catalog, dict) else None
    if not isinstance(products, list):
        raise ValueError("Catalog JSON must contain a products array")
    sku_lookup = {str(product.get("mofu_sku") or product.get("sku") or ""): product for product in products}
    grouped: dict[str, list[dict]] = {}
    for row in missing_rows:
        jan = extract_jan(row.get("mofu_sku", "")) or extract_jan(row.get("original_image_url", ""))
        if not jan:
            row["_jan"] = ""
            continue
        row["_jan"] = jan
        grouped.setdefault(jan, []).append(row)
    return missing_rows, catalog, grouped


def write_results(args: argparse.Namespace, missing_rows: list[dict], catalog: dict, results: list[dict]) -> tuple[int, int]:
    by_jan={r["jan"]:r for r in results}; recovered={j:r for j,r in by_jan.items() if r["status"]=="recovered"}; written=0
    for jan,r in recovered.items():
        for i,payload in enumerate(r.pop("payloads"),1):
            dest=args.output_dir/f"{jan}-{i}.webp"; tmp=dest.with_suffix(dest.suffix+".tmp"); tmp.write_bytes(payload); tmp.replace(dest); written+=1
    updated=0
    for product in catalog["products"]:
        jan=extract_jan(str(product.get("mofu_sku") or product.get("sku") or ""))
        if jan in recovered:
            paths=recovered[jan]["webp_paths"]; product["image_url"]=paths[0]; product["images"]=paths; updated+=1
    tmp=args.catalog.with_suffix(args.catalog.suffix+".tmp"); tmp.write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+"\n",encoding="utf-8"); tmp.replace(args.catalog)
    args.report.parent.mkdir(parents=True,exist_ok=True); fields=["product_id","mofu_sku","name_zh","name_en","pet_species","jan","status","detail","product_page_url","source_image_urls","webp_paths","source_images"]
    with args.report.open("w",encoding="utf-8-sig",newline="") as f:
        w=csv.DictWriter(f,fieldnames=fields,extrasaction="ignore"); w.writeheader()
        for row in missing_rows:
            r=by_jan.get(row.get("_jan",""),{}); w.writerow({**row,**r,"jan":row.get("_jan",""),"source_image_urls":json.dumps(r.get("source_image_urls",[]),ensure_ascii=False),"webp_paths":json.dumps(r.get("webp_paths",[]),ensure_ascii=False),"source_images":json.dumps(r.get("source_images",[]),ensure_ascii=False)})
    manifest={"generated_at":datetime.now(timezone.utc).isoformat(),"source":"https://best-partner.co.jp/","summary":{"unique_jans_processed":len(results),"unique_jans_recovered":len(recovered),"unique_jans_with_two_images":sum(len(r.get("source_image_urls",[]))>=2 for r in recovered.values()),"product_rows_updated":updated,"images_written":written},"results":[{k:v for k,v in r.items() if k!="payloads"} for r in results]}
    args.manifest.parent.mkdir(parents=True,exist_ok=True); args.manifest.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n",encoding="utf-8"); return updated,written
def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--missing-csv", type=Path, default=DEFAULT_MISSING)
    parser.add_argument("--catalog", type=Path, default=DEFAULT_CATALOG)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--report", type=Path, default=DEFAULT_REPORT)
    parser.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST)
    parser.add_argument("--workers", type=int, default=3)
    parser.add_argument("--delay", type=float, default=0.2, help="Delay between requests per worker")
    parser.add_argument("--limit", type=int, default=0, help="Process only the first N sorted JANs")
    parser.add_argument("--jan", help="Process one exact 13-digit JAN only")
    parser.add_argument("--apply", action="store_true", help="Write WebP assets, reports, and snapshot changes")
    args = parser.parse_args()
    global REQUEST_DELAY
    REQUEST_DELAY = max(0.0, args.delay)

    missing_rows, catalog, grouped = read_inputs(args.missing_csv, args.catalog)
    jans = sorted(grouped)
    if args.jan:
        if not re.fullmatch(r"\d{13}", args.jan):
            parser.error("--jan must be exactly 13 digits")
        jans = [jan for jan in jans if jan == args.jan]
        if not jans:
            parser.error("--jan was not present in the missing-image CSV")
    if args.limit:
        jans = jans[: args.limit]
    if not jans:
        parser.error("No JANs selected")

    print(f"products={len(catalog['products'])} missing_rows={len(missing_rows)} unique_jans_selected={len(jans)} apply={args.apply}")
    results_by_jan: dict[str, dict] = {}
    with ThreadPoolExecutor(max_workers=max(1, min(args.workers, 8))) as pool:
        futures = {pool.submit(recover_one, jan): jan for jan in jans}
        for done_count, future in enumerate(as_completed(futures), start=1):
            jan = futures[future]
            result = future.result()
            results_by_jan[jan] = result
            print(f"[{done_count}/{len(jans)}] {jan} {result['status']} {result['detail']}", flush=True)
    results = [results_by_jan[jan] for jan in jans]
    successes = sum(result["status"] == "recovered" for result in results)
    print(f"summary: recovered={successes}/{len(results)}")

    if args.apply:
        args.output_dir.mkdir(parents=True, exist_ok=True)
        updated, written = write_results(args, missing_rows, catalog, results)
        print(f"applied: images_written={written} product_rows_updated={updated}")
    else:
        for result in results:
            result.pop("payloads", None)
            print(json.dumps(result, ensure_ascii=False))
        print("dry run: no project files changed")
    return 0


if __name__ == "__main__":
    sys.exit(main())

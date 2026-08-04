#!/usr/bin/env python3
"""Download WT Japan 冷凍脫水系列 products + images via Shopify products.json."""

import json
import os
import urllib.parse
import urllib.request

# WT Japan Shopify API endpoint for collection products
collection = urllib.parse.quote("冷凍脫水系列")
api_url = f"https://www.wt-japan.com/collections/{collection}/products.json?limit=250"
req = urllib.request.Request(api_url, headers={"User-Agent": "Mozilla/5.0"})

try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode("utf-8"))
        products = data.get("products", [])
        print(f"Total products found: {len(products)}")

        os.makedirs("downloaded_products", exist_ok=True)
        all_summary = []

        for p in products:
            title = p.get("title")
            handle = p.get("handle")
            variants = p.get("variants", [])
            price = variants[0].get("price") if variants else "N/A"
            images = p.get("images", [])
            body_html = p.get("body_html", "")

            prod_dir = os.path.join("downloaded_products", handle)
            os.makedirs(prod_dir, exist_ok=True)

            img_urls = []
            for idx, img in enumerate(images):
                src = img.get("src")
                if src:
                    img_urls.append(src)
                    img_path = os.path.join(prod_dir, f"image_{idx + 1}.jpg")
                    try:
                        urllib.request.urlretrieve(src, img_path)
                    except Exception as e:
                        print(f"Error downloading {src}: {e}")

            product_info = {
                "title": title,
                "handle": handle,
                "price": price,
                "images": img_urls,
                "body_html": body_html,
            }
            all_summary.append(product_info)

            with open(
                os.path.join(prod_dir, "details.json"), "w", encoding="utf-8"
            ) as f:
                json.dump(product_info, f, ensure_ascii=False, indent=4)

        with open("all_products_summary.json", "w", encoding="utf-8") as f:
            json.dump(all_summary, f, ensure_ascii=False, indent=4)

        print(
            "Done! All products and images downloaded into "
            "'downloaded_products' folder."
        )
except Exception as e:
    print(f"Error: {e}")

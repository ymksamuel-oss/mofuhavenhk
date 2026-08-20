import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const commonsApi = "https://commons.wikimedia.org/w/api.php";
const outputDir = "/home/ubuntu/webdev-static-assets/mofu-haven-pet-world-20260820";
const manifestPath = "/home/ubuntu/mofu-haven-website/docs/pet-world-three-breed-photo-import-manifest.json";

const photos = [
  ["british", "british-01.jpg", "A British Shorthair cat.jpg"],
  ["british", "british-02.jpg", "A two years old British Shorthair cat.jpg"],
  ["british", "british-03.jpg", "BRI Hoshi Black Diamond (5648566590).jpg"],
  ["british", "british-04.jpg", "BRI kittens (5648020191).jpg"],
  ["british", "british-05.jpg", "BRI kittens (5648023711).jpg"],
  ["british", "british-06.jpg", "Mediterranean Winner Show 2016 63.JPG"],
  ["american", "american-01.jpg", "American Shorthair.jpg"],
  ["american", "american-02.jpg", "American shorthair housecat.jpg"],
  ["american", "american-03.jpg", "In Awe (8305613603).jpg"],
  ["american", "american-04.jpg", "美國短毛貓.jpeg"],
  ["american", "american-05.jpg", "Baby American shorthair in loaf pose.jpg"],
  ["american", "american-06.jpg", "ASH Russeller’s Cleopatra of Solid Fold (4496229769).jpg"],
  ["ragdoll", "ragdoll-01.jpg", "Ragdoll from Gatil Ragbelas.jpg"],
  ["ragdoll", "ragdoll-02.jpg", "Flame point Ragdoll.jpg"],
  ["ragdoll", "ragdoll-03.jpg", "Ragdoll Cat 2023.jpg"],
  ["ragdoll", "ragdoll-04.jpg", "Ragdoll bicolor blue gatil mozziland portugal.jpg"],
  ["ragdoll", "ragdoll-05.jpg", "Kocour Ragdoll ležící na posteli.jpg"],
  ["ragdoll", "ragdoll-06.jpg", "Cat brotherhood.jpg"],
].map(([breed, assetName, title]) => ({ breed, assetName, title }));

const titles = photos.map((photo) => `File:${photo.title}`).join("|");
const apiUrl = new URL(commonsApi);
apiUrl.searchParams.set("action", "query");
apiUrl.searchParams.set("prop", "imageinfo");
apiUrl.searchParams.set("iiprop", "url|extmetadata|size");
apiUrl.searchParams.set("iiurlwidth", "1920");
apiUrl.searchParams.set("titles", titles);
apiUrl.searchParams.set("format", "json");
apiUrl.searchParams.set("origin", "*");

async function fetchWithRetry(url, label) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const response = await fetch(url, { headers: { "user-agent": "MofuHavenPetWorldAssetImport/1.0" } });
    if (response.ok) return response;
    if (response.status !== 429 || attempt === 4) {
      throw new Error(`${label} failed: HTTP ${response.status}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 1200 * (attempt + 1)));
  }
  throw new Error(`${label} failed after retries`);
}

const response = await fetch(apiUrl, { headers: { "user-agent": "MofuHavenPetWorldAssetImport/1.0" } });
if (!response.ok) throw new Error(`Wikimedia metadata request failed: HTTP ${response.status}`);
const payload = await response.json();
const metadataByTitle = new Map(
  Object.values(payload.query?.pages ?? {}).map((page) => [page.title?.replace(/^File:/, ""), page.imageinfo?.[0]]),
);

await mkdir(outputDir, { recursive: true });
const imported = [];
for (const photo of photos) {
  const imageInfo = metadataByTitle.get(photo.title);
  if (!imageInfo?.url) throw new Error(`Missing Commons image metadata for ${photo.title}`);

  const imageResponse = await fetchWithRetry(imageInfo.thumburl ?? imageInfo.url, `Image download for ${photo.title}`);
  const bytes = new Uint8Array(await imageResponse.arrayBuffer());
  await writeFile(join(outputDir, photo.assetName), bytes);

  imported.push({
    breed: photo.breed,
    assetName: photo.assetName,
    filePage: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(photo.title).replace(/%20/g, "_")}`,
    width: imageInfo.width,
    height: imageInfo.height,
    artist: String(imageInfo.extmetadata?.Artist?.value ?? "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim(),
    license: String(imageInfo.extmetadata?.LicenseShortName?.value ?? "").replace(/<[^>]+>/g, "").trim(),
    byteLength: bytes.byteLength,
  });
  await new Promise((resolve) => setTimeout(resolve, 350));
}

await writeFile(manifestPath, `${JSON.stringify({ importedAt: new Date().toISOString(), photos: imported }, null, 2)}\n`);
console.log(JSON.stringify({ outputDir, importedCount: imported.length, manifestPath }, null, 2));

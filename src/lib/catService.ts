/**
 * The Cat API client helpers.
 * Optional free API key: set NEXT_PUBLIC_CAT_API_KEY (basic rate limit works without it).
 */
const CAT_API_KEY = process.env.NEXT_PUBLIC_CAT_API_KEY || "";

/** Breed payload shape returned by api.thecatapi.com/v1/breeds */
export interface CatApiBreed {
  id: string; // e.g. 'ragd' (Ragdoll), 'rblu' (Russian Blue)
  name: string;
  description: string;
  temperament: string;
  origin: string;
  image?: {
    id: string;
    url: string;
  };
}

/**
 * Fetch all cat breeds with their default official images.
 */
export async function getAllCatBreeds(): Promise<CatApiBreed[]> {
  try {
    const res = await fetch("https://api.thecatapi.com/v1/breeds", {
      headers: {
        "x-api-key": CAT_API_KEY,
      },
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data: CatApiBreed[] = await res.json();
    return data;
  } catch (error) {
    console.error("Fetch cat breeds failed:", error);
    return [];
  }
}

/**
 * Fetch high-quality images for a specific breed id.
 * @param breedId Breed code (e.g. Ragdoll: 'ragd', Russian Blue: 'rblu')
 * @param limit Number of images to request
 */
export async function getImagesByBreed(
  breedId: string,
  limit = 5,
): Promise<string[]> {
  try {
    const res = await fetch(
      `https://api.thecatapi.com/v1/images/search?breed_ids=${breedId}&limit=${limit}`,
      {
        headers: {
          "x-api-key": CAT_API_KEY,
        },
      },
    );

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data.map((item: { url: string }) => item.url);
  } catch (error) {
    console.error(`Fetch images for breed ${breedId} failed:`, error);
    return [];
  }
}

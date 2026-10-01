import { permanentRedirect } from "next/navigation";

/**
 * The former cat fresh-food guide duplicated the canonical cat collection.
 * Keep this URL as a permanent compatibility redirect for bookmarks and SEO.
 */
export default function CatGuideRedirect() {
  permanentRedirect("/collections/cats");
}

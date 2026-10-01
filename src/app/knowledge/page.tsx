import { permanentRedirect } from "next/navigation";

/** Keep the former URL working for bookmarks and search engines. */
export default function KnowledgeRedirect() {
  permanentRedirect("/explore-pets");
}

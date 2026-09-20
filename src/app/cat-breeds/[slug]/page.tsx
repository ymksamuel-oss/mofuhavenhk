import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatBreedDetail } from "@/components/about/CatBreedDetail";
import {
  CAT_BREEDS,
  getCatBreedBySlug,
  isCatBreedSlug,
} from "@/lib/catBreeds";

type CatBreedDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return CAT_BREEDS.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: CatBreedDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const breed = getCatBreedBySlug(slug);
  if (!breed) {
    return { title: "\u8c93\u54aa\u54c1\u7a2e\u5716\u9451｜Mofu Haven HK" };
  }

  return {
    title: `${breed.name}｜\u8c93\u54aa\u54c1\u7a2e\u5716\u9451｜Mofu Haven HK`,
    description: breed.shortDescription,
  };
}

export default async function CatBreedDetailPage({
  params,
}: CatBreedDetailPageProps) {
  const { slug } = await params;
  if (!isCatBreedSlug(slug)) {
    notFound();
  }

  const breed = getCatBreedBySlug(slug);
  if (!breed) {
    notFound();
  }

  return (
    <div className="min-h-full w-full bg-[#FBF9F6]">
      <CatBreedDetail breed={breed} />
    </div>
  );
}

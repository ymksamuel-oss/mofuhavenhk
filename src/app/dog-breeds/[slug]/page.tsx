import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DogBreedDetail } from "@/components/about/DogBreedDetail";
import { DOG_BREEDS, getDogBreedBySlug, isDogBreedSlug } from "@/lib/dogBreeds";

type DogBreedDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return DOG_BREEDS.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: DogBreedDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const breed = getDogBreedBySlug(slug);
  if (!breed) return { title: "\u72d7\u72d7\u54c1\u7a2e\u5716\u9451｜\u6bdb\u6bdb\u6e2f Mofu Haven HK" };
  return {
    title: `${breed.name}｜\u72d7\u72d7\u54c1\u7a2e\u5716\u9451｜\u6bdb\u6bdb\u6e2f Mofu Haven HK`,
    description: breed.shortDescription,
  };
}

export default async function DogBreedDetailPage({ params }: DogBreedDetailPageProps) {
  const { slug } = await params;
  if (!isDogBreedSlug(slug)) notFound();
  const breed = getDogBreedBySlug(slug);
  if (!breed) notFound();
  return <DogBreedDetail breed={breed} />;
}

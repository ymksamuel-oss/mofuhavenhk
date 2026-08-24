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
  if (!breed) return { title: "狗狗品種圖鑑｜Mofu Haven HK" };
  return {
    title: `${breed.name}｜狗狗品種圖鑑｜Mofu Haven HK`,
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

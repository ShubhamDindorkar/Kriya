import { SearchPageClient } from "@/components/research/SearchPageClient";

interface SearchPageProps {
  params: Promise<{ id: string }>;
}

export default async function SearchPage({ params }: SearchPageProps) {
  const { id } = await params;
  return <SearchPageClient id={id} />;
}

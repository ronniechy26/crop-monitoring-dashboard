import type { CropDefinition } from "@/types/crop";

export const CROPS: readonly CropDefinition[] = [
  { id: 1, slug: "corn", label: "Maize" },
  { id: 2, slug: "onion", label: "Onion" },
  { id: 3, slug: "rice", label: "Rice" },
] as const;

export function getCropDefinitionById(id: number): CropDefinition | undefined {
  return CROPS.find((crop) => crop.id === id);
}

export function getCropDefinitionBySlug(slug: string): CropDefinition | undefined {
  return CROPS.find((crop) => crop.slug === slug);
}

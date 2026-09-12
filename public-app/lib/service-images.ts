// Placeholder Unsplash images by service category — swap these for real
// DMN Solutions project/site photography when available.
export const CATEGORY_IMAGES: Record<string, string> = {
  digital_technology: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
  electrical: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80",
  computer_training: "https://images.unsplash.com/photo-1719159381981-1327b22aff9b?auto=format&fit=crop&w=1200&q=80",
  isp: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
};

export function getServiceImage(category: string) {
  return CATEGORY_IMAGES[category] ?? CATEGORY_IMAGES.digital_technology;
}

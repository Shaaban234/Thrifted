import type { ItemCondition } from "./types";

export const CATEGORIES: { key: string; label: string; icon: string; subcategories: string[] }[] = [
  { key: "women", label: "Women", icon: "👗", subcategories: ["Dresses", "Tops", "Jeans", "Skirts", "Coats & jackets", "Shoes", "Bags", "Accessories"] },
  { key: "men", label: "Men", icon: "👔", subcategories: ["T-shirts", "Shirts", "Jeans", "Jumpers", "Coats & jackets", "Shoes", "Accessories"] },
  { key: "designer", label: "Designer", icon: "✨", subcategories: ["Bags", "Shoes", "Clothing", "Accessories"] },
  { key: "kids", label: "Kids", icon: "🧸", subcategories: ["Girls", "Boys", "Baby", "Shoes", "Toys"] },
  { key: "home", label: "Home", icon: "🏠", subcategories: ["Decor", "Textiles", "Kitchen", "Storage"] },
  { key: "electronics", label: "Electronics", icon: "📱", subcategories: ["Phones", "Audio", "Gaming", "Accessories"] },
  { key: "beauty", label: "Beauty", icon: "💄", subcategories: ["Makeup", "Skincare", "Fragrance"] },
];

// "Designer" is a cross-cutting filter: items from these premium brands surface
// under the Designer pill regardless of their women/men category.
export const DESIGNER_BRANDS = [
  "Ralph Lauren", "The North Face", "Patagonia", "Stüssy", "Carhartt", "Dr. Martens",
];

export const BRANDS = [
  "Zara", "H&M", "Nike", "Adidas", "Levi's", "Mango", "Uniqlo", "COS",
  "The North Face", "Ralph Lauren", "Carhartt", "Stüssy", "Patagonia",
  "Vans", "Converse", "New Balance", "Dr. Martens", "Other",
];

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "34", "36", "38", "40", "42", "One size"];

export const CONDITIONS: ItemCondition[] = [
  "New with tags",
  "New without tags",
  "Very good",
  "Good",
  "Satisfactory",
];

export const COLORS = [
  "Black", "White", "Grey", "Beige", "Brown", "Blue", "Navy",
  "Green", "Red", "Pink", "Purple", "Yellow", "Orange", "Multi",
];

export const PRICE_RANGES: { label: string; min: number; max: number }[] = [
  { label: "Under Rs 3,000", min: 0, max: 3000 },
  { label: "Rs 3,000 – 7,500", min: 3000, max: 7500 },
  { label: "Rs 7,500 – 15,000", min: 7500, max: 15000 },
  { label: "Rs 15,000 – 30,000", min: 15000, max: 30000 },
  { label: "Rs 30,000+", min: 30000, max: Infinity },
];

export const SORT_OPTIONS: { key: string; label: string }[] = [
  { key: "relevance", label: "Relevance" },
  { key: "newest", label: "Newest first" },
  { key: "price_asc", label: "Price: low to high" },
  { key: "price_desc", label: "Price: high to low" },
];

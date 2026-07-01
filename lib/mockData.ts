import type { Item, User, Conversation, Message, Review, AppNotification } from "./types";

// Stable, topical demo images. pravatar = real avatar faces, loremflickr = tagged
// clothing photos. Both load reliably without an API key.
const avatar = (n: number) => `https://i.pravatar.cc/200?img=${n}`;
const photo = (tags: string, lock: number) =>
  `https://loremflickr.com/600/800/${tags}?lock=${lock}`;

export const CURRENT_USER_ID = "u1";

export const USERS: User[] = [
  { id: "u1", username: "you", avatarUrl: avatar(12), bio: "Selling my pre-loved wardrobe ✨", location: "Berlin, DE", ratingAvg: 4.9, reviewCount: 23, followers: 41, following: 38, joinedAt: "2024-03-10" },
  { id: "u2", username: "lena_thrifts", avatarUrl: avatar(5), bio: "Vintage & designer finds. Fast shipping 📦", location: "Munich, DE", ratingAvg: 4.8, reviewCount: 156, followers: 980, following: 120, joinedAt: "2022-06-01" },
  { id: "u3", username: "max.closet", avatarUrl: avatar(13), bio: "Menswear, streetwear, sneakers", location: "Hamburg, DE", ratingAvg: 4.7, reviewCount: 89, followers: 410, following: 200, joinedAt: "2023-01-15" },
  { id: "u4", username: "sophie_style", avatarUrl: avatar(9), bio: "Minimal & sustainable 🌿", location: "Cologne, DE", ratingAvg: 5.0, reviewCount: 67, followers: 620, following: 88, joinedAt: "2023-08-22" },
  { id: "u5", username: "vintage_vault", avatarUrl: avatar(33), bio: "Curated vintage since 2021", location: "Leipzig, DE", ratingAvg: 4.6, reviewCount: 240, followers: 1500, following: 60, joinedAt: "2021-11-05" },
  { id: "u6", username: "emma_wardrobe", avatarUrl: avatar(20), bio: "Clearing out my closet!", location: "Frankfurt, DE", ratingAvg: 4.9, reviewCount: 34, followers: 150, following: 175, joinedAt: "2024-01-30" },
];

type Seed = Omit<Item, "id" | "createdAt" | "status" | "views" | "likes" | "featured"> & {
  daysAgo: number;
  status?: Item["status"];
  featured?: boolean;
};

const seeds: Seed[] = [
  { sellerId: "u2", title: "Vintage Levi's 501 jeans", description: "Classic straight-leg 501s in a lovely mid-wash. Timeless. Slight fading at the knees adds character. Waist 30, length 32.", brand: "Levi's", category: "women", subcategory: "Jeans", size: "M", condition: "Very good", color: "Blue", price: 32, photos: [photo("jeans,denim", 11), photo("denim", 21)], daysAgo: 1 },
  { sellerId: "u4", title: "Oversized beige wool coat", description: "Gorgeous oversized wool-blend coat. Warm and so easy to style. Worn a handful of times.", brand: "COS", category: "women", subcategory: "Coats & jackets", size: "S", condition: "Very good", color: "Beige", price: 65, photos: [photo("coat,wool", 12), photo("coat,fashion", 22)], daysAgo: 2 },
  { sellerId: "u3", title: "Nike Air Force 1 '07", description: "White AF1s, cleaned and ready to go. Some creasing on the toe box. Size EU 42.", brand: "Nike", category: "men", subcategory: "Shoes", size: "42", condition: "Good", color: "White", price: 48, photos: [photo("sneakers,nike", 13), photo("sneakers,white", 23)], daysAgo: 1 },
  { sellerId: "u5", title: "90s Carhartt work jacket", description: "Authentic vintage Carhartt detroit jacket. Broken-in perfectly. Unisex fit.", brand: "Carhartt", category: "men", subcategory: "Coats & jackets", size: "L", condition: "Good", color: "Brown", price: 89, photos: [photo("jacket,workwear", 14), photo("jacket,vintage", 24)], daysAgo: 3 },
  { sellerId: "u2", title: "Floral midi summer dress", description: "Light and breezy floral midi dress. Perfect for summer. Never worn, tags still on.", brand: "Mango", category: "women", subcategory: "Dresses", size: "S", condition: "New with tags", color: "Multi", price: 28, photos: [photo("dress,floral", 15), photo("dress,summer", 25)], daysAgo: 4 },
  { sellerId: "u6", title: "Zara ribbed knit jumper", description: "Soft ribbed jumper in cream. Cosy and versatile. Excellent condition.", brand: "Zara", category: "women", subcategory: "Tops", size: "M", condition: "Very good", color: "Beige", price: 18, photos: [photo("sweater,knit", 16), photo("jumper", 26)], daysAgo: 2 },
  { sellerId: "u3", title: "The North Face puffer jacket", description: "Black Nuptse-style puffer. Super warm. Minor mark on sleeve (pictured).", brand: "The North Face", category: "men", subcategory: "Coats & jackets", size: "M", condition: "Good", color: "Black", price: 75, photos: [photo("puffer,jacket", 17), photo("jacket,black", 27)], daysAgo: 5 },
  { sellerId: "u4", title: "Dr. Martens 1460 boots", description: "Iconic 8-eye boots in black. Broken in and comfy. Size 38.", brand: "Dr. Martens", category: "women", subcategory: "Shoes", size: "38", condition: "Very good", color: "Black", price: 70, photos: [photo("boots,leather", 18), photo("boots,docmartens", 28)], daysAgo: 6 },
  { sellerId: "u5", title: "Vintage band tee", description: "Faded vintage graphic tee. Single stitch. Great worn-in feel. Unisex L.", brand: "Other", category: "men", subcategory: "T-shirts", size: "L", condition: "Satisfactory", color: "Black", price: 22, photos: [photo("tshirt,vintage", 19), photo("tshirt,band", 29)], daysAgo: 2 },
  { sellerId: "u2", title: "Adidas Sambas OG", description: "Classic Sambas in black/white. Lightly worn. Size 39.", brand: "Adidas", category: "women", subcategory: "Shoes", size: "39", condition: "Very good", color: "Black", price: 55, photos: [photo("sneakers,adidas", 30), photo("sneakers,samba", 31)], daysAgo: 1 },
  { sellerId: "u6", title: "H&M pleated mini skirt", description: "Cute pleated mini in navy. Worn twice. Size S.", brand: "H&M", category: "women", subcategory: "Skirts", size: "S", condition: "Very good", color: "Navy", price: 12, photos: [photo("skirt,pleated", 32), photo("skirt", 34)], daysAgo: 3 },
  { sellerId: "u3", title: "Ralph Lauren oxford shirt", description: "Classic blue oxford button-down with pony logo. Size M. Great condition.", brand: "Ralph Lauren", category: "men", subcategory: "Shirts", size: "M", condition: "Very good", color: "Blue", price: 30, photos: [photo("shirt,oxford", 35), photo("shirt,blue", 36)], daysAgo: 4 },
  { sellerId: "u4", title: "Uniqlo down vest", description: "Lightweight packable down vest in olive. Perfect layering piece.", brand: "Uniqlo", category: "women", subcategory: "Coats & jackets", size: "M", condition: "Very good", color: "Green", price: 24, photos: [photo("vest,down", 37), photo("gilet", 38)], daysAgo: 7 },
  { sellerId: "u5", title: "Patagonia fleece pullover", description: "Retro-X style fleece. Super cosy. Some pilling but loads of life left.", brand: "Patagonia", category: "men", subcategory: "Jumpers", size: "L", condition: "Good", color: "Beige", price: 58, photos: [photo("fleece,patagonia", 39), photo("fleece", 40)], daysAgo: 5 },
  { sellerId: "u2", title: "Leather shoulder bag", description: "Genuine leather shoulder bag in tan. Beautiful patina. Lots of storage.", brand: "Other", category: "women", subcategory: "Bags", size: "One size", condition: "Good", color: "Brown", price: 40, photos: [photo("bag,leather", 41), photo("handbag", 42)], daysAgo: 2 },
  { sellerId: "u6", title: "Vans Old Skool", description: "Black/white Old Skools. Worn but plenty of wear left. Size 40.", brand: "Vans", category: "men", subcategory: "Shoes", size: "40", condition: "Good", color: "Black", price: 26, photos: [photo("vans,sneakers", 43), photo("skate,shoes", 44)], daysAgo: 1, status: "reserved" },
  { sellerId: "u4", title: "Stüssy graphic hoodie", description: "Heavyweight Stüssy hoodie with back print. Streetwear staple. Size M.", brand: "Stüssy", category: "men", subcategory: "Jumpers", size: "M", condition: "Very good", color: "Grey", price: 52, photos: [photo("hoodie,streetwear", 45), photo("hoodie", 46)], daysAgo: 3 },
  { sellerId: "u5", title: "Converse Chuck 70 high", description: "Off-white Chuck 70s, high top. Premium canvas. Size 41.", brand: "Converse", category: "women", subcategory: "Shoes", size: "41", condition: "Very good", color: "White", price: 44, photos: [photo("converse,sneakers", 47), photo("chucks", 48)], daysAgo: 6 },
];

const FILL_TAGS = ["clothing,detail", "fashion,closeup", "wardrobe", "outfit,flatlay"];

// Seed prices were authored in euros; convert to PKR (~300/€) rounded to a tidy value.
const toPkr = (eur: number) => Math.round((eur * 300) / 50) * 50;

export const ITEMS: Item[] = seeds.map((s, i) => {
  const created = new Date();
  created.setDate(created.getDate() - s.daysAgo);
  const { daysAgo, status, ...rest } = s;
  // Pad each listing to 4 photos so the detail-page collage looks full.
  const photos = [...rest.photos];
  for (let k = photos.length; k < 4; k++) {
    photos.push(photo(FILL_TAGS[k % FILL_TAGS.length], 200 + i * 4 + k));
  }
  return {
    ...rest,
    photos,
    price: toPkr(rest.price),
    id: `i${i + 1}`,
    status: status ?? "active",
    featured: rest.featured ?? false,
    views: 20 + ((i * 37) % 480),
    likes: 1 + ((i * 13) % 60),
    createdAt: created.toISOString(),
  };
});

// A couple of seeded conversations for the Inbox.
export const CONVERSATIONS: Conversation[] = [
  { id: "c1", itemId: "i1", buyerId: "u1", sellerId: "u2", lastMessage: "Sure, I can do Rs 8,500 :)", lastMessageAt: new Date(Date.now() - 3600_000).toISOString(), unread: 1 },
  { id: "c2", itemId: "i7", buyerId: "u1", sellerId: "u3", lastMessage: "Is this still available?", lastMessageAt: new Date(Date.now() - 7200_000).toISOString(), unread: 0 },
];

export const MESSAGES: Message[] = [
  { id: "m1", conversationId: "c1", senderId: "u1", body: "Hi! Would you take Rs 8,500 for the jeans?", type: "text", createdAt: new Date(Date.now() - 5400_000).toISOString() },
  { id: "m2", conversationId: "c1", senderId: "u1", body: "Offered Rs 8,500", type: "offer", offerAmount: 8500, offerStatus: "pending", createdAt: new Date(Date.now() - 5400_000).toISOString() },
  { id: "m3", conversationId: "c1", senderId: "u2", body: "Sure, I can do Rs 8,500 :)", type: "text", createdAt: new Date(Date.now() - 3600_000).toISOString() },
  { id: "m4", conversationId: "c2", senderId: "u1", body: "Is this still available?", type: "text", createdAt: new Date(Date.now() - 7200_000).toISOString() },
];

const minsAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

export const NOTIFICATIONS: AppNotification[] = [
  { id: "n1", type: "offer", actorId: "u2", itemId: "i1", conversationId: "c1", body: "lena_thrifts sent you an offer of Rs 8,500", read: false, createdAt: minsAgo(60) },
  { id: "n2", type: "like", actorId: "u3", itemId: "i2", body: "max.closet liked your Oversized beige wool coat", read: false, createdAt: minsAgo(180) },
  { id: "n3", type: "follow", actorId: "u4", body: "sophie_style started following you", read: false, createdAt: minsAgo(320) },
  { id: "n4", type: "review", actorId: "u3", body: "max.closet left you a 5★ review", read: true, createdAt: minsAgo(1440) },
  { id: "n5", type: "like", actorId: "u5", itemId: "i10", body: "vintage_vault liked your Adidas Sambas OG", read: true, createdAt: minsAgo(2880) },
  { id: "n6", type: "system", body: "Your listing was bumped to the top of search results 🚀", read: true, createdAt: minsAgo(4320) },
];

export const REVIEWS: Review[] = [
  { id: "r1", orderId: "o0", reviewerId: "u3", revieweeId: "u1", rating: 5, comment: "Item exactly as described, super fast shipping. Thank you!", createdAt: "2025-05-20" },
  { id: "r2", orderId: "o0", reviewerId: "u4", revieweeId: "u1", rating: 5, comment: "Lovely seller, would buy again ❤️", createdAt: "2025-04-11" },
  { id: "r3", orderId: "o0", reviewerId: "u2", revieweeId: "u1", rating: 4, comment: "Great communication, item in good condition.", createdAt: "2025-03-02" },
];

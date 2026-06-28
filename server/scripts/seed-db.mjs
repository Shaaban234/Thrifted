// Seeds demo users + items so the connected app has content.
// Usage: npm run db:seed   (all demo users have password: "password")
import { neon } from "@neondatabase/serverless";
import { scryptSync, randomBytes } from "node:crypto";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("✗ DATABASE_URL is not set. Add it to server/.env.local");
  process.exit(1);
}
const sql = neon(url);

const hash = (pw) => {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(pw, salt, 64).toString("hex")}`;
};
const pw = hash("password");
const photo = (tags, lock) => `https://loremflickr.com/600/800/${tags}?lock=${lock}`;

const users = [
  ["you@thrifted.app", "you", 12, "Selling my pre-loved wardrobe ✨", "Karachi, PK"],
  ["lena@thrifted.app", "lena_thrifts", 5, "Vintage & designer finds. Fast shipping 📦", "Lahore, PK"],
  ["max@thrifted.app", "max_closet", 13, "Menswear, streetwear, sneakers", "Islamabad, PK"],
  ["sophie@thrifted.app", "sophie_style", 9, "Minimal & sustainable 🌿", "Karachi, PK"],
];

const ids = {};
for (const [email, username, av, bio, loc] of users) {
  const r = await sql`
    insert into users (email, password_hash, username, avatar_url, bio, location, rating_avg, review_count, followers, following)
    values (${email}, ${pw}, ${username}, ${"https://i.pravatar.cc/200?img=" + av}, ${bio}, ${loc}, ${4.8}, ${24}, ${120}, ${60})
    on conflict (email) do nothing
    returning id`;
  ids[username] = r[0]?.id ?? (await sql`select id from users where email = ${email}`)[0].id;
}

const items = [
  ["lena_thrifts", "Vintage Levi's 501 jeans", "Classic straight-leg 501s in a mid-wash.", "Levi's", "women", "Jeans", "M", "Very good", "Blue", 9600, [photo("jeans,denim", 11), photo("denim", 21)]],
  ["sophie_style", "Oversized beige wool coat", "Gorgeous oversized wool-blend coat.", "COS", "women", "Coats & jackets", "S", "Very good", "Beige", 19500, [photo("coat,wool", 12), photo("coat", 22)]],
  ["max_closet", "Nike Air Force 1 '07", "White AF1s, cleaned and ready.", "Nike", "men", "Shoes", "42", "Good", "White", 14400, [photo("sneakers,nike", 13), photo("sneakers", 23)]],
  ["max_closet", "90s Carhartt work jacket", "Authentic vintage Carhartt jacket.", "Carhartt", "men", "Coats & jackets", "L", "Good", "Brown", 26700, [photo("jacket,workwear", 14), photo("jacket", 24)]],
  ["lena_thrifts", "Floral midi summer dress", "Light floral midi dress, never worn.", "Mango", "women", "Dresses", "S", "New with tags", "Multi", 8400, [photo("dress,floral", 15), photo("dress", 25)]],
  ["sophie_style", "Dr. Martens 1460 boots", "Iconic 8-eye boots, broken in.", "Dr. Martens", "women", "Shoes", "38", "Very good", "Black", 21000, [photo("boots,leather", 18), photo("boots", 28)]],
  ["max_closet", "The North Face puffer jacket", "Black Nuptse-style puffer, super warm.", "The North Face", "men", "Coats & jackets", "M", "Good", "Black", 22500, [photo("puffer,jacket", 17), photo("jacket,black", 27)]],
  ["lena_thrifts", "Adidas Sambas OG", "Classic Sambas, lightly worn.", "Adidas", "women", "Shoes", "39", "Very good", "Black", 16500, [photo("sneakers,adidas", 30), photo("samba", 31)]],
];

for (const [seller, title, desc, brand, cat, sub, size, cond, color, price, photos] of items) {
  await sql`
    insert into items (seller_id, title, description, brand, category, subcategory, size, condition, color, price, photos, likes)
    values (${ids[seller]}, ${title}, ${desc}, ${brand}, ${cat}, ${sub}, ${size}, ${cond}, ${color}, ${price}, ${photos}, ${Math.floor(Math.random() * 40)})`;
}

console.log(`✓ Seeded ${users.length} users and ${items.length} items. Login with any email above + password "password".`);

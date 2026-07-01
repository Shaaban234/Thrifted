import { Hono } from "hono";
import { handle } from "hono/vercel";
import { cors } from "hono/cors";
import { sql } from "@/lib/db";
import { hashPassword, verifyPassword, signToken, getUserId } from "@/lib/auth";
import { checkMessage } from "@/lib/moderation";

export const runtime = "nodejs";

const app = new Hono().basePath("/api");

app.use("*", cors());

// ---------- row mappers (snake_case DB -> camelCase API) ----------
const mapUser = (r: any) => ({
  id: r.id,
  username: r.username,
  avatarUrl: r.avatar_url ?? "",
  bio: r.bio ?? undefined,
  location: r.location ?? undefined,
  ratingAvg: Number(r.rating_avg ?? 0),
  reviewCount: r.review_count ?? 0,
  followers: r.followers ?? 0,
  following: r.following ?? 0,
  isAdmin: r.is_admin ?? false,
  joinedAt: r.joined_at,
});

// Like mapUser but includes private fields (email, phone, shipping address).
// Only ever returned to the authenticated user about themselves — never in
// public listings, so other users can't see someone's address or phone.
const mapMe = (r: any) => ({
  ...mapUser(r),
  email: r.email,
  fullName: r.full_name ?? "",
  phone: r.phone ?? "",
  addressLine1: r.address_line1 ?? "",
  addressLine2: r.address_line2 ?? "",
  city: r.city ?? "",
  postalCode: r.postal_code ?? "",
  country: r.country ?? "",
});

const mapItem = (r: any) => ({
  id: r.id,
  sellerId: r.seller_id,
  title: r.title,
  description: r.description ?? "",
  brand: r.brand,
  category: r.category,
  subcategory: r.subcategory ?? undefined,
  size: r.size,
  condition: r.condition,
  color: r.color ?? "Multi",
  price: Number(r.price),
  photos: r.photos ?? [],
  status: r.status,
  featured: r.featured ?? false,
  views: r.views ?? 0,
  likes: r.likes ?? 0,
  createdAt: r.created_at,
});

const mapMessage = (r: any) => ({
  id: r.id,
  conversationId: r.conversation_id,
  senderId: r.sender_id,
  body: r.body,
  type: r.type,
  offerAmount: r.offer_amount ?? undefined,
  offerStatus: r.offer_status ?? undefined,
  createdAt: r.created_at,
});

const mapConversation = (r: any) => ({
  id: r.id,
  itemId: r.item_id,
  buyerId: r.buyer_id,
  sellerId: r.seller_id,
  lastMessage: r.last_message ?? undefined,
  lastMessageAt: r.last_message_at ?? undefined,
  unread: Number(r.unread ?? 0),
});

const mapOrder = (r: any) => ({
  id: r.id,
  itemId: r.item_id,
  buyerId: r.buyer_id,
  sellerId: r.seller_id,
  amount: Number(r.amount),
  protectionFee: Number(r.protection_fee),
  shippingFee: Number(r.shipping_fee),
  total: Number(r.total),
  status: r.status,
  paymentMethod: r.payment_method ?? "card",
  createdAt: r.created_at,
});

const mapNotification = (r: any) => ({
  id: r.id,
  type: r.type,
  actorId: r.actor_id ?? undefined,
  itemId: r.item_id ?? undefined,
  conversationId: r.conversation_id ?? undefined,
  body: r.body,
  read: r.read,
  createdAt: r.created_at,
});

const mapWallet = (r: any) => ({
  id: r.id,
  userId: r.user_id,
  amount: Number(r.amount),
  type: r.type,
  label: r.label,
  createdAt: r.created_at,
});

const mapReview = (r: any) => ({
  id: r.id,
  orderId: r.order_id ?? undefined,
  reviewerId: r.reviewer_id,
  revieweeId: r.reviewee_id,
  rating: r.rating,
  comment: r.comment ?? "",
  createdAt: r.created_at,
});

// auth helper
async function requireUser(c: any): Promise<string | null> {
  return getUserId(c.req.header("Authorization"));
}

// admin helper — resolves the user id only if they are an admin, else null.
async function requireAdmin(c: any): Promise<string | null> {
  const uid = await requireUser(c);
  if (!uid) return null;
  const rows = await sql`select is_admin from users where id = ${uid}`;
  return rows.length && rows[0].is_admin ? uid : null;
}

// fire-and-forget notification (never notifies yourself)
async function notify(
  userId: string,
  n: { type: string; actorId?: string; itemId?: string; conversationId?: string; body: string }
) {
  if (!userId || userId === n.actorId) return;
  await sql`
    insert into notifications (user_id, type, actor_id, item_id, conversation_id, body)
    values (${userId}, ${n.type}, ${n.actorId ?? null}, ${n.itemId ?? null}, ${n.conversationId ?? null}, ${n.body})`;
}

// ---------- health ----------
app.get("/", (c) => c.json({ ok: true, service: "thrifted-api" }));

// ---------- auth ----------
app.post("/auth/signup", async (c) => {
  const { email, password, username } = await c.req.json().catch(() => ({}));
  if (!email || !password || !username)
    return c.json({ error: "email, password and username are required" }, 400);

  const existing = await sql`select id from users where email = ${email} or username = ${username}`;
  if (existing.length) return c.json({ error: "Email or username already taken" }, 409);

  const rows = await sql`
    insert into users (email, password_hash, username, avatar_url, bio)
    values (${email}, ${hashPassword(password)}, ${username},
            ${"https://i.pravatar.cc/200?u=" + encodeURIComponent(email)}, ${"New to NayaPurana ✨"})
    returning *`;
  const user = rows[0];
  const token = await signToken(user.id);
  return c.json({ token, user: mapMe(user) });
});

app.post("/auth/login", async (c) => {
  const { email, password } = await c.req.json().catch(() => ({}));
  if (!email || !password) return c.json({ error: "email and password are required" }, 400);

  const rows = await sql`select * from users where email = ${email}`;
  const user = rows[0];
  if (!user || !verifyPassword(password, user.password_hash))
    return c.json({ error: "Invalid email or password" }, 401);

  const token = await signToken(user.id);
  return c.json({ token, user: mapMe(user) });
});

app.get("/auth/me", async (c) => {
  const uid = await requireUser(c);
  if (!uid) return c.json({ error: "Unauthorized" }, 401);
  const rows = await sql`select * from users where id = ${uid}`;
  if (!rows.length) return c.json({ error: "Not found" }, 404);
  const favs = await sql`select item_id from favorites where user_id = ${uid}`;
  const follows = await sql`select followed_id from follows where follower_id = ${uid}`;
  return c.json({
    user: mapMe(rows[0]),
    favorites: favs.map((f: any) => f.item_id),
    follows: follows.map((f: any) => f.followed_id),
  });
});

// ---------- items ----------
app.get("/items", async (c) => {
  const { category, q, brand, size, condition, color, sort, sellerId } = c.req.query();
  const where: string[] = [];
  const params: any[] = [];
  const eq = (col: string, val: any) => { params.push(val); where.push(`${col} = $${params.length}`); };

  if (sellerId) eq("seller_id", sellerId);
  if (category) eq("category", category);
  if (brand) eq("brand", brand);
  if (size) eq("size", size);
  if (condition) eq("condition", condition);
  if (color) eq("color", color);
  if (q) {
    params.push(`%${q}%`);
    const p = `$${params.length}`;
    where.push(`(title ilike ${p} or brand ilike ${p} or description ilike ${p})`);
  }

  let order = "created_at desc";
  if (sort === "price_asc") order = "price asc";
  else if (sort === "price_desc") order = "price desc";

  const whereSql = where.length ? `where ${where.join(" and ")}` : "";
  const query = `select * from items ${whereSql} order by ${order} limit 100`;
  // neon HTTP driver: calling sql(string, params) runs a parameterized raw query.
  const rows = (await (sql as any)(query, params)) as any[];

  // Include the distinct sellers so the app can render cards/detail without N+1 fetches.
  const sellerIds = [...new Set(rows.map((r) => r.seller_id))];
  let sellers: any[] = [];
  if (sellerIds.length) {
    const sRows = (await sql`select * from users where id = any(${sellerIds})`) as any[];
    sellers = sRows.map(mapUser);
  }
  return c.json({ items: rows.map(mapItem), sellers });
});

app.get("/items/:id", async (c) => {
  const rows = await sql`select * from items where id = ${c.req.param("id")}`;
  if (!rows.length) return c.json({ error: "Not found" }, 404);
  await sql`update items set views = views + 1 where id = ${rows[0].id}`;
  const seller = await sql`select * from users where id = ${rows[0].seller_id}`;
  return c.json({ item: mapItem(rows[0]), seller: seller[0] ? mapUser(seller[0]) : null });
});

app.post("/items", async (c) => {
  const uid = await requireUser(c);
  if (!uid) return c.json({ error: "Unauthorized" }, 401);
  const b = await c.req.json();
  // price column is an integer (PKR). The client uses a decimal keypad, so coerce
  // to a whole number here to avoid "invalid input syntax for type integer".
  const price = Math.round(Number(b.price));
  if (!Number.isFinite(price)) return c.json({ error: "Invalid price" }, 400);
  const rows = await sql`
    insert into items (seller_id, title, description, brand, category, subcategory, size, condition, color, price, photos)
    values (${uid}, ${b.title}, ${b.description ?? ""}, ${b.brand}, ${b.category}, ${b.subcategory ?? null},
            ${b.size}, ${b.condition}, ${b.color ?? "Multi"}, ${price}, ${b.photos ?? []})
    returning *`;
  return c.json({ item: mapItem(rows[0]) });
});

app.patch("/items/:id", async (c) => {
  const uid = await requireUser(c);
  if (!uid) return c.json({ error: "Unauthorized" }, 401);
  const id = c.req.param("id");
  const owned = await sql`select seller_id from items where id = ${id}`;
  if (!owned.length) return c.json({ error: "Not found" }, 404);
  if (owned[0].seller_id !== uid) return c.json({ error: "Forbidden" }, 403);
  const b = await c.req.json();
  // price is an integer column; round any decimal from the client (null = leave unchanged).
  const price = b.price == null ? null : Math.round(Number(b.price));
  if (price != null && !Number.isFinite(price)) return c.json({ error: "Invalid price" }, 400);
  const rows = await sql`
    update items set
      title = coalesce(${b.title ?? null}, title),
      description = coalesce(${b.description ?? null}, description),
      brand = coalesce(${b.brand ?? null}, brand),
      category = coalesce(${b.category ?? null}, category),
      subcategory = coalesce(${b.subcategory ?? null}, subcategory),
      size = coalesce(${b.size ?? null}, size),
      condition = coalesce(${b.condition ?? null}, condition),
      color = coalesce(${b.color ?? null}, color),
      price = coalesce(${price}, price),
      status = coalesce(${b.status ?? null}, status),
      photos = coalesce(${b.photos ?? null}, photos)
    where id = ${id} returning *`;
  return c.json({ item: mapItem(rows[0]) });
});

app.delete("/items/:id", async (c) => {
  const uid = await requireUser(c);
  if (!uid) return c.json({ error: "Unauthorized" }, 401);
  const id = c.req.param("id");
  const owned = await sql`select seller_id from items where id = ${id}`;
  if (!owned.length) return c.json({ error: "Not found" }, 404);
  if (owned[0].seller_id !== uid) return c.json({ error: "Forbidden" }, 403);
  await sql`delete from items where id = ${id}`;
  return c.json({ ok: true });
});

// Seller pays to feature their own listing (mock payment recorded as a wallet fee).
app.post("/items/:id/feature", async (c) => {
  const uid = await requireUser(c);
  if (!uid) return c.json({ error: "Unauthorized" }, 401);
  const id = c.req.param("id");
  const owned = await sql`select seller_id, title, featured from items where id = ${id}`;
  if (!owned.length) return c.json({ error: "Not found" }, 404);
  if (owned[0].seller_id !== uid) return c.json({ error: "Forbidden" }, 403);
  if (owned[0].featured) return c.json({ error: "This listing is already featured" }, 400);
  const FEATURE_FEE = 500; // keep in sync with lib/format.ts
  await sql`insert into wallet_transactions (user_id, amount, type, label)
            values (${uid}, ${-FEATURE_FEE}, 'fee', ${"Featured listing: " + owned[0].title})`;
  const rows = await sql`update items set featured = true where id = ${id} returning *`;
  return c.json({ item: mapItem(rows[0]) });
});

// ---------- users ----------
// Update the authenticated user's own profile + shipping address.
// Only provided fields change (coalesce keeps the rest). Must be declared before
// the /users/:id route so "me" isn't captured as an id.
app.patch("/users/me", async (c) => {
  const uid = await requireUser(c);
  if (!uid) return c.json({ error: "Unauthorized" }, 401);
  const b = await c.req.json().catch(() => ({}));

  // Username is unique — reject if another user already has the requested one.
  if (b.username != null) {
    const taken = await sql`select 1 from users where username = ${b.username} and id <> ${uid}`;
    if (taken.length) return c.json({ error: "Username already taken" }, 409);
  }

  const rows = await sql`
    update users set
      username      = coalesce(${b.username ?? null}, username),
      bio           = coalesce(${b.bio ?? null}, bio),
      location      = coalesce(${b.location ?? null}, location),
      avatar_url    = coalesce(${b.avatarUrl ?? null}, avatar_url),
      full_name     = coalesce(${b.fullName ?? null}, full_name),
      phone         = coalesce(${b.phone ?? null}, phone),
      address_line1 = coalesce(${b.addressLine1 ?? null}, address_line1),
      address_line2 = coalesce(${b.addressLine2 ?? null}, address_line2),
      city          = coalesce(${b.city ?? null}, city),
      postal_code   = coalesce(${b.postalCode ?? null}, postal_code),
      country       = coalesce(${b.country ?? null}, country)
    where id = ${uid} returning *`;
  return c.json({ user: mapMe(rows[0]) });
});

app.get("/users/:id", async (c) => {
  const rows = await sql`select * from users where id = ${c.req.param("id")}`;
  if (!rows.length) return c.json({ error: "Not found" }, 404);
  const items = await sql`select * from items where seller_id = ${rows[0].id} order by created_at desc`;
  const reviews = await sql`select * from reviews where reviewee_id = ${rows[0].id} order by created_at desc`;
  return c.json({ user: mapUser(rows[0]), items: items.map(mapItem), reviews });
});

// ---------- favorites ----------
app.get("/favorites", async (c) => {
  const uid = await requireUser(c);
  if (!uid) return c.json({ error: "Unauthorized" }, 401);
  const rows = await sql`
    select i.* from items i join favorites f on f.item_id = i.id
    where f.user_id = ${uid} order by f.created_at desc`;
  return c.json({ items: rows.map(mapItem) });
});

app.post("/favorites/:itemId", async (c) => {
  const uid = await requireUser(c);
  if (!uid) return c.json({ error: "Unauthorized" }, 401);
  const itemId = c.req.param("itemId");
  const existing = await sql`select 1 from favorites where user_id = ${uid} and item_id = ${itemId}`;
  if (existing.length) {
    await sql`delete from favorites where user_id = ${uid} and item_id = ${itemId}`;
    await sql`update items set likes = greatest(likes - 1, 0) where id = ${itemId}`;
    return c.json({ favorited: false });
  }
  await sql`insert into favorites (user_id, item_id) values (${uid}, ${itemId})`;
  await sql`update items set likes = likes + 1 where id = ${itemId}`;
  const it = (await sql`select seller_id, title from items where id = ${itemId}`)[0];
  const me = (await sql`select username from users where id = ${uid}`)[0];
  if (it) await notify(it.seller_id, { type: "like", actorId: uid, itemId, body: `${me?.username} liked your ${it.title}` });
  return c.json({ favorited: true });
});

// ---------- follows ----------
app.post("/follows/:userId", async (c) => {
  const uid = await requireUser(c);
  if (!uid) return c.json({ error: "Unauthorized" }, 401);
  const target = c.req.param("userId");
  if (target === uid) return c.json({ error: "Cannot follow yourself" }, 400);
  const existing = await sql`select 1 from follows where follower_id = ${uid} and followed_id = ${target}`;
  if (existing.length) {
    await sql`delete from follows where follower_id = ${uid} and followed_id = ${target}`;
    await sql`update users set followers = greatest(followers - 1, 0) where id = ${target}`;
    await sql`update users set following = greatest(following - 1, 0) where id = ${uid}`;
    return c.json({ following: false });
  }
  await sql`insert into follows (follower_id, followed_id) values (${uid}, ${target})`;
  await sql`update users set followers = followers + 1 where id = ${target}`;
  await sql`update users set following = following + 1 where id = ${uid}`;
  const me = (await sql`select username from users where id = ${uid}`)[0];
  await notify(target, { type: "follow", actorId: uid, body: `${me?.username} started following you` });
  return c.json({ following: true });
});

// ---------- conversations & messages ----------
app.get("/conversations", async (c) => {
  const uid = await requireUser(c);
  if (!uid) return c.json({ error: "Unauthorized" }, 401);
  const rows = (await sql`
    select c.*,
      (select body from messages m where m.conversation_id = c.id order by created_at desc limit 1) as last_message,
      (select created_at from messages m where m.conversation_id = c.id order by created_at desc limit 1) as last_message_at
    from conversations c
    where c.buyer_id = ${uid} or c.seller_id = ${uid}
    order by last_message_at desc nulls last`) as any[];

  const userIds = [...new Set(rows.flatMap((r) => [r.buyer_id, r.seller_id]))];
  const itemIds = [...new Set(rows.map((r) => r.item_id).filter(Boolean))];
  const users = userIds.length ? ((await sql`select * from users where id = any(${userIds})`) as any[]).map(mapUser) : [];
  const items = itemIds.length ? ((await sql`select * from items where id = any(${itemIds})`) as any[]).map(mapItem) : [];
  return c.json({ conversations: rows.map(mapConversation), users, items });
});

app.post("/conversations", async (c) => {
  const uid = await requireUser(c);
  if (!uid) return c.json({ error: "Unauthorized" }, 401);
  const { itemId } = await c.req.json();
  const item = (await sql`select seller_id from items where id = ${itemId}`)[0];
  if (!item) return c.json({ error: "Item not found" }, 404);
  const existing = await sql`select * from conversations where item_id = ${itemId} and buyer_id = ${uid}`;
  if (existing.length) return c.json({ conversation: mapConversation(existing[0]) });
  const rows = await sql`
    insert into conversations (item_id, buyer_id, seller_id)
    values (${itemId}, ${uid}, ${item.seller_id}) returning *`;
  return c.json({ conversation: mapConversation(rows[0]) });
});

app.get("/conversations/:id/messages", async (c) => {
  const uid = await requireUser(c);
  if (!uid) return c.json({ error: "Unauthorized" }, 401);
  const rows = await sql`select * from messages where conversation_id = ${c.req.param("id")} order by created_at asc`;
  return c.json({ messages: rows.map(mapMessage) });
});

async function otherParticipant(convoId: string, uid: string): Promise<string | null> {
  const c = (await sql`select buyer_id, seller_id from conversations where id = ${convoId}`)[0];
  if (!c) return null;
  return c.buyer_id === uid ? c.seller_id : c.buyer_id;
}

app.post("/conversations/:id/messages", async (c) => {
  const uid = await requireUser(c);
  if (!uid) return c.json({ error: "Unauthorized" }, 401);
  const convoId = c.req.param("id");
  const { body } = await c.req.json();
  // Guard against off-platform contact sharing and profanity.
  const check = checkMessage(String(body ?? ""));
  if (!check.ok) return c.json({ error: check.message, reason: check.reason }, 400);
  const rows = await sql`
    insert into messages (conversation_id, sender_id, body, type)
    values (${convoId}, ${uid}, ${body}, 'text') returning *`;
  const other = await otherParticipant(convoId, uid);
  const me = (await sql`select username from users where id = ${uid}`)[0];
  if (other) await notify(other, { type: "system", actorId: uid, conversationId: convoId, body: `${me?.username}: ${body}` });
  return c.json({ message: mapMessage(rows[0]) });
});

app.post("/conversations/:id/offers", async (c) => {
  const uid = await requireUser(c);
  if (!uid) return c.json({ error: "Unauthorized" }, 401);
  const convoId = c.req.param("id");
  const { amount } = await c.req.json();
  const rows = await sql`
    insert into messages (conversation_id, sender_id, body, type, offer_amount, offer_status)
    values (${convoId}, ${uid}, ${"Offered Rs " + Number(amount).toLocaleString()}, 'offer', ${amount}, 'pending')
    returning *`;
  const other = await otherParticipant(convoId, uid);
  const me = (await sql`select username from users where id = ${uid}`)[0];
  if (other) await notify(other, { type: "offer", actorId: uid, conversationId: convoId, body: `${me?.username} sent you an offer of Rs ${Number(amount).toLocaleString()}` });
  return c.json({ message: mapMessage(rows[0]) });
});

app.post("/messages/:id/offer-response", async (c) => {
  const uid = await requireUser(c);
  if (!uid) return c.json({ error: "Unauthorized" }, 401);
  const { accept } = await c.req.json();
  const rows = await sql`
    update messages set offer_status = ${accept ? "accepted" : "declined"}
    where id = ${c.req.param("id")} returning *`;
  if (!rows.length) return c.json({ error: "Not found" }, 404);
  return c.json({ message: mapMessage(rows[0]) });
});

// ---------- orders ----------
app.post("/orders", async (c) => {
  const uid = await requireUser(c);
  if (!uid) return c.json({ error: "Unauthorized" }, 401);
  const { itemId, paymentMethod } = await c.req.json();
  const method = paymentMethod === "cod" ? "cod" : "card";
  const item = (await sql`select * from items where id = ${itemId}`)[0];
  if (!item) return c.json({ error: "Item not found" }, 404);
  const amount = Number(item.price);
  const protectionFee = Math.round(49 + amount * 0.05);
  const shippingFee = 199;
  const total = amount + protectionFee + shippingFee;

  const order = (await sql`
    insert into orders (item_id, buyer_id, seller_id, amount, protection_fee, shipping_fee, total, status, payment_method)
    values (${itemId}, ${uid}, ${item.seller_id}, ${amount}, ${protectionFee}, ${shippingFee}, ${total}, 'paid', ${method})
    returning *`)[0];

  await sql`update items set status = 'sold' where id = ${itemId}`;
  // Card payments move money through the in-app wallet now; cash-on-delivery is
  // collected in person on delivery, so it doesn't touch the wallet.
  if (method === "card") {
    await sql`insert into wallet_transactions (user_id, amount, type, label, order_id) values (${uid}, ${-total}, 'purchase', ${"Purchase: " + item.title}, ${order.id})`;
    await sql`insert into wallet_transactions (user_id, amount, type, label, order_id) values (${item.seller_id}, ${amount}, 'sale', ${"Sale: " + item.title}, ${order.id})`;
  }
  const me = (await sql`select username from users where id = ${uid}`)[0];
  await notify(item.seller_id, { type: "sold", actorId: uid, itemId, body: `${me?.username} bought your ${item.title}` });
  return c.json({ order: mapOrder(order) });
});

app.get("/orders", async (c) => {
  const uid = await requireUser(c);
  if (!uid) return c.json({ error: "Unauthorized" }, 401);
  const rows = await sql`select * from orders where buyer_id = ${uid} or seller_id = ${uid} order by created_at desc`;
  return c.json({ orders: rows.map(mapOrder) });
});

app.post("/orders/:id/advance", async (c) => {
  const uid = await requireUser(c);
  if (!uid) return c.json({ error: "Unauthorized" }, 401);
  const flow = ["paid", "shipped", "delivered", "completed"];
  const o = (await sql`select * from orders where id = ${c.req.param("id")}`)[0];
  if (!o) return c.json({ error: "Not found" }, 404);
  const next = flow[Math.min(flow.indexOf(o.status) + 1, flow.length - 1)];
  const rows = await sql`update orders set status = ${next} where id = ${o.id} returning *`;
  return c.json({ order: mapOrder(rows[0]) });
});

// ---------- reviews ----------
app.post("/reviews", async (c) => {
  const uid = await requireUser(c);
  if (!uid) return c.json({ error: "Unauthorized" }, 401);
  const { revieweeId, rating, comment, orderId } = await c.req.json();
  const rows = await sql`
    insert into reviews (order_id, reviewer_id, reviewee_id, rating, comment)
    values (${orderId ?? null}, ${uid}, ${revieweeId}, ${rating}, ${comment ?? ""}) returning *`;
  // recompute reviewee aggregate
  const agg = (await sql`select count(*)::int as n, coalesce(avg(rating),0) as avg from reviews where reviewee_id = ${revieweeId}`)[0];
  await sql`update users set review_count = ${agg.n}, rating_avg = ${Number(agg.avg).toFixed(1)} where id = ${revieweeId}`;
  const me = (await sql`select username from users where id = ${uid}`)[0];
  await notify(revieweeId, { type: "review", actorId: uid, body: `${me?.username} left you a ${rating}★ review` });
  return c.json({ review: mapReview(rows[0]) });
});

// ---------- notifications ----------
app.get("/notifications", async (c) => {
  const uid = await requireUser(c);
  if (!uid) return c.json({ error: "Unauthorized" }, 401);
  const rows = await sql`select * from notifications where user_id = ${uid} order by created_at desc limit 50`;
  return c.json({ notifications: rows.map(mapNotification) });
});

app.post("/notifications/read", async (c) => {
  const uid = await requireUser(c);
  if (!uid) return c.json({ error: "Unauthorized" }, 401);
  await sql`update notifications set read = true where user_id = ${uid}`;
  return c.json({ ok: true });
});

// ---------- wallet ----------
app.get("/wallet", async (c) => {
  const uid = await requireUser(c);
  if (!uid) return c.json({ error: "Unauthorized" }, 401);
  const rows = await sql`select * from wallet_transactions where user_id = ${uid} order by created_at desc`;
  const balance = (rows as any[]).reduce((sum, r) => sum + Number(r.amount), 0);
  return c.json({ transactions: rows.map(mapWallet), balance });
});

// ---------- admin ----------
// All admin routes require the caller to be an admin (is_admin = true).
app.get("/admin/overview", async (c) => {
  if (!(await requireAdmin(c))) return c.json({ error: "Forbidden" }, 403);
  const [u] = await sql`select count(*)::int n, count(*) filter (where is_admin)::int admins from users`;
  const [it] = await sql`
    select count(*)::int n,
      count(*) filter (where status = 'active')::int active,
      count(*) filter (where status = 'sold')::int sold
    from items`;
  const [o] = await sql`select count(*)::int n, coalesce(sum(total), 0)::int gmv from orders`;
  return c.json({
    users: u.n, admins: u.admins,
    items: it.n, activeItems: it.active, soldItems: it.sold,
    orders: o.n, gmv: o.gmv,
  });
});

app.get("/admin/users", async (c) => {
  if (!(await requireAdmin(c))) return c.json({ error: "Forbidden" }, 403);
  const rows = (await sql`
    select u.*,
      (select count(*)::int from items i where i.seller_id = u.id) as item_count,
      (select count(*)::int from orders o where o.buyer_id = u.id) as order_count
    from users u order by joined_at desc`) as any[];
  return c.json({
    users: rows.map((r) => ({ ...mapMe(r), itemCount: r.item_count, orderCount: r.order_count })),
  });
});

app.get("/admin/items", async (c) => {
  if (!(await requireAdmin(c))) return c.json({ error: "Forbidden" }, 403);
  const rows = (await sql`
    select i.*, u.username as seller_username
    from items i left join users u on u.id = i.seller_id
    order by i.created_at desc`) as any[];
  return c.json({ items: rows.map((r) => ({ ...mapItem(r), sellerUsername: r.seller_username ?? "—" })) });
});

app.get("/admin/orders", async (c) => {
  if (!(await requireAdmin(c))) return c.json({ error: "Forbidden" }, 403);
  const rows = (await sql`
    select o.*, i.title as item_title, b.username as buyer_username, s.username as seller_username
    from orders o
    left join items i on i.id = o.item_id
    left join users b on b.id = o.buyer_id
    left join users s on s.id = o.seller_id
    order by o.created_at desc`) as any[];
  return c.json({
    orders: rows.map((r) => ({
      ...mapOrder(r),
      itemTitle: r.item_title ?? "(deleted item)",
      buyerUsername: r.buyer_username ?? "—",
      sellerUsername: r.seller_username ?? "—",
    })),
  });
});

// Admin selects which listings are featured (no payment required).
app.patch("/admin/items/:id/feature", async (c) => {
  if (!(await requireAdmin(c))) return c.json({ error: "Forbidden" }, 403);
  const { featured } = await c.req.json().catch(() => ({}));
  const rows = await sql`update items set featured = ${!!featured} where id = ${c.req.param("id")} returning *`;
  if (!rows.length) return c.json({ error: "Not found" }, 404);
  return c.json({ item: mapItem(rows[0]) });
});

// Remove any listing (cascades to favorites and its orders).
app.delete("/admin/items/:id", async (c) => {
  if (!(await requireAdmin(c))) return c.json({ error: "Forbidden" }, 403);
  await sql`delete from items where id = ${c.req.param("id")}`;
  return c.json({ ok: true });
});

// Remove any account (cascades to their items, orders, wallet, etc.).
// Admins can't delete their own account here, to avoid locking themselves out.
app.delete("/admin/users/:id", async (c) => {
  const adminId = await requireAdmin(c);
  if (!adminId) return c.json({ error: "Forbidden" }, 403);
  const target = c.req.param("id");
  if (target === adminId) return c.json({ error: "You can't delete your own admin account" }, 400);
  await sql`delete from users where id = ${target}`;
  return c.json({ ok: true });
});

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
export const OPTIONS = handle(app);

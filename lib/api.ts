// HTTP client for the Thrifted API (Neon-backed). Token is persisted in AsyncStorage.
import AsyncStorage from "@react-native-async-storage/async-storage";

// Native (iOS/Android) builds must point at an absolute API URL via EXPO_PUBLIC_API_URL.
// The web build is served from the same Vercel domain as the API, so it defaults to
// same-origin ("") and calls /api on whatever host it was loaded from.
const BASE =
  process.env.EXPO_PUBLIC_API_URL ??
  (typeof window !== "undefined" ? "" : "http://localhost:3001");
const TOKEN_KEY = "thrifted.token";

let token: string | null = null;

export async function loadToken(): Promise<string | null> {
  token = await AsyncStorage.getItem(TOKEN_KEY);
  return token;
}
async function setToken(t: string) {
  token = t;
  await AsyncStorage.setItem(TOKEN_KEY, t);
}
export async function clearToken() {
  token = null;
  await AsyncStorage.removeItem(TOKEN_KEY);
}

async function req(path: string, opts: RequestInit = {}): Promise<any> {
  const res = await fetch(BASE + path, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers ?? {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? `Request failed (${res.status})`);
  return data;
}

export const api = {
  baseUrl: BASE,

  async signup(email: string, password: string, username: string) {
    const d = await req("/api/auth/signup", { method: "POST", body: JSON.stringify({ email, password, username }) });
    await setToken(d.token);
    return d;
  },
  async login(email: string, password: string) {
    const d = await req("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    await setToken(d.token);
    return d;
  },
  me: () => req("/api/auth/me"),
  logout: clearToken,

  getItems: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return req(`/api/items${qs ? `?${qs}` : ""}`);
  },
  getItem: (id: string) => req(`/api/items/${id}`),
  createItem: (body: any) => req("/api/items", { method: "POST", body: JSON.stringify(body) }),
  updateItem: (id: string, body: any) => req(`/api/items/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteItem: (id: string) => req(`/api/items/${id}`, { method: "DELETE" }),

  getUser: (id: string) => req(`/api/users/${id}`),
  getFavorites: () => req("/api/favorites"),
  toggleFavorite: (itemId: string) => req(`/api/favorites/${itemId}`, { method: "POST" }),
  toggleFollow: (userId: string) => req(`/api/follows/${userId}`, { method: "POST" }),

  // conversations & messages
  getConversations: () => req("/api/conversations"),
  createConversation: (itemId: string) => req("/api/conversations", { method: "POST", body: JSON.stringify({ itemId }) }),
  getMessages: (convoId: string) => req(`/api/conversations/${convoId}/messages`),
  sendMessage: (convoId: string, body: string) => req(`/api/conversations/${convoId}/messages`, { method: "POST", body: JSON.stringify({ body }) }),
  sendOffer: (convoId: string, amount: number) => req(`/api/conversations/${convoId}/offers`, { method: "POST", body: JSON.stringify({ amount }) }),
  respondOffer: (messageId: string, accept: boolean) => req(`/api/messages/${messageId}/offer-response`, { method: "POST", body: JSON.stringify({ accept }) }),

  // orders, reviews, notifications, wallet
  getOrders: () => req("/api/orders"),
  createOrder: (itemId: string) => req("/api/orders", { method: "POST", body: JSON.stringify({ itemId }) }),
  advanceOrder: (orderId: string) => req(`/api/orders/${orderId}/advance`, { method: "POST" }),
  createReview: (revieweeId: string, rating: number, comment: string) => req("/api/reviews", { method: "POST", body: JSON.stringify({ revieweeId, rating, comment }) }),
  getNotifications: () => req("/api/notifications"),
  markNotificationsRead: () => req("/api/notifications/read", { method: "POST" }),
  getWallet: () => req("/api/wallet"),
};

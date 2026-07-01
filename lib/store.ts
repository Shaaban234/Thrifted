// Central app state. Auth, items, favorites, follows and profiles are backed by the
// Neon API (lib/api.ts). Conversations/messages/orders/reviews/notifications/wallet
// are still in-memory (next API slice).
import { create } from "zustand";
import type {
  Item,
  ItemStatus,
  User,
  Conversation,
  Message,
  Order,
  Review,
  AppNotification,
  WalletTransaction,
  Filters,
  ProfileUpdate,
  PaymentMethod,
} from "./types";
import { formatPrice, FEATURE_FEE } from "./format";
import { api, loadToken } from "./api";

let idCounter = 1000;
const nextId = (p: string) => `${p}${++idCounter}`;

export type { Filters };

const DEFAULT_FILTERS: Filters = {
  query: "", category: null, brand: null, size: null,
  condition: null, color: null, price: null, sort: "relevance",
};

function mergeUsers(existing: User[], incoming: User[]): User[] {
  const map = new Map(existing.map((u) => [u.id, u]));
  for (const u of incoming) map.set(u.id, { ...map.get(u.id), ...u });
  return [...map.values()];
}

// Primary list first; append any referenced items (e.g. from conversations) not in it.
function mergeItems(primary: Item[], extra: Item[]): Item[] {
  const ids = new Set(primary.map((i) => i.id));
  return [...primary, ...extra.filter((i) => !ids.has(i.id))];
}

interface AppState {
  // auth / session
  booting: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  currentUserId: string;
  restoreSession: () => Promise<void>;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
  updateProfile: (partial: ProfileUpdate) => Promise<void>;

  // filters
  filters: Filters;
  setFilters: (partial: Partial<Filters>) => void;
  clearFilters: () => void;
  activeFilterCount: () => number;

  // data
  users: User[];
  items: Item[];
  favorites: string[];
  follows: string[];
  conversations: Conversation[];
  messages: Message[];
  orders: Order[];
  reviews: Review[];
  notifications: AppNotification[];
  wallet: WalletTransaction[];

  // selectors
  getItem: (id: string) => Item | undefined;
  getUser: (id: string) => User | undefined;
  itemsBySeller: (sellerId: string) => Item[];
  messagesFor: (conversationId: string) => Message[];
  isFavorite: (itemId: string) => boolean;
  isFollowing: (userId: string) => boolean;
  walletBalance: () => number;
  unreadNotifications: () => number;
  markNotificationsRead: () => void;

  // item mutations (API-backed)
  addItem: (item: Omit<Item, "id" | "createdAt" | "views" | "likes" | "status" | "sellerId" | "featured">) => Promise<Item>;
  removeItem: (itemId: string) => void;
  setItemStatus: (itemId: string, status: ItemStatus) => void;
  updateItem: (itemId: string, partial: Partial<Item>) => void;
  featureItem: (itemId: string) => Promise<void>;
  toggleFavorite: (itemId: string) => void;
  toggleFollow: (userId: string) => void;

  // messaging / orders / reviews (API-backed)
  loadMessages: (conversationId: string) => Promise<void>;
  startConversation: (itemId: string) => Promise<Conversation>;
  sendMessage: (conversationId: string, body: string) => void;
  sendOffer: (conversationId: string, amount: number) => void;
  respondOffer: (messageId: string, accept: boolean) => void;
  createOrder: (itemId: string, paymentMethod: PaymentMethod) => Promise<Order>;
  advanceOrder: (orderId: string) => void;
  addReview: (revieweeId: string, rating: number, comment: string) => void;
}

export const useStore = create<AppState>((set, get) => ({
  booting: true,
  isAuthenticated: false,
  isAdmin: false,
  currentUserId: "",

  restoreSession: async () => {
    try {
      const token = await loadToken();
      if (token) {
        await get().refresh();
        set({ isAuthenticated: true });
      }
    } catch {
      await api.logout();
    } finally {
      set({ booting: false });
    }
  },

  refresh: async () => {
    const me = await api.me();
    const [itemsRes, convosRes, notifsRes, ordersRes, walletRes] = await Promise.all([
      api.getItems(),
      api.getConversations(),
      api.getNotifications(),
      api.getOrders(),
      api.getWallet(),
    ]);
    set((s) => ({
      currentUserId: me.user.id,
      isAdmin: !!me.user.isAdmin,
      users: mergeUsers(s.users, [me.user, ...(itemsRes.sellers ?? []), ...(convosRes.users ?? [])]),
      items: mergeItems(itemsRes.items ?? [], convosRes.items ?? []),
      favorites: me.favorites ?? [],
      follows: me.follows ?? [],
      conversations: convosRes.conversations ?? [],
      notifications: notifsRes.notifications ?? [],
      orders: ordersRes.orders ?? [],
      wallet: walletRes.transactions ?? [],
    }));
  },

  login: async (email, password) => {
    const { user } = await api.login(email, password);
    set((s) => ({ isAuthenticated: true, currentUserId: user.id, isAdmin: !!user.isAdmin, users: mergeUsers(s.users, [user]) }));
    await get().refresh();
  },

  signup: async (email, password, username) => {
    const { user } = await api.signup(email, password, username);
    set((s) => ({ isAuthenticated: true, currentUserId: user.id, isAdmin: !!user.isAdmin, users: mergeUsers(s.users, [user]) }));
    await get().refresh();
  },

  updateProfile: async (partial) => {
    const { user } = await api.updateProfile(partial);
    set((s) => ({ users: mergeUsers(s.users, [user]) }));
  },

  logout: () => {
    api.logout();
    set({
      isAuthenticated: false, isAdmin: false, currentUserId: "",
      items: [], users: [], favorites: [], follows: [],
      conversations: [], messages: [], orders: [], notifications: [], wallet: [],
    });
  },

  filters: DEFAULT_FILTERS,
  setFilters: (partial) => set((s) => ({ filters: { ...s.filters, ...partial } })),
  clearFilters: () => set((s) => ({ filters: { ...DEFAULT_FILTERS, query: s.filters.query } })),
  activeFilterCount: () => {
    const f = get().filters;
    let n = 0;
    if (f.category) n++;
    if (f.brand) n++;
    if (f.size) n++;
    if (f.condition) n++;
    if (f.color) n++;
    if (f.price) n++;
    if (f.sort !== "relevance") n++;
    return n;
  },

  users: [],
  items: [],
  favorites: [],
  follows: [],
  conversations: [],
  messages: [],
  orders: [],
  reviews: [],
  notifications: [],
  wallet: [],

  getItem: (id) => get().items.find((i) => i.id === id),
  getUser: (id) => get().users.find((u) => u.id === id),
  itemsBySeller: (sellerId) => get().items.filter((i) => i.sellerId === sellerId),
  messagesFor: (conversationId) => get().messages.filter((m) => m.conversationId === conversationId),
  isFavorite: (itemId) => get().favorites.includes(itemId),
  isFollowing: (userId) => get().follows.includes(userId),
  walletBalance: () => Math.round(get().wallet.reduce((sum, t) => sum + t.amount, 0) * 100) / 100,
  unreadNotifications: () => get().notifications.filter((n) => !n.read).length,

  toggleFavorite: (itemId) => {
    const has = get().favorites.includes(itemId);
    set((s) => ({
      favorites: has ? s.favorites.filter((id) => id !== itemId) : [...s.favorites, itemId],
      items: s.items.map((i) => (i.id === itemId ? { ...i, likes: Math.max(0, i.likes + (has ? -1 : 1)) } : i)),
    }));
    api.toggleFavorite(itemId).catch(() => {
      // revert on failure
      set((s) => ({
        favorites: has ? [...s.favorites, itemId] : s.favorites.filter((id) => id !== itemId),
        items: s.items.map((i) => (i.id === itemId ? { ...i, likes: Math.max(0, i.likes + (has ? 1 : -1)) } : i)),
      }));
    });
  },

  toggleFollow: (userId) => {
    const has = get().follows.includes(userId);
    set((s) => ({
      follows: has ? s.follows.filter((id) => id !== userId) : [...s.follows, userId],
      users: s.users.map((u) => (u.id === userId ? { ...u, followers: Math.max(0, u.followers + (has ? -1 : 1)) } : u)),
    }));
    api.toggleFollow(userId).catch(() => {
      set((s) => ({ follows: has ? [...s.follows, userId] : s.follows.filter((id) => id !== userId) }));
    });
  },

  addItem: async (data) => {
    const { item } = await api.createItem(data);
    set((s) => ({ items: [item, ...s.items] }));
    return item;
  },

  removeItem: (itemId) => {
    set((s) => ({ items: s.items.filter((i) => i.id !== itemId) }));
    api.deleteItem(itemId).catch(() => {});
  },

  setItemStatus: (itemId, status) => {
    set((s) => ({ items: s.items.map((i) => (i.id === itemId ? { ...i, status } : i)) }));
    api.updateItem(itemId, { status }).catch(() => {});
  },

  updateItem: (itemId, partial) => {
    set((s) => ({ items: s.items.map((i) => (i.id === itemId ? { ...i, ...partial } : i)) }));
    api.updateItem(itemId, partial).catch(() => {});
  },

  featureItem: async (itemId) => {
    // Server records the mock fee payment and flips featured=true.
    const { item } = await api.featureItem(itemId);
    set((s) => ({
      items: s.items.map((i) => (i.id === itemId ? { ...i, ...item } : i)),
      wallet: [
        { id: nextId("w"), userId: get().currentUserId, amount: -FEATURE_FEE, type: "fee", label: "Featured listing", createdAt: new Date().toISOString() },
        ...s.wallet,
      ],
    }));
  },

  // ----- messaging / orders / reviews (API-backed, optimistic UI) -----
  loadMessages: async (conversationId) => {
    const { messages } = await api.getMessages(conversationId);
    set((s) => ({
      messages: [...s.messages.filter((m) => m.conversationId !== conversationId), ...messages],
    }));
  },

  startConversation: async (itemId) => {
    const { conversation } = await api.createConversation(itemId);
    set((s) => ({
      conversations: s.conversations.some((c) => c.id === conversation.id)
        ? s.conversations
        : [conversation, ...s.conversations],
    }));
    return conversation;
  },

  sendMessage: (conversationId, body) => {
    const msg: Message = { id: nextId("m"), conversationId, senderId: get().currentUserId, body, type: "text", createdAt: new Date().toISOString() };
    set((s) => ({
      messages: [...s.messages, msg],
      conversations: s.conversations.map((c) => (c.id === conversationId ? { ...c, lastMessage: body, lastMessageAt: msg.createdAt } : c)),
    }));
    api.sendMessage(conversationId, body).catch(() => {});
  },

  sendOffer: (conversationId, amount) => {
    const msg: Message = { id: nextId("m"), conversationId, senderId: get().currentUserId, body: `Offered ${formatPrice(amount)}`, type: "offer", offerAmount: amount, offerStatus: "pending", createdAt: new Date().toISOString() };
    set((s) => ({
      messages: [...s.messages, msg],
      conversations: s.conversations.map((c) => (c.id === conversationId ? { ...c, lastMessage: msg.body, lastMessageAt: msg.createdAt } : c)),
    }));
    api.sendOffer(conversationId, amount).catch(() => {});
  },

  respondOffer: (messageId, accept) => {
    set((s) => ({ messages: s.messages.map((m) => (m.id === messageId ? { ...m, offerStatus: accept ? "accepted" : "declined" } : m)) }));
    api.respondOffer(messageId, accept).catch(() => {});
  },

  createOrder: async (itemId, paymentMethod) => {
    const { order } = await api.createOrder(itemId, paymentMethod);
    set((s) => ({
      orders: [order, ...s.orders],
      items: s.items.map((i) => (i.id === itemId ? { ...i, status: "sold" } : i)),
      // Only card payments debit the wallet; cash-on-delivery is paid in person.
      wallet:
        paymentMethod === "card"
          ? [
              { id: nextId("w"), userId: get().currentUserId, amount: -order.total, type: "purchase", label: `Purchase`, createdAt: order.createdAt },
              ...s.wallet,
            ]
          : s.wallet,
    }));
    return order;
  },

  advanceOrder: (orderId) => {
    set((s) => ({
      orders: s.orders.map((o) => {
        if (o.id !== orderId) return o;
        const flow: Order["status"][] = ["paid", "shipped", "delivered", "completed"];
        return { ...o, status: flow[Math.min(flow.indexOf(o.status) + 1, flow.length - 1)] };
      }),
    }));
    api.advanceOrder(orderId).catch(() => {});
  },

  addReview: (revieweeId, rating, comment) => {
    const review: Review = { id: nextId("r"), orderId: undefined, reviewerId: get().currentUserId, revieweeId, rating, comment, createdAt: new Date().toISOString() };
    set((s) => ({ reviews: [review, ...s.reviews] }));
    api.createReview(revieweeId, rating, comment).catch(() => {});
  },

  markNotificationsRead: () => {
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) }));
    api.markNotificationsRead().catch(() => {});
  },
}));

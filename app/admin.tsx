import { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, FlatList, Pressable, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Avatar } from "@/components/Avatar";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import { formatPrice, timeAgo } from "@/lib/format";
import type { Item, Order, User } from "@/lib/types";

type Tab = "overview" | "users" | "items" | "orders";
type Overview = { users: number; admins: number; items: number; activeItems: number; soldItems: number; orders: number; gmv: number };
type AdminUser = User & { itemCount: number; orderCount: number };
type AdminItem = Item & { sellerUsername: string };
type AdminOrder = Order & { itemTitle: string; buyerUsername: string; sellerUsername: string };

export default function Admin() {
  const isAdmin = useStore((s) => s.isAdmin);
  const booting = useStore((s) => s.booting);
  const currentUserId = useStore((s) => s.currentUserId);

  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [items, setItems] = useState<AdminItem[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [o, u, i, ord] = await Promise.all([
        api.adminOverview(), api.adminUsers(), api.adminItems(), api.adminOrders(),
      ]);
      setOverview(o);
      setUsers(u.users ?? []);
      setItems(i.items ?? []);
      setOrders(ord.orders ?? []);
    } catch (e: any) {
      Alert.alert("Couldn't load admin data", e?.message ?? "Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  // Guard: non-admins never see this screen.
  if (!booting && !isAdmin) return <Redirecting />;

  const deleteItem = (it: AdminItem) => {
    Alert.alert("Remove listing", `Delete "${it.title}"? This can't be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try {
            await api.adminDeleteItem(it.id);
            setItems((prev) => prev.filter((x) => x.id !== it.id));
            api.adminOverview().then(setOverview).catch(() => {});
          } catch (e: any) {
            Alert.alert("Delete failed", e?.message ?? "Please try again.");
          }
        },
      },
    ]);
  };

  const deleteUser = (u: AdminUser) => {
    Alert.alert(
      "Remove account",
      `Delete @${u.username}? This also removes their listings and orders. This can't be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete", style: "destructive",
          onPress: async () => {
            try {
              await api.adminDeleteUser(u.id);
              setUsers((prev) => prev.filter((x) => x.id !== u.id));
              load();
            } catch (e: any) {
              Alert.alert("Delete failed", e?.message ?? "Please try again.");
            }
          },
        },
      ]
    );
  };

  const TABS: Tab[] = ["overview", "users", "items", "orders"];

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <View className="flex-row items-center px-4 py-3 border-b border-surface-border">
        <Pressable onPress={() => router.back()} hitSlop={8} className="pr-2">
          <Ionicons name="arrow-back" size={24} className="text-ink" />
        </Pressable>
        <Ionicons name="shield-checkmark" size={18} color="#007782" />
        <Text className="text-lg font-extrabold text-ink ml-1.5 flex-1">Admin panel</Text>
        <Pressable onPress={load} hitSlop={8}>
          <Ionicons name="refresh" size={20} className="text-ink-muted" />
        </Pressable>
      </View>

      {/* Tabs */}
      <View className="flex-row border-b border-surface-border">
        {TABS.map((t) => (
          <Pressable key={t} onPress={() => setTab(t)} className="flex-1 items-center py-3">
            <Text className={`font-semibold capitalize text-sm ${tab === t ? "text-ink" : "text-ink-faint"}`}>{t}</Text>
            {tab === t && <View className="h-0.5 w-full bg-ink absolute bottom-0" />}
          </Pressable>
        ))}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#007782" />
        </View>
      ) : tab === "overview" ? (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <View className="flex-row flex-wrap gap-3">
            <StatCard icon="people-outline" label="Users" value={overview?.users ?? 0} sub={`${overview?.admins ?? 0} admin`} />
            <StatCard icon="pricetags-outline" label="Listings" value={overview?.items ?? 0} sub={`${overview?.activeItems ?? 0} active · ${overview?.soldItems ?? 0} sold`} />
            <StatCard icon="receipt-outline" label="Orders" value={overview?.orders ?? 0} />
            <StatCard icon="cash-outline" label="GMV" value={formatPrice(overview?.gmv ?? 0)} />
          </View>
          <Text className="text-ink-faint text-xs mt-6 text-center">
            Live figures from the database. Use the tabs to moderate users and listings.
          </Text>
        </ScrollView>
      ) : tab === "users" ? (
        <FlatList
          data={users}
          keyExtractor={(u) => u.id}
          contentContainerStyle={{ padding: 12, gap: 8 }}
          renderItem={({ item: u }) => (
            <View className="flex-row items-center gap-3 bg-surface-alt rounded-xl p-3">
              <Avatar url={u.avatarUrl} name={u.username} size={40} />
              <View className="flex-1">
                <View className="flex-row items-center gap-1.5">
                  <Text className="text-ink font-semibold" numberOfLines={1}>@{u.username}</Text>
                  {u.isAdmin && <Ionicons name="shield-checkmark" size={13} color="#007782" />}
                  {u.id === currentUserId && <Text className="text-ink-faint text-xs">(you)</Text>}
                </View>
                <Text className="text-ink-muted text-xs" numberOfLines={1}>{u.email ?? "—"}</Text>
                <Text className="text-ink-faint text-xs">{u.itemCount} listings · {u.orderCount} orders</Text>
              </View>
              {u.id !== currentUserId && (
                <Pressable onPress={() => deleteUser(u)} hitSlop={6} className="p-2">
                  <Ionicons name="trash-outline" size={20} color="#DC2626" />
                </Pressable>
              )}
            </View>
          )}
          ListEmptyComponent={<Empty label="No users" />}
        />
      ) : tab === "items" ? (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: 12, gap: 8 }}
          renderItem={({ item: it }) => (
            <View className="flex-row items-center gap-3 bg-surface-alt rounded-xl p-3">
              <View className="flex-1">
                <Text className="text-ink font-semibold" numberOfLines={1}>{it.title}</Text>
                <Text className="text-ink-muted text-xs" numberOfLines={1}>
                  {formatPrice(it.price)} · @{it.sellerUsername} · {it.status}
                </Text>
                <Text className="text-ink-faint text-xs">{timeAgo(it.createdAt)}</Text>
              </View>
              <Pressable onPress={() => router.push(`/item/${it.id}`)} hitSlop={6} className="p-2">
                <Ionicons name="open-outline" size={19} className="text-ink-muted" />
              </Pressable>
              <Pressable onPress={() => deleteItem(it)} hitSlop={6} className="p-2">
                <Ionicons name="trash-outline" size={20} color="#DC2626" />
              </Pressable>
            </View>
          )}
          ListEmptyComponent={<Empty label="No listings" />}
        />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          contentContainerStyle={{ padding: 12, gap: 8 }}
          renderItem={({ item: o }) => (
            <View className="bg-surface-alt rounded-xl p-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-ink font-semibold flex-1" numberOfLines={1}>{o.itemTitle}</Text>
                <Text className="text-ink font-bold ml-2">{formatPrice(o.total)}</Text>
              </View>
              <Text className="text-ink-muted text-xs mt-0.5">
                @{o.buyerUsername} → @{o.sellerUsername}
              </Text>
              <View className="flex-row items-center gap-2 mt-1">
                <Badge label={o.status} />
                <Badge label={o.paymentMethod === "cod" ? "COD" : "Card"} />
                <Text className="text-ink-faint text-xs">{timeAgo(o.createdAt)}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={<Empty label="No orders" />}
        />
      )}
    </SafeAreaView>
  );
}

function StatCard({ icon, label, value, sub }: { icon: any; label: string; value: number | string; sub?: string }) {
  return (
    <View className="bg-surface-alt rounded-2xl p-4" style={{ width: "47%" }}>
      <Ionicons name={icon} size={22} color="#007782" />
      <Text className="text-ink text-2xl font-extrabold mt-2">{value}</Text>
      <Text className="text-ink-muted text-sm">{label}</Text>
      {sub ? <Text className="text-ink-faint text-xs mt-0.5">{sub}</Text> : null}
    </View>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <View className="bg-surface rounded-full px-2 py-0.5 border border-surface-border">
      <Text className="text-ink-muted text-[11px] font-medium capitalize">{label}</Text>
    </View>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <View className="items-center py-16">
      <Text className="text-ink-faint">{label}</Text>
    </View>
  );
}

function Redirecting() {
  useEffect(() => {
    router.replace("/(tabs)");
  }, []);
  return (
    <SafeAreaView className="flex-1 bg-surface items-center justify-center">
      <Text className="text-ink-muted">Admins only.</Text>
    </SafeAreaView>
  );
}

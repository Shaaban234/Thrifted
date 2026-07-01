import { useState } from "react";
import { View, Text, ScrollView, Pressable, FlatList, Share } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Avatar } from "@/components/Avatar";
import { StarRating } from "@/components/StarRating";
import { ItemCard } from "@/components/ItemCard";
import { ReviewRow } from "@/components/ReviewRow";
import { EmptyState } from "@/components/EmptyState";
import { useStore } from "@/lib/store";
import { formatPrice } from "@/lib/format";

type Tab = "listings" | "favorites" | "reviews";

export default function Profile() {
  const currentUserId = useStore((s) => s.currentUserId);
  const user = useStore((s) => s.getUser(currentUserId));
  const items = useStore((s) => s.items);
  const favorites = useStore((s) => s.favorites);
  const reviews = useStore((s) => s.reviews);
  const balance = useStore((s) => s.walletBalance());
  const isAdmin = useStore((s) => s.isAdmin);
  const [tab, setTab] = useState<Tab>("listings");

  const myItems = items.filter((i) => i.sellerId === currentUserId);
  const favItems = items.filter((i) => favorites.includes(i.id));
  const myReviews = reviews.filter((r) => r.revieweeId === currentUserId);

  if (!user) return null;

  const Header = (
    <View>
      {/* Top actions */}
      <View className="flex-row justify-end px-4 pt-1 gap-4">
        <Pressable onPress={() => router.push("/wallet")} hitSlop={6}>
          <Ionicons name="wallet-outline" size={24} className="text-ink" />
        </Pressable>
        <Pressable onPress={() => router.push("/settings")} hitSlop={6}>
          <Ionicons name="settings-outline" size={24} className="text-ink" />
        </Pressable>
      </View>

      {/* Identity */}
      <View className="items-center px-4 pt-2">
        <Avatar url={user.avatarUrl} name={user.username} size={88} />
        <View className="flex-row items-center gap-2 mt-3">
          <Text className="text-xl font-extrabold text-ink">{user.username}</Text>
          {isAdmin && (
            <View className="flex-row items-center gap-1 bg-ink rounded-full px-2.5 py-1">
              <Ionicons name="shield-checkmark" size={12} className="text-surface" />
              <Text className="text-surface text-xs font-bold">Admin</Text>
            </View>
          )}
        </View>
        <View className="flex-row items-center gap-1 mt-1">
          <StarRating rating={user.ratingAvg} size={15} />
          <Text className="text-ink-muted text-sm ml-1">
            {user.ratingAvg.toFixed(1)} · {user.reviewCount} reviews
          </Text>
        </View>
        {user.location && (
          <View className="flex-row items-center gap-1 mt-1">
            <Ionicons name="location-outline" size={13} className="text-ink-faint" />
            <Text className="text-ink-faint text-sm">{user.location}</Text>
          </View>
        )}
        {user.bio && <Text className="text-ink-muted text-center mt-2 px-6">{user.bio}</Text>}

        <View className="flex-row gap-8 mt-4">
          <Stat value={myItems.length} label="Listings" />
          <Stat value={user.followers} label="Followers" onPress={() => router.push(`/connections/${currentUserId}?tab=followers` as any)} />
          <Stat value={user.following} label="Following" onPress={() => router.push(`/connections/${currentUserId}?tab=following` as any)} />
        </View>

        {/* Edit profile + share */}
        <View className="flex-row gap-2 mt-4 w-full">
          <Pressable
            onPress={() => router.push("/edit-profile" as any)}
            className="flex-1 border border-surface-border rounded-full py-2.5 active:bg-surface-alt"
          >
            <Text className="text-ink font-semibold text-center">Edit profile</Text>
          </Pressable>
          <Pressable
            onPress={() => Share.share({ message: `Check out ${user.username}'s wardrobe on NayaPurana!` })}
            className="w-12 border border-surface-border rounded-full items-center justify-center active:bg-surface-alt"
          >
            <Ionicons name="share-social-outline" size={18} className="text-ink" />
          </Pressable>
        </View>
      </View>

      {/* Wallet card */}
      <Pressable
        onPress={() => router.push("/wallet")}
        className="mx-4 mt-5 bg-primary-light rounded-2xl p-4 flex-row items-center justify-between active:opacity-80"
      >
        <View>
          <Text className="text-primary-dark text-sm font-medium">Your balance</Text>
          <Text className="text-ink text-2xl font-extrabold mt-0.5">{formatPrice(balance)}</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Text className="text-primary-dark font-semibold">Wallet</Text>
          <Ionicons name="chevron-forward" size={18} color="#005A63" />
        </View>
      </Pressable>

      {/* Segmented control */}
      <View className="flex-row mt-5 border-b border-surface-border">
        {(["listings", "favorites", "reviews"] as Tab[]).map((t) => (
          <Pressable key={t} onPress={() => setTab(t)} className="flex-1 items-center py-3">
            <Text className={`font-semibold capitalize ${tab === t ? "text-ink" : "text-ink-faint"}`}>
              {t}
            </Text>
            {tab === t && <View className="h-0.5 w-full bg-ink absolute bottom-0" />}
          </Pressable>
        ))}
      </View>
    </View>
  );

  if (tab === "reviews") {
    return (
      <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
        <FlatList
          key="profile-reviews"
          data={myReviews}
          keyExtractor={(r) => r.id}
          ListHeaderComponent={Header}
          renderItem={({ item }) => <ReviewRow review={item} />}
          ListEmptyComponent={<EmptyState icon="star-outline" title="No reviews yet" />}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    );
  }

  const gridData = tab === "listings" ? myItems : favItems;
  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <FlatList
        key="profile-grid"
        data={gridData}
        keyExtractor={(i) => i.id}
        numColumns={2}
        ListHeaderComponent={Header}
        renderItem={({ item }) => <ItemCard item={item} />}
        columnWrapperStyle={{ gap: 12, paddingHorizontal: 12 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon={tab === "listings" ? "pricetag-outline" : "heart-outline"}
            title={tab === "listings" ? "No listings yet" : "No favorites yet"}
            subtitle={tab === "listings" ? "Tap Sell to list your first item." : "Tap the heart on items you love."}
          />
        }
      />
    </SafeAreaView>
  );
}

function Stat({ value, label, onPress }: { value: number; label: string; onPress?: () => void }) {
  return (
    <Pressable disabled={!onPress} onPress={onPress} className="items-center active:opacity-70">
      <Text className="text-ink text-lg font-extrabold">{value}</Text>
      <Text className="text-ink-faint text-xs">{label}</Text>
    </Pressable>
  );
}

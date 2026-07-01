import { useMemo, useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Avatar } from "@/components/Avatar";
import { StarRating } from "@/components/StarRating";
import { ItemCard } from "@/components/ItemCard";
import { ReviewRow } from "@/components/ReviewRow";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { useStore } from "@/lib/store";

export default function SellerProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useStore((s) => s.getUser(id!));
  const allItems = useStore((s) => s.items);
  const allReviews = useStore((s) => s.reviews);
  const items = useMemo(() => allItems.filter((i) => i.sellerId === id), [allItems, id]);
  const reviews = useMemo(() => allReviews.filter((r) => r.revieweeId === id), [allReviews, id]);
  const isFollowing = useStore((s) => s.follows.includes(id!));
  const toggleFollow = useStore((s) => s.toggleFollow);
  const [tab, setTab] = useState<"listings" | "reviews">("listings");

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-surface items-center justify-center">
        <Text className="text-ink-muted">Seller not found.</Text>
      </SafeAreaView>
    );
  }

  const Header = (
    <View>
      <View className="flex-row items-center px-4 pt-1 pb-2">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={26} className="text-ink" />
        </Pressable>
      </View>

      <View className="items-center px-4">
        <Avatar url={user.avatarUrl} name={user.username} size={80} />
        <Text className="text-xl font-extrabold text-ink mt-3">{user.username}</Text>
        <StarRating rating={user.ratingAvg} size={15} showValue count={user.reviewCount} />
        {user.location && (
          <View className="flex-row items-center gap-1 mt-1">
            <Ionicons name="location-outline" size={13} className="text-ink-faint" />
            <Text className="text-ink-faint text-sm">{user.location}</Text>
          </View>
        )}
        {user.bio && <Text className="text-ink-muted text-center mt-2 px-6">{user.bio}</Text>}

        <View className="flex-row gap-8 mt-4">
          <Stat value={items.length} label="Listings" />
          <Stat value={user.followers} label="Followers" />
          <Stat value={user.following} label="Following" />
        </View>

        <View className="w-full mt-4">
          <Button
            label={isFollowing ? "Following" : "Follow"}
            variant={isFollowing ? "outline" : "primary"}
            icon={isFollowing ? "checkmark" : "person-add-outline"}
            onPress={() => toggleFollow(user.id)}
          />
        </View>
      </View>

      <View className="flex-row mt-5 border-b border-surface-border">
        {(["listings", "reviews"] as const).map((t) => (
          <Pressable key={t} onPress={() => setTab(t)} className="flex-1 items-center py-3">
            <Text className={`font-semibold capitalize ${tab === t ? "text-ink" : "text-ink-faint"}`}>
              {t} {t === "reviews" ? `(${reviews.length})` : `(${items.length})`}
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
          key="seller-reviews"
          data={reviews}
          keyExtractor={(r) => r.id}
          ListHeaderComponent={Header}
          renderItem={({ item }) => <ReviewRow review={item} />}
          ListEmptyComponent={<EmptyState icon="star-outline" title="No reviews yet" />}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <FlatList
        key="seller-grid"
        data={items}
        keyExtractor={(i) => i.id}
        numColumns={2}
        ListHeaderComponent={Header}
        renderItem={({ item }) => <ItemCard item={item} />}
        columnWrapperStyle={{ gap: 12, paddingHorizontal: 12 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState icon="pricetag-outline" title="No listings yet" />}
      />
    </SafeAreaView>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View className="items-center">
      <Text className="text-ink text-lg font-extrabold">{value}</Text>
      <Text className="text-ink-faint text-xs">{label}</Text>
    </View>
  );
}

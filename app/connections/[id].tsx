import { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Avatar } from "@/components/Avatar";
import { StarRating } from "@/components/StarRating";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";

type Tab = "followers" | "following";

export default function Connections() {
  const { id, tab } = useLocalSearchParams<{ id: string; tab?: string }>();
  const [active, setActive] = useState<Tab>(tab === "following" ? "following" : "followers");
  const [loading, setLoading] = useState(true);
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    api
      .getConnections(id!)
      .then((res) => {
        if (!alive) return;
        setFollowers(res.followers ?? []);
        setFollowing(res.following ?? []);
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [id]);

  const data = active === "followers" ? followers : following;

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <View className="flex-row items-center px-4 py-3 border-b border-surface-border">
        <Pressable onPress={() => router.back()} hitSlop={8} className="pr-2">
          <Ionicons name="arrow-back" size={24} className="text-ink" />
        </Pressable>
        <Text className="text-lg font-extrabold text-ink">Connections</Text>
      </View>

      {/* Tabs */}
      <View className="flex-row border-b border-surface-border">
        {(["followers", "following"] as Tab[]).map((t) => (
          <Pressable key={t} onPress={() => setActive(t)} className="flex-1 items-center py-3">
            <Text className={`font-semibold capitalize ${active === t ? "text-ink" : "text-ink-faint"}`}>
              {t} {t === "followers" ? followers.length : following.length}
            </Text>
            {active === t && <View className="h-0.5 w-full bg-ink absolute bottom-0" />}
          </Pressable>
        ))}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#007782" />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(u) => u.id}
          contentContainerStyle={{ padding: 12, gap: 8 }}
          renderItem={({ item: u }) => <ConnectionRow user={u} />}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Ionicons name="people-outline" size={30} className="text-ink-faint" />
              <Text className="text-ink-faint mt-2">
                {active === "followers" ? "No followers yet" : "Not following anyone yet"}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

function ConnectionRow({ user }: { user: User }) {
  const currentUserId = useStore((s) => s.currentUserId);
  const isFollowing = useStore((s) => s.follows.includes(user.id));
  const toggleFollow = useStore((s) => s.toggleFollow);
  const isSelf = user.id === currentUserId;

  const open = () => router.push(isSelf ? "/(tabs)/profile" : (`/seller/${user.id}` as any));

  return (
    <Pressable onPress={open} className="flex-row items-center gap-3 bg-surface-alt rounded-xl p-3 active:opacity-80">
      <Avatar url={user.avatarUrl} name={user.username} size={44} />
      <View className="flex-1">
        <Text className="text-ink font-semibold" numberOfLines={1}>@{user.username}</Text>
        <StarRating rating={user.ratingAvg} size={12} showValue count={user.reviewCount} />
      </View>
      {!isSelf && (
        <Pressable
          onPress={() => toggleFollow(user.id)}
          className={`rounded-full px-4 py-1.5 ${isFollowing ? "border border-surface-border" : "bg-primary"}`}
        >
          <Text className={`text-sm font-semibold ${isFollowing ? "text-ink" : "text-white"}`}>
            {isFollowing ? "Following" : "Follow"}
          </Text>
        </Pressable>
      )}
    </Pressable>
  );
}

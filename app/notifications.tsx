import { useEffect } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Avatar } from "@/components/Avatar";
import { EmptyState } from "@/components/EmptyState";
import { useStore } from "@/lib/store";
import { timeAgo } from "@/lib/format";
import type { AppNotification, NotificationType } from "@/lib/types";

const ICON: Record<NotificationType, { name: keyof typeof Ionicons.glyphMap; color: string }> = {
  like: { name: "heart", color: "#FF6B6B" },
  offer: { name: "pricetag", color: "#007782" },
  sold: { name: "checkmark-circle", color: "#16A34A" },
  follow: { name: "person-add", color: "#007782" },
  review: { name: "star", color: "#F5A623" },
  system: { name: "megaphone", color: "#6B7280" },
};

export default function Notifications() {
  const notifications = useStore((s) => s.notifications);
  const markRead = useStore((s) => s.markNotificationsRead);
  const getUser = useStore((s) => s.getUser);

  // Mark everything read once the screen is opened.
  useEffect(() => {
    const t = setTimeout(markRead, 800);
    return () => clearTimeout(t);
  }, [markRead]);

  const open = (n: AppNotification) => {
    if (n.conversationId) router.push(`/chat/${n.conversationId}`);
    else if (n.itemId) router.push(`/item/${n.itemId}`);
    else if (n.actorId) router.push(`/seller/${n.actorId}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-row items-center px-4 py-3 border-b border-surface-border">
        <Pressable onPress={() => router.back()} hitSlop={8} className="pr-2">
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </Pressable>
        <Text className="text-lg font-extrabold text-ink">Notifications</Text>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(n) => n.id}
        ItemSeparatorComponent={() => <View className="h-px bg-surface-border ml-16" />}
        ListEmptyComponent={<EmptyState icon="notifications-outline" title="No notifications yet" />}
        renderItem={({ item: n }) => {
          const actor = n.actorId ? getUser(n.actorId) : undefined;
          const icon = ICON[n.type];
          return (
            <Pressable
              onPress={() => open(n)}
              className={`flex-row items-center px-4 py-3.5 ${n.read ? "bg-white" : "bg-primary-light/40"} active:bg-surface-alt`}
            >
              <View className="relative">
                {actor ? (
                  <Avatar url={actor.avatarUrl} name={actor.username} size={44} />
                ) : (
                  <View className="w-11 h-11 rounded-full bg-surface-alt items-center justify-center">
                    <Ionicons name={icon.name} size={22} color={icon.color} />
                  </View>
                )}
                {actor && (
                  <View className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                    <Ionicons name={icon.name} size={14} color={icon.color} />
                  </View>
                )}
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-ink text-sm" numberOfLines={2}>{n.body}</Text>
                <Text className="text-ink-faint text-xs mt-0.5">{timeAgo(n.createdAt)}</Text>
              </View>
              {!n.read && <View className="w-2.5 h-2.5 rounded-full bg-primary ml-2" />}
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

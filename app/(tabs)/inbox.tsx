import { View, Text, FlatList, Pressable } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Avatar } from "@/components/Avatar";
import { EmptyState } from "@/components/EmptyState";
import { useStore } from "@/lib/store";
import { timeAgo } from "@/lib/format";

export default function Inbox() {
  const conversations = useStore((s) => s.conversations);
  const currentUserId = useStore((s) => s.currentUserId);
  const getItem = useStore((s) => s.getItem);
  const getUser = useStore((s) => s.getUser);

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <View className="px-4 py-3 border-b border-surface-border">
        <Text className="text-2xl font-extrabold text-ink">Inbox</Text>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(c) => c.id}
        ItemSeparatorComponent={() => <View className="h-px bg-surface-border ml-20" />}
        ListEmptyComponent={
          <EmptyState
            icon="chatbubbles-outline"
            title="No messages yet"
            subtitle="When you buy or sell, your conversations show up here."
          />
        }
        renderItem={({ item: convo }) => {
          const otherId = convo.buyerId === currentUserId ? convo.sellerId : convo.buyerId;
          const other = getUser(otherId);
          const product = getItem(convo.itemId);
          return (
            <Pressable
              className="flex-row items-center px-4 py-3 active:bg-surface-alt"
              onPress={() => router.push(`/chat/${convo.id}`)}
            >
              <Avatar url={other?.avatarUrl} name={other?.username} size={48} />
              <View className="flex-1 ml-3">
                <View className="flex-row items-center justify-between">
                  <Text className={`text-ink ${convo.unread > 0 ? "font-extrabold" : "font-semibold"}`}>
                    {other?.username}
                  </Text>
                  <Text className={`text-xs ${convo.unread > 0 ? "text-primary-dark font-semibold" : "text-ink-faint"}`}>
                    {convo.lastMessageAt ? timeAgo(convo.lastMessageAt) : ""}
                  </Text>
                </View>
                <Text
                  className={`text-sm mt-0.5 ${convo.unread > 0 ? "text-ink font-semibold" : "text-ink-muted"}`}
                  numberOfLines={1}
                >
                  {convo.lastMessage ?? "Say hello 👋"}
                </Text>
                {product && (
                  <Text className="text-ink-faint text-xs mt-0.5" numberOfLines={1}>
                    Re: {product.title}
                  </Text>
                )}
              </View>
              {product && (
                <Image
                  source={{ uri: product.photos[0] }}
                  style={{ width: 44, height: 44, borderRadius: 8, marginLeft: 8 }}
                  contentFit="cover"
                />
              )}
              {convo.unread > 0 && (
                <View className="bg-primary rounded-full w-5 h-5 items-center justify-center ml-2">
                  <Text className="text-white text-xs font-bold">{convo.unread}</Text>
                </View>
              )}
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

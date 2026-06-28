import { useEffect, useMemo, useRef, useState } from "react";
import {
  View, Text, FlatList, Pressable, TextInput,
  KeyboardAvoidingView, Platform, Alert,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Avatar } from "@/components/Avatar";
import { useStore } from "@/lib/store";
import { formatPrice, timeAgo } from "@/lib/format";
import type { Message } from "@/lib/types";

export default function Chat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const convo = useStore((s) => s.conversations.find((c) => c.id === id));
  const currentUserId = useStore((s) => s.currentUserId);
  const allMessages = useStore((s) => s.messages);
  const messages = useMemo(() => allMessages.filter((m) => m.conversationId === id), [allMessages, id]);
  const sendMessage = useStore((s) => s.sendMessage);
  const sendOffer = useStore((s) => s.sendOffer);
  const respondOffer = useStore((s) => s.respondOffer);
  const getUser = useStore((s) => s.getUser);
  const getItem = useStore((s) => s.getItem);
  const loadMessages = useStore((s) => s.loadMessages);
  const [text, setText] = useState("");
  const listRef = useRef<FlatList<Message>>(null);

  // Load this conversation's messages from the API on open.
  useEffect(() => {
    if (id) loadMessages(id).catch(() => {});
  }, [id, loadMessages]);

  if (!convo) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-ink-muted">Conversation not found.</Text>
      </SafeAreaView>
    );
  }

  const otherId = convo.buyerId === currentUserId ? convo.sellerId : convo.buyerId;
  const other = getUser(otherId);
  const product = getItem(convo.itemId);
  const isSeller = convo.sellerId === currentUserId;

  const send = () => {
    if (!text.trim()) return;
    sendMessage(convo.id, text.trim());
    setText("");
  };

  const makeOffer = () => {
    Alert.prompt?.(
      "Make an offer",
      `Suggest a price for ${product?.title ?? "this item"}`,
      (value) => {
        const amount = parseFloat(value);
        if (amount > 0) sendOffer(convo.id, amount);
      },
      "plain-text",
      "",
      "numeric"
    );
    // Android fallback (Alert.prompt is iOS-only)
    if (Platform.OS !== "ios") {
      const base = product ? Math.round(product.price * 0.85) : 10;
      sendOffer(convo.id, base);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      {/* Header */}
      <View className="flex-row items-center px-3 py-2 border-b border-surface-border">
        <Pressable onPress={() => router.back()} hitSlop={8} className="pr-2">
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </Pressable>
        <Avatar url={other?.avatarUrl} name={other?.username} size={36} />
        <Text className="text-ink font-semibold ml-2 flex-1">{other?.username}</Text>
      </View>

      {/* Item banner */}
      {product && (
        <Pressable
          onPress={() => router.push(`/item/${product.id}`)}
          className="flex-row items-center gap-3 px-4 py-2.5 bg-surface-alt active:opacity-80"
        >
          <Image source={{ uri: product.photos[0] }} style={{ width: 40, height: 40, borderRadius: 8 }} contentFit="cover" />
          <View className="flex-1">
            <Text className="text-ink text-sm font-medium" numberOfLines={1}>{product.title}</Text>
            <Text className="text-ink-muted text-xs">{formatPrice(product.price)}</Text>
          </View>
          {!isSeller && product.status === "active" && (
            <Pressable onPress={() => router.push(`/checkout/${product.id}`)} className="bg-primary rounded-full px-4 py-1.5">
              <Text className="text-white text-sm font-semibold">Buy</Text>
            </Pressable>
          )}
        </Pressable>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        className="flex-1"
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          contentContainerStyle={{ padding: 12, gap: 8 }}
          ListHeaderComponent={
            <View className="flex-row items-start gap-2 bg-surface-alt rounded-xl p-3 mb-2">
              <Ionicons name="lock-closed" size={15} color="#6B7280" />
              <Text className="text-ink-faint text-xs flex-1 leading-4">
                For your safety, keep payments and conversations on Thrifted. Never share bank or card details.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Bubble
              message={item}
              mine={item.senderId === currentUserId}
              canRespond={isSeller && item.senderId !== currentUserId}
              onAccept={() => respondOffer(item.id, true)}
              onDecline={() => respondOffer(item.id, false)}
            />
          )}
        />

        {/* Composer */}
        <View className="flex-row items-center gap-2 px-3 py-2 border-t border-surface-border">
          <Pressable onPress={makeOffer} hitSlop={6} className="w-10 h-10 rounded-full bg-surface-alt items-center justify-center">
            <Ionicons name="pricetag-outline" size={20} color="#007782" />
          </Pressable>
          <TextInput
            placeholder="Message…"
            placeholderTextColor="#9CA3AF"
            value={text}
            onChangeText={setText}
            className="flex-1 bg-surface-alt rounded-full px-4 py-2.5 text-ink"
            onSubmitEditing={send}
          />
          <Pressable onPress={send} hitSlop={6} className="w-10 h-10 rounded-full bg-primary items-center justify-center">
            <Ionicons name="send" size={18} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Bubble({
  message, mine, canRespond, onAccept, onDecline,
}: {
  message: Message;
  mine: boolean;
  canRespond: boolean;
  onAccept: () => void;
  onDecline: () => void;
}) {
  if (message.type === "system") {
    return (
      <View className="self-center bg-surface-alt rounded-full px-3 py-1 my-1">
        <Text className="text-ink-faint text-xs">{message.body}</Text>
      </View>
    );
  }

  if (message.type === "offer") {
    return (
      <View className={`max-w-[80%] ${mine ? "self-end" : "self-start"}`}>
        <View className="bg-primary-light rounded-2xl p-3 border border-primary/30">
          <Text className="text-primary-dark text-xs font-semibold uppercase">Offer</Text>
          <Text className="text-ink text-xl font-extrabold mt-0.5">{formatPrice(message.offerAmount ?? 0)}</Text>
          {message.offerStatus === "accepted" && (
            <Text className="text-success text-xs font-semibold mt-1">✓ Accepted</Text>
          )}
          {message.offerStatus === "declined" && (
            <Text className="text-danger text-xs font-semibold mt-1">Declined</Text>
          )}
          {canRespond && message.offerStatus === "pending" && (
            <View className="flex-row gap-2 mt-2">
              <Pressable onPress={onAccept} className="bg-primary rounded-full px-4 py-1.5">
                <Text className="text-white text-sm font-semibold">Accept</Text>
              </Pressable>
              <Pressable onPress={onDecline} className="bg-white border border-surface-border rounded-full px-4 py-1.5">
                <Text className="text-ink text-sm font-semibold">Decline</Text>
              </Pressable>
            </View>
          )}
        </View>
        <Text className="text-ink-faint text-[10px] mt-1 px-1">{timeAgo(message.createdAt)}</Text>
      </View>
    );
  }

  return (
    <View className={`max-w-[80%] ${mine ? "self-end" : "self-start"}`}>
      <View className={`rounded-2xl px-4 py-2.5 ${mine ? "bg-primary" : "bg-surface-alt"}`}>
        <Text className={mine ? "text-white" : "text-ink"}>{message.body}</Text>
      </View>
      <Text className={`text-ink-faint text-[10px] mt-1 px-1 ${mine ? "text-right" : ""}`}>
        {timeAgo(message.createdAt)}
      </Text>
    </View>
  );
}

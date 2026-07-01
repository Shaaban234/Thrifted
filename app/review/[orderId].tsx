import { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { StarRating } from "@/components/StarRating";
import { useStore } from "@/lib/store";

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

export default function WriteReview() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const order = useStore((s) => s.orders.find((o) => o.id === orderId));
  const item = useStore((s) => (order ? s.getItem(order.itemId) : undefined));
  const seller = useStore((s) => (order ? s.getUser(order.sellerId) : undefined));
  const addReview = useStore((s) => s.addReview);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!order || !item) {
    return (
      <SafeAreaView className="flex-1 bg-surface items-center justify-center" edges={["top"]}>
        <Text className="text-ink-muted">Order not found.</Text>
      </SafeAreaView>
    );
  }

  const submit = () => {
    if (submitting) return;
    setSubmitting(true);
    addReview(order.sellerId, rating, comment.trim(), order.id);
    Alert.alert("Thank you!", `Your ${rating}★ review has been posted.`);
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <View className="flex-row items-center px-4 py-3 border-b border-surface-border">
        <Pressable onPress={() => router.back()} hitSlop={8} className="pr-2">
          <Ionicons name="arrow-back" size={24} className="text-ink" />
        </Pressable>
        <Text className="text-lg font-extrabold text-ink">Leave a review</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        {/* Who / what you're reviewing */}
        <View className="flex-row items-center gap-3 bg-surface-alt rounded-2xl p-3">
          <Image source={{ uri: item.photos[0] }} style={{ width: 48, height: 60, borderRadius: 8 }} contentFit="cover" />
          <View className="flex-1">
            <Text className="text-ink font-semibold" numberOfLines={1}>{item.title}</Text>
            <View className="flex-row items-center gap-1.5 mt-0.5">
              <Avatar url={seller?.avatarUrl} name={seller?.username} size={18} />
              <Text className="text-ink-muted text-sm">{seller?.username}</Text>
            </View>
          </View>
        </View>

        {/* Star picker */}
        <Text className="text-ink font-semibold mt-6 mb-2">How was it?</Text>
        <View className="items-center bg-surface-alt rounded-2xl py-6">
          <StarRating rating={rating} size={38} onChange={setRating} />
          <Text className="text-ink-muted mt-3 font-medium">{RATING_LABELS[rating]}</Text>
        </View>

        {/* Comment */}
        <Text className="text-ink font-semibold mt-6 mb-2">Add a comment (optional)</Text>
        <TextInput
          placeholder="Share how the item and the seller were…"
          placeholderTextColor="#9CA3AF"
          value={comment}
          onChangeText={setComment}
          multiline
          textAlignVertical="top"
          className="bg-surface-alt rounded-xl px-4 py-3.5 text-ink text-base min-h-[120px]"
        />

        <View className="mt-6">
          <Button label={submitting ? "Posting…" : "Post review"} icon="star" onPress={submit} loading={submitting} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

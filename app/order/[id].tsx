import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Button } from "@/components/Button";
import { useStore } from "@/lib/store";
import { formatPrice } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

type Step = { key: OrderStatus; label: string; icon: any; desc: string };

const stepsFor = (isCod: boolean): Step[] => [
  isCod
    ? { key: "paid", label: "Confirmed", icon: "receipt-outline", desc: "Pay cash on delivery" }
    : { key: "paid", label: "Paid", icon: "card", desc: "Payment held securely" },
  { key: "shipped", label: "Shipped", icon: "cube", desc: "Seller posted your item" },
  { key: "delivered", label: "Delivered", icon: "home", desc: "Parcel arrived" },
  isCod
    ? { key: "completed", label: "Completed", icon: "checkmark-done", desc: "Cash collected on delivery" }
    : { key: "completed", label: "Completed", icon: "checkmark-done", desc: "Funds released to seller" },
];

export default function OrderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const order = useStore((s) => s.orders.find((o) => o.id === id));
  const item = useStore((s) => (order ? s.getItem(order.itemId) : undefined));
  const seller = useStore((s) => (order ? s.getUser(order.sellerId) : undefined));
  const advanceOrder = useStore((s) => s.advanceOrder);
  const addReview = useStore((s) => s.addReview);

  if (!order || !item) {
    return (
      <SafeAreaView className="flex-1 bg-surface items-center justify-center">
        <Text className="text-ink-muted">Order not found.</Text>
      </SafeAreaView>
    );
  }

  const isCod = order.paymentMethod === "cod";
  const STEPS = stepsFor(isCod);
  const currentStep = STEPS.findIndex((s) => s.key === order.status);
  const isComplete = order.status === "completed";

  const leaveReview = () => {
    addReview(order.sellerId, 5, "Great item, smooth transaction!");
    Alert.alert("Thank you!", "Your 5★ review has been posted.");
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <View className="flex-row items-center px-4 py-3 border-b border-surface-border">
        <Pressable onPress={() => router.replace("/(tabs)")} hitSlop={8} className="pr-2">
          <Ionicons name="arrow-back" size={24} className="text-ink" />
        </Pressable>
        <Text className="text-lg font-extrabold text-ink">Order</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Success banner */}
        <View className="items-center py-4">
          <View className="bg-primary-light rounded-full w-16 h-16 items-center justify-center">
            <Ionicons name="checkmark-circle" size={40} color="#007782" />
          </View>
          <Text className="text-ink text-xl font-extrabold mt-3">Order confirmed!</Text>
          <Text className="text-ink-muted text-sm">Order #{order.id.toUpperCase()}</Text>
        </View>

        {/* Item */}
        <View className="flex-row items-center gap-3 bg-surface-alt rounded-2xl p-3">
          <Image source={{ uri: item.photos[0] }} style={{ width: 56, height: 70, borderRadius: 10 }} contentFit="cover" />
          <View className="flex-1">
            <Text className="text-ink font-semibold" numberOfLines={1}>{item.title}</Text>
            <Text className="text-ink-muted text-sm">from {seller?.username}</Text>
            <Text className="text-ink font-bold mt-0.5">{formatPrice(order.total)}</Text>
          </View>
          <View className="flex-row items-center gap-1 bg-surface rounded-full px-2.5 py-1 border border-surface-border">
            <Ionicons name={isCod ? "cash-outline" : "card-outline"} size={13} className="text-ink-muted" />
            <Text className="text-ink-muted text-xs font-medium">{isCod ? "COD" : "Card"}</Text>
          </View>
        </View>

        {/* Tracking */}
        <Text className="text-ink-muted text-xs font-semibold uppercase mt-6 mb-3">Tracking</Text>
        <View>
          {STEPS.map((step, idx) => {
            const done = idx <= currentStep;
            const active = idx === currentStep;
            return (
              <View key={step.key} className="flex-row">
                <View className="items-center mr-3">
                  <View className={`w-9 h-9 rounded-full items-center justify-center ${done ? "bg-primary" : "bg-surface-alt"}`}>
                    <Ionicons name={step.icon} size={18} color={done ? "#fff" : "#9CA3AF"} />
                  </View>
                  {idx < STEPS.length - 1 && (
                    <View className={`w-0.5 flex-1 my-1 ${idx < currentStep ? "bg-primary" : "bg-surface-border"}`} style={{ minHeight: 28 }} />
                  )}
                </View>
                <View className="flex-1 pb-4">
                  <Text className={`font-semibold ${done ? "text-ink" : "text-ink-faint"}`}>{step.label}</Text>
                  <Text className="text-ink-faint text-xs">{step.desc}</Text>
                  {active && !isComplete && (
                    <Text className="text-primary-dark text-xs font-medium mt-0.5">In progress…</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Actions */}
        <View className="mt-4 gap-3">
          {!isComplete && (
            <Button
              label={`Advance to "${STEPS[Math.min(currentStep + 1, STEPS.length - 1)].label}"`}
              variant="secondary"
              icon="play-forward-outline"
              onPress={() => advanceOrder(order.id)}
            />
          )}
          {isComplete && (
            <Button label="Leave a review" icon="star-outline" onPress={leaveReview} />
          )}
          <Button label="Back to home" variant="outline" onPress={() => router.replace("/(tabs)")} />
        </View>

        <Text className="text-ink-faint text-xs text-center mt-4">
          (Demo) Use “Advance” to simulate the shipping flow.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

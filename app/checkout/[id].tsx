import { useState } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Button } from "@/components/Button";
import { useStore } from "@/lib/store";
import { formatPrice, protectionFee, SHIPPING_FEE } from "@/lib/format";

export default function Checkout() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = useStore((s) => s.getItem(id!));
  const createOrder = useStore((s) => s.createOrder);
  const [paying, setPaying] = useState(false);

  if (!item) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-ink-muted">Item not found.</Text>
      </SafeAreaView>
    );
  }

  const fee = protectionFee(item.price);
  const total = Math.round((item.price + fee + SHIPPING_FEE) * 100) / 100;

  const pay = async () => {
    setPaying(true);
    // Mock payment. Replace with Stripe PaymentSheet later.
    try {
      const order = await createOrder(item.id);
      router.replace(`/order/${order.id}`);
    } catch (e: any) {
      Alert.alert("Payment failed", e?.message ?? "Please try again.");
      setPaying(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-surface-border">
        <Text className="text-lg font-extrabold text-ink">Checkout</Text>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="close" size={26} color="#1A1A1A" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        {/* Item summary */}
        <View className="flex-row items-center gap-3">
          <Image source={{ uri: item.photos[0] }} style={{ width: 72, height: 88, borderRadius: 10 }} contentFit="cover" />
          <View className="flex-1">
            <Text className="text-ink font-semibold" numberOfLines={2}>{item.title}</Text>
            <Text className="text-ink-muted text-sm mt-0.5">{item.brand} · {item.size}</Text>
            <Text className="text-ink font-bold mt-1">{formatPrice(item.price)}</Text>
          </View>
        </View>

        {/* Shipping */}
        <Section title="Delivery">
          <Row icon="location-outline" title="Musterstraße 12, 10115 Berlin" subtitle="Standard delivery · 2–4 working days" />
          <Row icon="cube-outline" title="DHL Packstation" subtitle="Tracked parcel" />
        </Section>

        {/* Payment */}
        <Section title="Payment">
          <Row icon="card-outline" title="Visa •••• 4242" subtitle="Mock payment method" />
        </Section>

        {/* Buyer protection */}
        <View className="bg-primary-light rounded-2xl p-4 mt-5 flex-row gap-3">
          <Ionicons name="shield-checkmark" size={22} color="#005A63" />
          <View className="flex-1">
            <Text className="text-primary-dark font-semibold">Buyer Protection included</Text>
            <Text className="text-ink-muted text-xs mt-0.5">
              Your money is held securely and only released to the seller once you confirm the item arrived as described.
            </Text>
          </View>
        </View>

        {/* Breakdown */}
        <Section title="Order summary">
          <Line label="Item" value={formatPrice(item.price)} />
          <Line label="Buyer Protection fee" value={formatPrice(fee)} />
          <Line label="Shipping" value={formatPrice(SHIPPING_FEE)} />
          <View className="h-px bg-surface-border my-2" />
          <Line label="Total" value={formatPrice(total)} bold />
        </Section>
      </ScrollView>

      <View className="px-4 py-3 border-t border-surface-border">
        <Button label={`Pay ${formatPrice(total)}`} icon="lock-closed" onPress={pay} loading={paying} />
      </View>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mt-6">
      <Text className="text-ink-muted text-xs font-semibold uppercase mb-2">{title}</Text>
      <View className="gap-2">{children}</View>
    </View>
  );
}

function Row({ icon, title, subtitle }: { icon: any; title: string; subtitle: string }) {
  return (
    <View className="flex-row items-center gap-3 bg-surface-alt rounded-xl p-3">
      <Ionicons name={icon} size={20} color="#6B7280" />
      <View className="flex-1">
        <Text className="text-ink font-medium">{title}</Text>
        <Text className="text-ink-faint text-xs">{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
    </View>
  );
}

function Line({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View className="flex-row justify-between">
      <Text className={bold ? "text-ink font-extrabold text-base" : "text-ink-muted"}>{label}</Text>
      <Text className={bold ? "text-ink font-extrabold text-base" : "text-ink"}>{value}</Text>
    </View>
  );
}

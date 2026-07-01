import { useState } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Button } from "@/components/Button";
import { useStore } from "@/lib/store";
import { formatPrice, protectionFee, SHIPPING_FEE } from "@/lib/format";

type PayMethod = "cod" | "card";

export default function Checkout() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = useStore((s) => s.getItem(id!));
  const createOrder = useStore((s) => s.createOrder);
  const currentUserId = useStore((s) => s.currentUserId);
  const me = useStore((s) => s.getUser(currentUserId));
  const [paying, setPaying] = useState(false);
  const [method, setMethod] = useState<PayMethod>("card");

  // Build a one-line address from the saved shipping details, if any.
  const addressParts = [me?.addressLine1, me?.addressLine2, me?.postalCode, me?.city, me?.country]
    .map((p) => p?.trim())
    .filter(Boolean);
  const hasAddress = addressParts.length > 0;

  if (!item) {
    return (
      <SafeAreaView className="flex-1 bg-surface items-center justify-center">
        <Text className="text-ink-muted">Item not found.</Text>
      </SafeAreaView>
    );
  }

  const fee = protectionFee(item.price);
  const total = Math.round((item.price + fee + SHIPPING_FEE) * 100) / 100;

  const pay = async () => {
    if (!hasAddress) {
      Alert.alert("Add a shipping address", "We need somewhere to send your order.", [
        { text: "Cancel", style: "cancel" },
        { text: "Add address", onPress: () => router.push("/shipping-address" as any) },
      ]);
      return;
    }
    setPaying(true);
    // Mock payment. Replace with Stripe PaymentSheet later.
    try {
      const order = await createOrder(item.id, method);
      router.replace(`/order/${order.id}`);
    } catch (e: any) {
      Alert.alert(method === "cod" ? "Couldn't place order" : "Payment failed", e?.message ?? "Please try again.");
      setPaying(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top", "bottom"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-surface-border">
        <Text className="text-lg font-extrabold text-ink">Checkout</Text>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="close" size={26} className="text-ink" />
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
          <Row
            icon="location-outline"
            title={hasAddress ? addressParts.join(", ") : "Add a shipping address"}
            subtitle={hasAddress ? `${me?.fullName ?? ""} · Standard delivery · 2–4 working days`.replace(/^ · /, "") : "Tap to add where we should ship"}
            onPress={() => router.push("/shipping-address" as any)}
          />
        </Section>

        {/* Payment */}
        <Section title="Payment">
          <PayOption
            icon="card-outline"
            title="Card payment"
            subtitle="Pay now · Visa •••• 4242 (mock)"
            selected={method === "card"}
            onPress={() => setMethod("card")}
          />
          <PayOption
            icon="cash-outline"
            title="Cash on Delivery"
            subtitle="Pay in cash when your parcel arrives"
            selected={method === "cod"}
            onPress={() => setMethod("cod")}
          />
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
        <Button
          label={method === "cod" ? `Place order · ${formatPrice(total)}` : `Pay ${formatPrice(total)}`}
          icon={method === "cod" ? "bag-check-outline" : "lock-closed"}
          onPress={pay}
          loading={paying}
        />
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

function Row({ icon, title, subtitle, onPress }: { icon: any; title: string; subtitle: string; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center gap-3 bg-surface-alt rounded-xl p-3 active:opacity-80"
    >
      <Ionicons name={icon} size={20} className="text-ink-muted" />
      <View className="flex-1">
        <Text className="text-ink font-medium" numberOfLines={2}>{title}</Text>
        <Text className="text-ink-faint text-xs">{subtitle}</Text>
      </View>
      {onPress && <Ionicons name="chevron-forward" size={18} className="text-ink-faint" />}
    </Pressable>
  );
}

function PayOption({
  icon, title, subtitle, selected, onPress,
}: { icon: any; title: string; subtitle: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center gap-3 rounded-xl p-3 border ${
        selected ? "border-primary bg-primary-light" : "border-surface-border bg-surface-alt"
      }`}
    >
      <Ionicons name={icon} size={20} color={selected ? "#007782" : "#6B7280"} />
      <View className="flex-1">
        <Text className={`font-medium ${selected ? "text-primary-dark" : "text-ink"}`}>{title}</Text>
        <Text className="text-ink-faint text-xs">{subtitle}</Text>
      </View>
      <Ionicons
        name={selected ? "radio-button-on" : "radio-button-off"}
        size={20}
        color={selected ? "#007782" : "#9CA3AF"}
      />
    </Pressable>
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

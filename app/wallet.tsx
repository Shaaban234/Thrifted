import { View, Text, FlatList, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { useStore } from "@/lib/store";
import { formatPrice, timeAgo } from "@/lib/format";
import type { WalletTransaction } from "@/lib/types";

const ICONS: Record<WalletTransaction["type"], any> = {
  sale: "arrow-down-circle",
  payout: "cash-outline",
  fee: "remove-circle",
  purchase: "bag-handle-outline",
};

export default function Wallet() {
  const wallet = useStore((s) => s.wallet);
  const balance = useStore((s) => s.walletBalance());

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <View className="flex-row items-center px-4 py-3 border-b border-surface-border">
        <Pressable onPress={() => router.back()} hitSlop={8} className="pr-2">
          <Ionicons name="arrow-back" size={24} className="text-ink" />
        </Pressable>
        <Text className="text-lg font-extrabold text-ink">Wallet</Text>
      </View>

      <FlatList
        data={wallet}
        keyExtractor={(t) => t.id}
        ListHeaderComponent={
          <View className="p-4">
            <View className="bg-primary rounded-2xl p-5">
              <Text className="text-white/80 text-sm">Available balance</Text>
              <Text className="text-white text-4xl font-extrabold mt-1">{formatPrice(balance)}</Text>
              <View className="mt-4">
                <Button
                  label="Withdraw to bank"
                  variant="secondary"
                  icon="cash-outline"
                  onPress={() => Alert.alert("Withdraw", "(Demo) Payouts will be enabled with real payments.")}
                />
              </View>
            </View>
            <Text className="text-ink-muted text-xs font-semibold uppercase mt-6 mb-1">
              Transactions
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="flex-row items-center px-4 py-3 border-b border-surface-border">
            <View className="w-10 h-10 rounded-full bg-surface-alt items-center justify-center">
              <Ionicons name={ICONS[item.type]} size={20} className="text-ink-muted" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-ink font-medium">{item.label}</Text>
              <Text className="text-ink-faint text-xs">{timeAgo(item.createdAt)}</Text>
            </View>
            <Text className={`font-bold ${item.amount >= 0 ? "text-success" : "text-ink"}`}>
              {item.amount >= 0 ? "+" : ""}
              {formatPrice(item.amount)}
            </Text>
          </View>
        )}
        ListEmptyComponent={<EmptyState icon="wallet-outline" title="No transactions yet" />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

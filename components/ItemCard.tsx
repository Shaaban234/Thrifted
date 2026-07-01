import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { Item } from "@/lib/types";
import { formatPrice, protectionFee } from "@/lib/format";
import { useStore } from "@/lib/store";

export function ItemCard({ item }: { item: Item }) {
  const isFavorite = useStore((s) => s.favorites.includes(item.id));
  const toggleFavorite = useStore((s) => s.toggleFavorite);
  const fee = protectionFee(item.price);

  return (
    <Pressable className="flex-1 mb-4" onPress={() => router.push(`/item/${item.id}`)}>
      <View className="relative rounded-lg overflow-hidden bg-surface-alt aspect-[3/4]">
        <Image
          source={{ uri: item.photos[0] }}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          transition={150}
        />
        {item.featured && item.status === "active" && (
          <View className="absolute top-2 left-2 flex-row items-center gap-1 bg-primary rounded-full px-2 py-0.5">
            <Ionicons name="star" size={10} color="#fff" />
            <Text className="text-white text-[10px] font-bold">Featured</Text>
          </View>
        )}
        <Pressable
          onPress={() => toggleFavorite(item.id)}
          hitSlop={8}
          className="absolute bottom-2 right-2 bg-surface rounded-full w-8 h-8 items-center justify-center"
          style={{ elevation: 2 }}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={17}
            color={isFavorite ? "#FF6B6B" : "#1A1A1A"}
          />
        </Pressable>
        {item.status !== "active" && (
          <View className="absolute bottom-0 left-0 right-0 bg-ink/75 py-1">
            <Text className="text-surface text-center text-xs font-semibold uppercase tracking-wide">
              {item.status === "sold" ? "Sold" : "Reserved"}
            </Text>
          </View>
        )}
      </View>

      <View className="mt-1.5 px-0.5">
        <Text className="text-ink text-sm" numberOfLines={1}>{item.brand}</Text>
        <Text className="text-ink-faint text-xs" numberOfLines={1}>
          {item.size} · {item.condition}
        </Text>
        <Text className="text-ink font-bold text-base mt-0.5">{formatPrice(item.price)}</Text>
        <View className="flex-row items-center gap-0.5">
          <Text className="text-primary-dark text-xs">{formatPrice(item.price + fee)} incl.</Text>
          <Ionicons name="shield-checkmark" size={11} color="#005A63" />
        </View>
      </View>
    </Pressable>
  );
}

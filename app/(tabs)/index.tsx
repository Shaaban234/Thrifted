import { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, FlatList, Pressable, ScrollView, useWindowDimensions, Alert } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ItemCard } from "@/components/ItemCard";
import { useStore } from "@/lib/store";
import { CATEGORIES, DESIGNER_BRANDS } from "@/lib/constants";

// Rotating hero banners (wardrobe / fashion themed).
const HERO_IMAGES = [
  "https://loremflickr.com/800/900/wardrobe,clothes,closet?lock=3",
  "https://loremflickr.com/800/900/fashion,clothing,rack?lock=7",
  "https://loremflickr.com/800/900/thrift,vintage,clothes?lock=51",
  "https://loremflickr.com/800/900/style,outfit,fashion?lock=88",
];

export default function Home() {
  const items = useStore((s) => s.items);
  const unread = useStore((s) => s.unreadNotifications());
  const [category, setCategory] = useState<string | null>(null);
  const { width } = useWindowDimensions();

  // Rotate the hero image every 5 seconds.
  const [heroIndex, setHeroIndex] = useState(0);
  const heroRef = useRef(0);
  useEffect(() => {
    const timer = setInterval(() => {
      heroRef.current = (heroRef.current + 1) % HERO_IMAGES.length;
      setHeroIndex(heroRef.current);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const visible = useMemo(
    () =>
      items.filter((i) => {
        if (!category) return true;
        if (category === "designer") return DESIGNER_BRANDS.includes(i.brand);
        return i.category === category;
      }),
    [items, category]
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Top bar: wordmark + menu */}
      <View className="flex-row items-center justify-between px-4 pt-1 pb-2">
        <Text className="text-2xl font-extrabold text-primary tracking-tight">Thrifted</Text>
        <View className="flex-row items-center gap-4">
          <Pressable onPress={() => router.push("/notifications")} hitSlop={8} className="relative">
            <Ionicons name="notifications-outline" size={26} color="#1A1A1A" />
            {unread > 0 && (
              <View className="absolute -top-1 -right-1 bg-accent rounded-full min-w-[16px] h-4 px-1 items-center justify-center">
                <Text className="text-white text-[10px] font-bold">{unread}</Text>
              </View>
            )}
          </Pressable>
          <Pressable onPress={() => router.push("/menu")} hitSlop={8}>
            <Ionicons name="menu" size={28} color="#1A1A1A" />
          </Pressable>
        </View>
      </View>

      {/* Catalog dropdown + search */}
      <View className="px-4 pb-2">
        <View className="flex-row items-center bg-surface-alt rounded-lg overflow-hidden">
          <Pressable
            onPress={() => router.push("/(tabs)/search")}
            className="flex-row items-center px-3 py-2.5 active:opacity-70"
          >
            <Text className="text-ink font-medium">Catalog</Text>
            <Ionicons name="chevron-down" size={16} color="#1A1A1A" style={{ marginLeft: 2 }} />
          </Pressable>
          <View className="w-px h-5 bg-surface-border" />
          <Pressable
            onPress={() => router.push("/(tabs)/search")}
            className="flex-1 flex-row items-center px-3 py-2.5 active:opacity-70"
          >
            <Ionicons name="search" size={18} color="#9CA3AF" />
            <Text className="text-ink-faint ml-2">Search for items</Text>
          </Pressable>
        </View>
      </View>

      {/* Category pills */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 10, gap: 8 }}
        >
          <CategoryPill label="All" active={!category} onPress={() => setCategory(null)} />
          {CATEGORIES.map((c) => (
            <CategoryPill
              key={c.key}
              label={c.label}
              active={category === c.key}
              onPress={() => setCategory(category === c.key ? null : c.key)}
            />
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={visible}
        keyExtractor={(i) => i.id}
        numColumns={2}
        renderItem={({ item }) => <ItemCard item={item} />}
        columnWrapperStyle={{ gap: 12, paddingHorizontal: 12 }}
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="mb-3">
            {/* Hero banner (rotates every 5s) */}
            <Image
              source={{ uri: HERO_IMAGES[heroIndex] }}
              style={{ width, height: 320 }}
              contentFit="cover"
              transition={500}
            />
            {/* Overlapping CTA card */}
            <View
              className="mx-4 -mt-20 bg-white rounded-2xl p-5"
              style={{
                shadowColor: "#000",
                shadowOpacity: 0.12,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
                elevation: 5,
              }}
            >
              <Text className="text-ink text-lg font-extrabold text-center">
                Ready to declutter your closet?
              </Text>
              <Pressable
                onPress={() => router.push("/(tabs)/sell")}
                className="bg-primary rounded-lg py-3.5 mt-4 active:opacity-80"
              >
                <Text className="text-white font-bold text-center text-base">Sell now</Text>
              </Pressable>
              <Pressable
                onPress={() => Alert.alert("How it works", "List an item in minutes, sell to buyers across the country, and ship with prepaid labels. Buyer Protection keeps every order safe.")}
                className="mt-3"
              >
                <Text className="text-primary-dark font-semibold text-center">Learn how it works</Text>
              </Pressable>
            </View>

            <Text className="text-ink-muted text-sm mt-5 px-4">
              {visible.length} items · newest first
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function CategoryPill({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full border px-4 py-1.5 ${
        active ? "border-primary bg-primary-light" : "border-surface-border bg-white"
      }`}
    >
      <Text className={`text-sm font-semibold ${active ? "text-primary-dark" : "text-ink"}`}>
        {label}
      </Text>
    </Pressable>
  );
}

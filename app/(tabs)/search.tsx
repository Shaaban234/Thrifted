import { useMemo } from "react";
import { View, Text, FlatList, TextInput, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ItemCard } from "@/components/ItemCard";
import { EmptyState } from "@/components/EmptyState";
import { useStore } from "@/lib/store";
import { CATEGORIES, DESIGNER_BRANDS, PRICE_RANGES } from "@/lib/constants";

export default function Search() {
  const items = useStore((s) => s.items);
  const filters = useStore((s) => s.filters);
  const setFilters = useStore((s) => s.setFilters);
  const activeCount = useStore((s) => s.activeFilterCount());

  const categoryLabel = CATEGORIES.find((c) => c.key === filters.category)?.label ?? null;

  const results = useMemo(() => {
    const f = filters;
    const q = f.query.trim().toLowerCase();
    const range = f.price ? PRICE_RANGES.find((r) => r.label === f.price) : null;

    let list = items.filter((i) => {
      if (q && !`${i.title} ${i.brand} ${i.description}`.toLowerCase().includes(q)) return false;
      if (f.category === "designer") {
        if (!DESIGNER_BRANDS.includes(i.brand)) return false;
      } else if (f.category && i.category !== f.category) return false;
      if (f.brand && i.brand !== f.brand) return false;
      if (f.size && i.size !== f.size) return false;
      if (f.condition && i.condition !== f.condition) return false;
      if (f.color && i.color !== f.color) return false;
      if (range && (i.price < range.min || i.price >= range.max)) return false;
      return true;
    });

    switch (f.sort) {
      case "price_asc": list = [...list].sort((a, b) => a.price - b.price); break;
      case "price_desc": list = [...list].sort((a, b) => b.price - a.price); break;
      case "newest": list = [...list].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)); break;
    }
    return list;
  }, [items, filters]);

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      {/* Search bar */}
      <View className="px-4 py-2">
        <View className="flex-row items-center bg-surface-alt rounded-lg px-3 py-2.5">
          <Ionicons name="search" size={18} className="text-ink-faint" />
          <TextInput
            placeholder={categoryLabel ? `Search in "${categoryLabel}"` : "Search for items"}
            placeholderTextColor="#9CA3AF"
            value={filters.query}
            onChangeText={(t) => setFilters({ query: t })}
            className="flex-1 ml-2 text-ink text-base"
          />
          {filters.query.length > 0 && (
            <Pressable onPress={() => setFilters({ query: "" })} hitSlop={6}>
              <Ionicons name="close-circle" size={18} className="text-ink-faint" />
            </Pressable>
          )}
        </View>
      </View>

      <FlatList
        data={results}
        keyExtractor={(i) => i.id}
        numColumns={2}
        renderItem={({ item }) => <ItemCard item={item} />}
        columnWrapperStyle={{ gap: 12, paddingHorizontal: 12 }}
        contentContainerStyle={{ paddingBottom: 16, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="px-4 pb-3">
            {categoryLabel && <Text className="text-ink-muted text-xs">{categoryLabel}</Text>}
            <Text className="text-2xl font-extrabold text-ink">
              {categoryLabel ?? (filters.query ? `"${filters.query}"` : "Search results")}
            </Text>
            <View className="flex-row items-center justify-between mt-2">
              <Text className="text-ink-muted text-sm">{results.length} results</Text>
              <Pressable
                onPress={() => router.push("/filter")}
                className="flex-row items-center gap-1.5 border border-primary rounded-full px-3.5 py-1.5 active:bg-primary-light"
              >
                <Ionicons name="options-outline" size={16} color="#005A63" />
                <Text className="text-primary-dark font-semibold text-sm">
                  Filters{activeCount > 0 ? ` (${activeCount})` : ""}
                </Text>
              </Pressable>
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState icon="search" title="No items found" subtitle="Try adjusting your search or filters." />
        }
      />
    </SafeAreaView>
  );
}

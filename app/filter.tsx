import { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useStore } from "@/lib/store";
import {
  CATEGORIES, BRANDS, SIZES, CONDITIONS, COLORS, PRICE_RANGES, SORT_OPTIONS,
} from "@/lib/constants";

type Option = { value: string | null; label: string };
const ALL: Option = { value: null, label: "All" };

export default function Filter() {
  const filters = useStore((s) => s.filters);
  const setFilters = useStore((s) => s.setFilters);
  const clearFilters = useStore((s) => s.clearFilters);
  const [expanded, setExpanded] = useState<string | null>(null);

  const categoryLabel = CATEGORIES.find((c) => c.key === filters.category)?.label ?? "All";
  const sortLabel = SORT_OPTIONS.find((o) => o.key === filters.sort)?.label ?? "Relevance";

  const rows: {
    field: keyof typeof filters;
    title: string;
    display: string;
    current: string | null;
    options: Option[];
  }[] = [
    { field: "sort", title: "Sort by", display: sortLabel, current: filters.sort, options: SORT_OPTIONS.map((o) => ({ value: o.key, label: o.label })) },
    { field: "category", title: "Category", display: categoryLabel, current: filters.category, options: [ALL, ...CATEGORIES.map((c) => ({ value: c.key, label: c.label }))] },
    { field: "size", title: "Size", display: filters.size ?? "All", current: filters.size, options: [ALL, ...SIZES.map((s) => ({ value: s, label: s }))] },
    { field: "brand", title: "Brand", display: filters.brand ?? "All", current: filters.brand, options: [ALL, ...BRANDS.map((b) => ({ value: b, label: b }))] },
    { field: "condition", title: "Condition", display: filters.condition ?? "All", current: filters.condition, options: [ALL, ...CONDITIONS.map((c) => ({ value: c, label: c }))] },
    { field: "color", title: "Colour", display: filters.color ?? "All", current: filters.color, options: [ALL, ...COLORS.map((c) => ({ value: c, label: c }))] },
    { field: "price", title: "Price", display: filters.price ?? "All", current: filters.price, options: [ALL, ...PRICE_RANGES.map((r) => ({ value: r.label, label: r.label }))] },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-surface-border">
        <Pressable onPress={() => router.back()} hitSlop={8} className="w-16">
          <Ionicons name="close" size={26} color="#1A1A1A" />
        </Pressable>
        <Text className="text-base font-bold text-ink">Filter</Text>
        <Pressable onPress={clearFilters} hitSlop={8} className="w-16 items-end">
          <Text className="text-primary-dark font-semibold">Clear all</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {rows.map((row) => {
          const open = expanded === row.field;
          return (
            <View key={row.field} className="border-b border-surface-border">
              <Pressable
                onPress={() => setExpanded(open ? null : row.field)}
                className="flex-row items-center justify-between px-4 py-4 active:bg-surface-alt"
              >
                <Text className="text-ink text-base">{row.title}</Text>
                <View className="flex-row items-center gap-1.5">
                  <Text className={row.current && row.field !== "sort" ? "text-primary-dark" : filters.sort !== "relevance" && row.field === "sort" ? "text-primary-dark" : "text-ink-muted"}>
                    {row.display}
                  </Text>
                  <Ionicons name={open ? "chevron-up" : "chevron-forward"} size={18} color="#9CA3AF" />
                </View>
              </Pressable>

              {open && (
                <View className="px-4 pb-3 flex-row flex-wrap gap-2">
                  {row.options.map((opt) => {
                    const selected = opt.value === row.current;
                    return (
                      <Pressable
                        key={opt.label}
                        onPress={() => {
                          setFilters({ [row.field]: opt.value } as any);
                          setExpanded(null);
                        }}
                        className={`rounded-full border px-4 py-2 ${
                          selected ? "border-primary bg-primary-light" : "border-surface-border bg-white"
                        }`}
                      >
                        <Text className={`text-sm font-medium ${selected ? "text-primary-dark" : "text-ink"}`}>
                          {opt.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Show results */}
      <View className="px-4 py-3 border-t border-surface-border">
        <Pressable onPress={() => router.back()} className="bg-primary rounded-lg py-3.5 active:opacity-80">
          <Text className="text-white font-bold text-center text-base">Show results</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

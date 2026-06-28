import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { ItemForm } from "@/components/ItemForm";
import { useStore } from "@/lib/store";

export default function EditItem() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = useStore((s) => s.getItem(id!));
  const updateItem = useStore((s) => s.updateItem);

  if (!item) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-ink-muted">Item not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-row items-center px-4 py-3 border-b border-surface-border">
        <Pressable onPress={() => router.back()} hitSlop={8} className="pr-2">
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </Pressable>
        <Text className="text-2xl font-extrabold text-ink">Edit listing</Text>
      </View>
      <ItemForm
        submitLabel="Save changes"
        initial={{
          photos: item.photos,
          title: item.title,
          description: item.description,
          category: item.category,
          brand: item.brand,
          size: item.size,
          condition: item.condition,
          color: item.color,
          price: item.price,
        }}
        onSubmit={(v) => {
          updateItem(item.id, {
            title: v.title,
            description: v.description,
            brand: v.brand,
            category: v.category,
            size: v.size,
            condition: v.condition,
            color: v.color,
            price: v.price,
            photos: v.photos,
          });
          router.back();
        }}
      />
    </SafeAreaView>
  );
}

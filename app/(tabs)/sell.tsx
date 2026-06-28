import { useState } from "react";
import { View, Text, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ItemForm } from "@/components/ItemForm";
import { useStore } from "@/lib/store";

export default function Sell() {
  const addItem = useStore((s) => s.addItem);
  const [uploading, setUploading] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="px-4 py-3 border-b border-surface-border">
        <Text className="text-2xl font-extrabold text-ink">Sell an item</Text>
      </View>
      <ItemForm
        submitLabel={uploading ? "Uploading…" : "Upload"}
        onSubmit={async (v) => {
          if (uploading) return;
          setUploading(true);
          try {
            const item = await addItem({
              title: v.title,
              description: v.description,
              brand: v.brand,
              category: v.category,
              size: v.size,
              condition: v.condition,
              color: v.color,
              price: v.price,
              photos: v.photos.length ? v.photos : ["https://loremflickr.com/600/800/clothes"],
            });
            router.push(`/item/${item.id}`);
          } catch (e: any) {
            Alert.alert("Upload failed", e?.message ?? "Please try again.");
          } finally {
            setUploading(false);
          }
        }}
      />
    </SafeAreaView>
  );
}

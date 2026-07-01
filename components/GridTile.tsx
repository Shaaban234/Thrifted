import { Pressable, View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { Item } from "@/lib/types";
import { formatPrice } from "@/lib/format";

// Instagram-style square grid tile: image-first, edge-to-edge, with subtle
// overlays for price, featured, multi-photo, and sold/reserved state.
export const GRID_GAP = 2;

export function GridTile({ item, size }: { item: Item; size: number }) {
  const inactive = item.status !== "active";
  return (
    <Pressable onPress={() => router.push(`/item/${item.id}`)} style={{ width: size, height: size }}>
      <Image
        source={{ uri: item.photos[0] }}
        style={{ width: size, height: size, backgroundColor: "#F5F6F7" }}
        contentFit="cover"
        transition={150}
      />

      {item.featured && (
        <View style={styles.star}>
          <Ionicons name="star" size={11} color="#fff" />
        </View>
      )}

      {item.photos.length > 1 && (
        <Ionicons name="copy" size={15} color="#fff" style={styles.stack} />
      )}

      {/* price chip */}
      <View style={styles.priceChip}>
        <Text style={styles.priceText}>{formatPrice(item.price)}</Text>
      </View>

      {inactive && (
        <View style={styles.dim}>
          <Text style={styles.dimText}>{item.status === "sold" ? "Sold" : "Reserved"}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  star: {
    position: "absolute",
    top: 5,
    left: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#007782",
    alignItems: "center",
    justifyContent: "center",
  },
  stack: {
    position: "absolute",
    top: 5,
    right: 5,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowRadius: 3,
  },
  priceChip: {
    position: "absolute",
    bottom: 5,
    left: 5,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  priceText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  dimText: { color: "#fff", fontSize: 12, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1 },
});

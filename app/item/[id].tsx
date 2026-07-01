import { useMemo } from "react";
import { View, Text, ScrollView, Pressable, useWindowDimensions, Share, Alert } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Avatar } from "@/components/Avatar";
import { StarRating } from "@/components/StarRating";
import { ItemCard } from "@/components/ItemCard";
import { useStore } from "@/lib/store";
import { formatPrice, protectionFee, timeAgo } from "@/lib/format";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function ItemDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const item = useStore((s) => s.getItem(id!));
  const currentUserId = useStore((s) => s.currentUserId);
  const isFavorite = useStore((s) => (item ? s.favorites.includes(item.id) : false));
  const toggleFavorite = useStore((s) => s.toggleFavorite);
  const seller = useStore((s) => (item ? s.getUser(item.sellerId) : undefined));
  const allItems = useStore((s) => s.items);
  const sellerItems = useMemo(
    () => (item ? allItems.filter((i) => i.sellerId === item.sellerId && i.id !== item.id) : []),
    [allItems, item]
  );
  const startConversation = useStore((s) => s.startConversation);
  const setItemStatus = useStore((s) => s.setItemStatus);
  const removeItem = useStore((s) => s.removeItem);

  if (!item || !seller) {
    return (
      <SafeAreaView className="flex-1 bg-surface items-center justify-center">
        <Text className="text-ink-muted">Item not found.</Text>
      </SafeAreaView>
    );
  }

  const isOwn = item.sellerId === currentUserId;
  const fee = protectionFee(item.price);
  const breadcrumb = [cap(item.category), item.subcategory].filter(Boolean).join("  /  ");

  const message = async () => {
    const convo = await startConversation(item.id);
    router.push(`/chat/${convo.id}`);
  };

  const shareItem = () => {
    Share.share({
      message: `Check out "${item.title}" for ${formatPrice(item.price)} on Thrifted!`,
    });
  };

  const confirmDelete = () => {
    Alert.alert("Delete listing", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => { removeItem(item.id); router.back(); } },
    ]);
  };

  const bigH = width * 0.82;
  const thumbH = width * 0.28;
  const bottomThumbs = item.photos.slice(3, 6);
  const memberPairs: (typeof sellerItems)[] = [];
  for (let i = 0; i < sellerItems.length; i += 2) memberPairs.push(sellerItems.slice(i, i + 2));

  return (
    <View className="flex-1 bg-surface">
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        {/* Photo collage */}
        <View className="relative">
          {/* Top: big left + up to 2 stacked right */}
          <View className="flex-row gap-1" style={{ height: bigH }}>
            <Image
              source={{ uri: item.photos[0] }}
              style={{ flex: item.photos.length > 1 ? 1.9 : 1, height: bigH }}
              contentFit="cover"
              transition={150}
            />
            {item.photos.length > 1 && (
              <View className="flex-1 gap-1">
                {item.photos.slice(1, 3).map((uri) => (
                  <Image key={uri} source={{ uri }} style={{ flex: 1, width: "100%" }} contentFit="cover" transition={150} />
                ))}
              </View>
            )}
          </View>

          {/* Bottom thumbnail row */}
          {bottomThumbs.length > 0 && (
            <View className="flex-row gap-1 mt-1" style={{ height: thumbH }}>
              {bottomThumbs.map((uri) => (
                <Image key={uri} source={{ uri }} style={{ flex: 1, height: thumbH }} contentFit="cover" transition={150} />
              ))}
              {/* pad so a single thumb doesn't stretch full width */}
              {bottomThumbs.length === 1 && <View className="flex-1" />}
              {bottomThumbs.length === 1 && <View className="flex-1" />}
            </View>
          )}

          {/* Overlay controls */}
          <SafeAreaView edges={["top"]} className="absolute top-0 left-0 right-0">
            <View className="flex-row justify-between px-3 pt-2">
              <IconBtn icon="arrow-back" onPress={() => router.back()} />
              <IconBtn icon="share-social-outline" onPress={shareItem} />
            </View>
          </SafeAreaView>

          {/* Heart + like count pill (over the big image) */}
          <Pressable
            onPress={() => toggleFavorite(item.id)}
            className="absolute bg-surface rounded-full flex-row items-center gap-1 px-3 py-2"
            style={{ top: bigH - 52, right: 12, elevation: 3 }}
          >
            <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={20} color={isFavorite ? "#FF6B6B" : "#1A1A1A"} />
            <Text className="text-ink text-sm font-semibold">{item.likes}</Text>
          </Pressable>
        </View>

        {/* Breadcrumb + report */}
        <View className="flex-row items-center justify-between px-4 pt-3">
          <Text className="text-ink-muted text-xs flex-1" numberOfLines={1}>{breadcrumb}</Text>
          <Pressable onPress={shareItem} hitSlop={8}>
            <Ionicons name="flag-outline" size={16} className="text-ink-faint" />
          </Pressable>
        </View>

        {/* Title + meta */}
        <View className="px-4 pt-1">
          <Text className="text-ink text-lg font-bold">{item.title}</Text>
          <Text className="text-ink-muted text-sm mt-1">
            {item.size} · {item.condition} ·{" "}
            <Text className="text-primary-dark">{item.brand}</Text>
          </Text>
          <Text className="text-ink-faint text-xs mt-0.5">Uploaded {timeAgo(item.createdAt)}</Text>

          {/* Price block */}
          <Text className="text-ink-faint text-sm mt-3" style={{ textDecorationLine: "line-through" }}>
            {formatPrice(item.price)}
          </Text>
          <Text className="text-primary-dark text-2xl font-extrabold mt-0.5">
            {formatPrice(item.price + fee)}
          </Text>
          <View className="flex-row items-center gap-1">
            <Text className="text-primary-dark text-sm">Includes Buyer Protection</Text>
            <Ionicons name="information-circle-outline" size={15} color="#005A63" />
          </View>
        </View>

        {/* Description */}
        {item.description ? (
          <Text className="text-ink leading-6 px-4 mt-4">{item.description}</Text>
        ) : null}

        {/* Detail rows */}
        <View className="px-4 mt-4">
          <DetailRow label="Brand" value={item.brand} link />
          <DetailRow label="Size" value={item.size} />
          <DetailRow label="Condition" value={item.condition} />
          <DetailRow label="Colour" value={item.color} />
        </View>

        {/* Shop and sell safely */}
        <View className="mx-4 mt-5 bg-surface-alt rounded-2xl p-4 flex-row gap-3">
          <Ionicons name="shield-checkmark-outline" size={22} color="#005A63" />
          <View className="flex-1">
            <Text className="text-ink font-bold">Shop and sell safely</Text>
            <Text className="text-ink-muted text-xs mt-0.5 leading-5">
              Your purchase is covered by our refund policy, secure transactions and support.
            </Text>
            <Text className="text-primary-dark text-xs font-semibold mt-1">How you're covered</Text>
          </View>
        </View>

        {/* Seller card */}
        <Pressable
          onPress={() => router.push(`/seller/${seller.id}`)}
          className="flex-row items-center px-4 mt-5 active:opacity-70"
        >
          <Avatar url={seller.avatarUrl} name={seller.username} size={48} />
          <View className="flex-1 ml-3">
            <Text className="text-ink font-semibold">{seller.username}</Text>
            <StarRating rating={seller.ratingAvg} size={13} showValue count={seller.reviewCount} />
          </View>
          <Ionicons name="chevron-forward" size={20} className="text-ink-faint" />
        </Pressable>

        {/* Trust rows */}
        <View className="px-4 mt-4 gap-3">
          <TrustRow icon="cloud-upload-outline" title="Frequent uploads" subtitle="Regularly lists new items." />
          <TrustRow icon="flash-outline" title="Speedy shipping" subtitle="Sends items promptly — usually within 24 hours." />
          <TrustRow icon="time-outline" title="Last seen 14 min ago" />
        </View>

        {/* Member's items */}
        {sellerItems.length > 0 && (
          <View className="mt-6">
            <Text className="text-ink font-bold px-4 mb-3">Member's items</Text>
            {memberPairs.map((pair, idx) => (
              <View key={idx} className="flex-row gap-3 px-3">
                {pair.map((it) => <ItemCard key={it.id} item={it} />)}
                {pair.length === 1 && <View className="flex-1" />}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom action bar */}
      <SafeAreaView edges={["bottom"]} className="absolute bottom-0 left-0 right-0 bg-surface border-t border-surface-border">
        {isOwn ? (
          <View className="px-4 py-3 gap-2">
            <View className="flex-row gap-2">
              {item.status !== "active" && (
                <ManageBtn label="Mark available" onPress={() => setItemStatus(item.id, "active")} />
              )}
              {item.status === "active" && (
                <ManageBtn label="Mark reserved" onPress={() => setItemStatus(item.id, "reserved")} />
              )}
              {item.status !== "sold" && (
                <ManageBtn label="Mark sold" primary onPress={() => setItemStatus(item.id, "sold")} />
              )}
            </View>
            <ManageBtn label="Edit listing" onPress={() => router.push({ pathname: "/edit/[id]", params: { id: item.id } })} />
            <Pressable onPress={confirmDelete} className="py-2 active:opacity-60">
              <Text className="text-danger font-semibold text-center">Delete listing</Text>
            </Pressable>
          </View>
        ) : item.status !== "active" ? (
          <View className="px-4 py-3">
            <View className="bg-surface-alt rounded-full py-3.5">
              <Text className="text-ink-muted font-semibold text-center">
                {item.status === "sold" ? "Sold" : "Reserved"}
              </Text>
            </View>
          </View>
        ) : (
          <View className="flex-row items-center gap-3 px-4 py-3">
            <Pressable onPress={message} className="flex-1 border border-primary rounded-full py-3.5 active:bg-primary-light">
              <Text className="text-primary-dark font-bold text-center">Make an offer</Text>
            </Pressable>
            <Pressable onPress={() => router.push(`/checkout/${item.id}`)} className="flex-1 bg-primary rounded-full py-3.5 active:opacity-80">
              <Text className="text-white font-bold text-center">Buy now</Text>
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

function IconBtn({ icon, onPress, color = "#1A1A1A" }: { icon: any; onPress: () => void; color?: string }) {
  return (
    <Pressable onPress={onPress} className="bg-surface/90 rounded-full w-10 h-10 items-center justify-center">
      <Ionicons name={icon} size={22} color={color} />
    </Pressable>
  );
}

function ManageBtn({ label, onPress, primary }: { label: string; onPress: () => void; primary?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 rounded-full py-3 ${primary ? "bg-primary active:opacity-80" : "border border-surface-border active:bg-surface-alt"}`}
    >
      <Text className={`font-semibold text-center ${primary ? "text-white" : "text-ink"}`}>{label}</Text>
    </Pressable>
  );
}

function DetailRow({ label, value, link }: { label: string; value: string; link?: boolean }) {
  return (
    <View className="flex-row justify-between py-2.5 border-b border-surface-border">
      <Text className="text-ink-muted">{label}</Text>
      <Text className={link ? "text-primary-dark font-medium" : "text-ink font-medium"}>{value}</Text>
    </View>
  );
}

function TrustRow({ icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) {
  return (
    <View className="flex-row items-center gap-3">
      <Ionicons name={icon} size={20} className="text-ink-muted" />
      <View className="flex-1">
        <Text className="text-ink text-sm font-medium">{title}</Text>
        {subtitle && <Text className="text-ink-faint text-xs">{subtitle}</Text>}
      </View>
    </View>
  );
}

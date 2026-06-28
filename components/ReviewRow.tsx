import { View, Text } from "react-native";
import { Avatar } from "./Avatar";
import { StarRating } from "./StarRating";
import { useStore } from "@/lib/store";
import { timeAgo } from "@/lib/format";
import type { Review } from "@/lib/types";

export function ReviewRow({ review }: { review: Review }) {
  const reviewer = useStore((s) => s.getUser(review.reviewerId));
  return (
    <View className="flex-row px-4 py-3 border-b border-surface-border">
      <Avatar url={reviewer?.avatarUrl} name={reviewer?.username} size={40} />
      <View className="flex-1 ml-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-ink font-semibold">{reviewer?.username ?? "user"}</Text>
          <Text className="text-ink-faint text-xs">{timeAgo(review.createdAt)}</Text>
        </View>
        <StarRating rating={review.rating} size={13} />
        <Text className="text-ink-muted text-sm mt-1">{review.comment}</Text>
      </View>
    </View>
  );
}

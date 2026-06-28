import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function StarRating({
  rating,
  size = 14,
  showValue = false,
  count,
  onChange,
}: {
  rating: number;
  size?: number;
  showValue?: boolean;
  count?: number;
  onChange?: (value: number) => void;
}) {
  return (
    <View className="flex-row items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const name =
          rating >= star ? "star" : rating >= star - 0.5 ? "star-half" : "star-outline";
        const node = (
          <Ionicons key={star} name={name} size={size} color="#F5A623" />
        );
        return onChange ? (
          <Pressable key={star} onPress={() => onChange(star)} hitSlop={6}>
            {node}
          </Pressable>
        ) : (
          node
        );
      })}
      {showValue && (
        <Text className="text-ink-muted text-xs ml-1">
          {rating.toFixed(1)}
          {count != null ? ` (${count})` : ""}
        </Text>
      )}
    </View>
  );
}

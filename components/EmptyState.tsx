import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function EmptyState({
  icon = "sad-outline",
  title,
  subtitle,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
}) {
  return (
    <View className="flex-1 items-center justify-center px-10 py-20">
      <Ionicons name={icon} size={48} color="#9CA3AF" />
      <Text className="text-ink font-semibold text-lg mt-4 text-center">{title}</Text>
      {subtitle && (
        <Text className="text-ink-muted text-center mt-1">{subtitle}</Text>
      )}
    </View>
  );
}

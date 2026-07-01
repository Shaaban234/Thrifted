import { Pressable, Text } from "react-native";

export function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full border px-4 py-2 ${
        active
          ? "bg-ink border-ink"
          : "bg-surface border-surface-border active:bg-surface-alt"
      }`}
    >
      <Text className={`text-sm font-medium ${active ? "text-surface" : "text-ink"}`}>
        {label}
      </Text>
    </Pressable>
  );
}

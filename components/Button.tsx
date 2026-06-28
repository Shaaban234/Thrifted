import { Pressable, Text, ActivityIndicator, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Variant = "primary" | "secondary" | "outline" | "ghost";

const styles: Record<Variant, { box: string; text: string }> = {
  primary: { box: "bg-primary", text: "text-white" },
  secondary: { box: "bg-surface-alt", text: "text-ink" },
  outline: { box: "bg-white border border-surface-border", text: "text-ink" },
  ghost: { box: "bg-transparent", text: "text-primary-dark" },
};

export function Button({
  label,
  onPress,
  variant = "primary",
  icon,
  loading,
  disabled,
  full = true,
}: {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  full?: boolean;
}) {
  const s = styles[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`${s.box} ${full ? "w-full" : ""} flex-row items-center justify-center rounded-full px-5 py-3.5 ${
        disabled ? "opacity-50" : "active:opacity-80"
      }`}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#fff" : "#007782"} />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon && (
            <Ionicons
              name={icon}
              size={18}
              color={variant === "primary" ? "#fff" : "#1A1A1A"}
            />
          )}
          <Text className={`${s.text} font-semibold text-base`}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

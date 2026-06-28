import { View, Text, TextInput, type TextInputProps } from "react-native";

export function TextField({
  label,
  error,
  ...props
}: TextInputProps & { label?: string; error?: string }) {
  return (
    <View className="w-full">
      {label && (
        <Text className="text-ink-muted text-sm font-medium mb-1.5">{label}</Text>
      )}
      <TextInput
        placeholderTextColor="#9CA3AF"
        className={`w-full bg-surface-alt rounded-xl px-4 py-3.5 text-ink text-base border ${
          error ? "border-danger" : "border-transparent"
        }`}
        {...props}
      />
      {error && <Text className="text-danger text-xs mt-1">{error}</Text>}
    </View>
  );
}

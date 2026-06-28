import { View, Text } from "react-native";
import { Image } from "expo-image";
import { initials } from "@/lib/format";

export function Avatar({
  url,
  name,
  size = 40,
}: {
  url?: string;
  name?: string;
  size?: number;
}) {
  return (
    <View
      className="bg-primary-light items-center justify-center overflow-hidden"
      style={{ width: size, height: size, borderRadius: size / 2 }}
    >
      {url ? (
        <Image
          source={{ uri: url }}
          style={{ width: size, height: size }}
          contentFit="cover"
          transition={150}
        />
      ) : (
        <Text className="text-primary-dark font-semibold" style={{ fontSize: size * 0.4 }}>
          {initials(name ?? "?")}
        </Text>
      )}
    </View>
  );
}

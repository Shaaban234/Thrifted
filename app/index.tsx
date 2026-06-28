import { View, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { useStore } from "@/lib/store";

export default function Index() {
  const booting = useStore((s) => s.booting);
  const isAuthenticated = useStore((s) => s.isAuthenticated);

  // Wait for session restore before deciding where to go.
  if (booting) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator color="#007782" />
      </View>
    );
  }
  return <Redirect href={isAuthenticated ? "/(tabs)" : "/(auth)/welcome"} />;
}

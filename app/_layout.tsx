import "@/global.css";
import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AnimatedSplash } from "@/components/AnimatedSplash";
import { useStore } from "@/lib/store";

export default function RootLayout() {
  const [splashDone, setSplashDone] = useState(false);
  const restoreSession = useStore((s) => s.restoreSession);

  // Restore a saved session (token) on launch.
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#fff" } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="item/[id]" options={{ presentation: "card" }} />
          <Stack.Screen name="seller/[id]" />
          <Stack.Screen name="edit/[id]" />
          <Stack.Screen name="chat/[id]" />
          <Stack.Screen name="checkout/[id]" options={{ presentation: "modal" }} />
          <Stack.Screen name="order/[id]" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="wallet" />
          <Stack.Screen name="notifications" />
          <Stack.Screen name="menu" options={{ presentation: "modal" }} />
          <Stack.Screen name="filter" options={{ presentation: "modal" }} />
        </Stack>
        {!splashDone && <AnimatedSplash onFinish={() => setSplashDone(true)} />}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
